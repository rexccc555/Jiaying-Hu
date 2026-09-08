from __future__ import annotations

from collections.abc import Callable

from cutpost.copy_adapt import adapt_douyin, adapt_xiaohongshu
from cutpost.jobs import append_log, set_status
from cutpost import douyin, xhs


def run_preview_job(job: dict, on_line: Callable[[str], None] | None = None) -> dict:
    set_status(job, "running")

    def log(line: str) -> None:
        append_log(job, line)
        if on_line:
            on_line(line)

    adapted = adapt_xiaohongshu(job["title"], job["content"], job.get("tags") or [])
    job["adapted"] = {"xiaohongshu": adapted.__dict__}
    try:
        result = xhs.fill_or_publish(
            title=adapted.title,
            content=adapted.content_with_tags,
            video=job.get("video"),
            images=job.get("images") or None,
            account=job.get("account"),
            preview=True,
            on_line=log,
        )
    except xhs.XhsError as exc:
        set_status(job, "failed", error=str(exc))
        return job

    set_status(job, result["status"], engine=result)
    if result["status"] == "not_logged_in":
        job["error"] = "小红书未登录，请先扫码"
        set_status(job, "not_logged_in", error=job["error"])
    return job


def run_publish_job(job: dict, on_line: Callable[[str], None] | None = None) -> dict:
    set_status(job, "running")

    def log(line: str) -> None:
        append_log(job, line)
        if on_line:
            on_line(line)

    platforms = job.get("platforms") or ["xiaohongshu"]
    errors: list[str] = []

    if "xiaohongshu" in platforms:
        adapted = adapt_xiaohongshu(job["title"], job["content"], job.get("tags") or [])
        try:
            result = xhs.fill_or_publish(
                title=adapted.title,
                content=adapted.content_with_tags,
                video=job.get("video"),
                images=job.get("images") or None,
                account=job.get("account"),
                preview=False,
                on_line=log,
            )
            job.setdefault("engine", {})["xiaohongshu"] = result
            if result["status"] == "not_logged_in":
                errors.append("小红书未登录")
        except xhs.XhsError as exc:
            errors.append(f"小红书：{exc}")

    if "douyin" in platforms:
        if not job.get("video"):
            errors.append("抖音目前只支持视频，未提供视频文件")
        else:
            adapted = adapt_douyin(job["title"], job["content"], job.get("tags") or [])
            try:
                result = douyin.publish_video(
                    title=adapted.title,
                    content=adapted.content,
                    video=job["video"],
                    tags=adapted.tags,
                    account=job.get("account") or "default",
                    on_line=log,
                )
                job.setdefault("engine", {})["douyin"] = result
            except douyin.DouyinError as exc:
                errors.append(f"抖音：{exc}")

    if errors:
        set_status(job, "failed", error="；".join(errors))
    else:
        set_status(job, "published")
    return job


def confirm_xhs_job(job: dict, on_line: Callable[[str], None] | None = None) -> dict:
    set_status(job, "publishing")

    def log(line: str) -> None:
        append_log(job, line)
        if on_line:
            on_line(line)

    try:
        result = xhs.click_publish(account=job.get("account"), on_line=log)
    except xhs.XhsError as exc:
        set_status(job, "failed", error=str(exc))
        return job
    set_status(job, "published", engine=result)
    return job
