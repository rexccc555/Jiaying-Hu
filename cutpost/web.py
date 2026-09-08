from __future__ import annotations

import os
import shutil
import threading
import webbrowser
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from cutpost import __version__, xhs
from cutpost.copy_adapt import adapt_all, parse_tags
from cutpost.jobs import create_job, get_job, list_jobs, save_job, set_status
from cutpost.labels import status_label
from cutpost.media import IMAGE_SUFFIXES, VIDEO_SUFFIXES, classify_names
from cutpost.paths import UPLOAD_DIR, WEB_DIR, ensure_data_dirs
from cutpost.ready import diagnose, probe_health
from cutpost.service import confirm_xhs_job, run_preview_job

DEFAULT_PORT = 1780


def create_app() -> FastAPI:
    ensure_data_dirs()
    app = FastAPI(title="CutPost", version=__version__)
    assets = WEB_DIR / "assets"
    if assets.is_dir():
        app.mount("/assets", StaticFiles(directory=assets), name="assets")

    @app.get("/")
    def index() -> FileResponse:
        return FileResponse(WEB_DIR / "index.html")

    @app.get("/favicon.ico")
    def favicon() -> FileResponse:
        path = WEB_DIR / "assets" / "favicon.svg"
        return FileResponse(path, media_type="image/svg+xml")

    @app.get("/api/health")
    def health() -> dict[str, Any]:
        ready = diagnose()
        return {
            "ok": True,
            "version": ready["version"],
            "python": ready["python"],
            "xhs": ready["engine"],
            "chrome": bool(ready["chrome"]),
        }

    @app.get("/api/ready")
    def ready() -> dict[str, Any]:
        return diagnose()

    @app.get("/api/status")
    def status(force: bool = False) -> dict[str, Any]:
        xhs_status: dict[str, Any] = {"available": xhs.available(), "logged_in": False}
        if xhs.available():
            try:
                xhs_status.update(xhs.check_login(force=force))
            except xhs.XhsError as exc:
                xhs_status["error"] = str(exc)
        return {"ready": diagnose(), "xiaohongshu": xhs_status}

    @app.post("/api/xhs/qrcode")
    def xhs_qrcode(account: str | None = None) -> dict[str, Any]:
        try:
            return xhs.login_qrcode(account=account)
        except xhs.XhsError as exc:
            raise HTTPException(500, str(exc)) from exc

    @app.post("/api/adapt")
    def adapt(payload: dict[str, Any]) -> dict[str, Any]:
        tags = parse_tags(payload.get("tags"))
        data = adapt_all(payload.get("title", ""), payload.get("content", ""), tags)
        return {name: item.__dict__ for name, item in data.items()}

    @app.get("/api/jobs")
    def jobs() -> list[dict[str, Any]]:
        return [_public_job(job) for job in list_jobs()]

    @app.get("/api/jobs/{job_id}")
    def job_detail(job_id: str) -> dict[str, Any]:
        job = get_job(job_id)
        if not job:
            raise HTTPException(404, "任务不存在")
        return _public_job(job)

    @app.post("/api/jobs")
    async def create_and_run(
        title: str = Form(...),
        content: str = Form(...),
        tags: str = Form(""),
        account: str = Form(""),
        mode: str = Form("preview"),
        files: list[UploadFile] = File(default=[]),
    ) -> dict[str, Any]:
        if mode != "preview":
            raise HTTPException(400, "网页试用只开放预览。看过草稿后，再点确认发布。")
        job = create_job(
            {
                "title": title.strip(),
                "content": content.strip(),
                "tags": parse_tags(tags),
                "account": account or None,
                "platforms": ["xiaohongshu"],
                "mode": "preview",
            }
        )
        saved = await _save_uploads(job["id"], files)
        job["video"] = saved["video"]
        job["images"] = saved["images"]
        save_job(job)
        thread = threading.Thread(target=_run_job_safe, args=(job["id"],), daemon=True)
        thread.start()
        return _public_job(job)

    @app.post("/api/jobs/{job_id}/confirm")
    def confirm(job_id: str) -> dict[str, Any]:
        job = get_job(job_id)
        if not job:
            raise HTTPException(404, "任务不存在")
        if job.get("status") != "preview_ready":
            raise HTTPException(400, "请先预览成功，再确认发布。")
        set_status(job, "publishing")
        thread = threading.Thread(target=_confirm_safe, args=(job_id,), daemon=True)
        thread.start()
        return _public_job(get_job(job_id) or job)

    return app


def _public_job(job: dict[str, Any]) -> dict[str, Any]:
    data = dict(job)
    data["status_label"] = status_label(job.get("status") or "")
    return data


def _run_job_safe(job_id: str) -> None:
    job = get_job(job_id)
    if job:
        run_preview_job(job)


def _confirm_safe(job_id: str) -> None:
    job = get_job(job_id)
    if job:
        confirm_xhs_job(job)


async def _save_uploads(job_id: str, files: list[UploadFile]) -> dict[str, Any]:
    names = [upload.filename or "" for upload in files]
    check = classify_names(names)
    if check["error"]:
        raise HTTPException(400, check["error"])
    folder = UPLOAD_DIR / job_id
    folder.mkdir(parents=True, exist_ok=True)
    video = None
    images: list[str] = []
    for upload in files:
        if not upload.filename:
            continue
        name = Path(upload.filename).name
        dest = folder / name
        with dest.open("wb") as handle:
            shutil.copyfileobj(upload.file, handle)
        suffix = Path(name).suffix.lower()
        if suffix in VIDEO_SUFFIXES:
            video = str(dest)
        elif suffix in IMAGE_SUFFIXES:
            images.append(str(dest))
    return {"video": video, "images": images}


def serve(host: str = "127.0.0.1", port: int = DEFAULT_PORT, open_browser: bool = True) -> None:
    import uvicorn

    url = f"http://{host}:{port}"
    if probe_health(host, port):
        print(f"CutPost 已经在运行：{url}")
        if open_browser:
            webbrowser.open(url)
        return

    ready = diagnose()
    if ready["issues"]:
        print("启动前检查：")
        for issue in ready["issues"]:
            print(f"  - {issue}")

    if open_browser and os.environ.get("CUTPOST_OPEN_BROWSER", "1") != "0":
        threading.Timer(0.9, lambda: webbrowser.open(url)).start()

    print(f"试用地址：{url}")
    print("默认只填表，不会偷偷发布。")
    uvicorn.run(create_app(), host=host, port=port, log_level="info")
