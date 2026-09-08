from __future__ import annotations

import argparse
import json
from pathlib import Path

from cutpost import __version__, xhs
from cutpost.copy_adapt import adapt_all, parse_tags
from cutpost.jobs import create_job, list_jobs
from cutpost.service import run_preview_job, run_publish_job


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="cutpost",
        description="成片发布：默认填入小红书后台预览，确认后才点发布。",
    )
    parser.add_argument("--version", action="version", version=f"cut-post {__version__}")
    sub = parser.add_subparsers(dest="command", required=True)

    web = sub.add_parser("web", help="打开本地网页")
    web.add_argument("--host", default="127.0.0.1")
    web.add_argument("--port", type=int, default=1780)
    web.add_argument("--no-browser", action="store_true", help="不自动打开浏览器")

    status = sub.add_parser("status", help="查看小红书登录状态")
    status.add_argument("--account", default=None)
    login = sub.add_parser("login", help="打开小红书扫码登录")
    login.add_argument("--account", default=None)

    preview = sub.add_parser("preview", help="填入小红书后台，不点发布")
    _add_post_args(preview)

    publish = sub.add_parser("publish", help="填入并直接发布（危险，需 --yes）")
    _add_post_args(publish)
    publish.add_argument("--yes", action="store_true", help="确认要真正点发布")
    publish.add_argument("--douyin", action="store_true", help="同时发抖音（会真正发布）")

    confirm = sub.add_parser("confirm", help="对当前已填好的小红书页面点击发布")
    confirm.add_argument("--account", default=None)

    adapt = sub.add_parser("adapt", help="预览平台文案裁剪结果")
    adapt.add_argument("--title", required=True)
    adapt.add_argument("--content", required=True)
    adapt.add_argument("--tags", default="")

    sub.add_parser("jobs", help="查看最近任务")

    args = parser.parse_args(argv)

    if args.command == "web":
        from cutpost.web import serve

        serve(host=args.host, port=args.port, open_browser=not args.no_browser)
        return 0

    if args.command == "status":
        info = xhs.check_login(args.account)
        print("已登录" if info["logged_in"] else "未登录")
        if info.get("output"):
            print(info["output"])
        return 0 if info["logged_in"] else 1

    if args.command == "login":
        result = xhs.login(account=args.account)
        print(result["message"])
        print(result.get("output", ""))
        return 0 if result["ok"] else 1

    if args.command == "adapt":
        tags = parse_tags(args.tags)
        data = adapt_all(args.title, args.content, tags)
        print(json.dumps({k: v.__dict__ for k, v in data.items()}, ensure_ascii=False, indent=2))
        return 0

    if args.command == "jobs":
        for job in list_jobs(20):
            print(f"{job['id']}\t{job['status']}\t{job.get('title', '')}")
        return 0

    if args.command == "confirm":
        result = xhs.click_publish(account=args.account)
        print("已点击发布。")
        print(result.get("output", ""))
        return 0

    if args.command in {"preview", "publish"}:
        video = str(args.video) if args.video else None
        images = [str(p) for p in (args.images or [])]
        tags = parse_tags(args.tags)
        if args.command == "publish" and not args.yes:
            print("直接发布会点小红书的发布按钮。确认请加上 --yes")
            return 2
        job = create_job(
            {
                "title": args.title,
                "content": args.content,
                "tags": tags,
                "video": video,
                "images": images,
                "account": args.account,
                "platforms": ["xiaohongshu"] + (["douyin"] if args.command == "publish" and args.douyin else []),
                "mode": args.command,
            }
        )

        def log(line: str) -> None:
            print(line)

        if args.command == "preview":
            result = run_preview_job(job, on_line=log)
        else:
            result = run_publish_job(job, on_line=log)
        print(json.dumps({k: result.get(k) for k in ("id", "status", "error")}, ensure_ascii=False, indent=2))
        return 0 if result["status"] in {"preview_ready", "published"} else 1

    return 2


def _add_post_args(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--title", required=True)
    parser.add_argument("--content", required=True)
    parser.add_argument("--tags", default="")
    parser.add_argument("--account", default=None)
    media = parser.add_mutually_exclusive_group(required=True)
    media.add_argument("--video", type=Path)
    media.add_argument("--images", nargs="+", type=Path)


if __name__ == "__main__":
    raise SystemExit(main())
