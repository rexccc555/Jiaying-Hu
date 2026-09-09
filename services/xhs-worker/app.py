"""
Take a Day Off · 小红书云端发布 Worker
部署到 Railway 等常驻环境；主站通过 Bearer XHS_WORKER_SECRET 调用。
"""

from __future__ import annotations

import os
import secrets
import threading
import time
from pathlib import Path
from typing import Any

import requests
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure cutpost package is importable when running from services/xhs-worker
ROOT = Path(__file__).resolve().parents[2]
CUTPOST_ROOT = ROOT / "tools" / "cutpost"
import sys

if str(CUTPOST_ROOT) not in sys.path:
    sys.path.insert(0, str(CUTPOST_ROOT))

from cutpost import xhs  # noqa: E402
from cutpost.jobs import create_job, get_job, save_job, set_status  # noqa: E402
from cutpost.labels import status_label  # noqa: E402
from cutpost.paths import UPLOAD_DIR, ensure_data_dirs  # noqa: E402
from cutpost.service import confirm_xhs_job, run_preview_job  # noqa: E402

WORKER_SECRET = os.environ.get("XHS_WORKER_SECRET", "").strip()
LOGIN_SESSIONS: dict[str, dict[str, Any]] = {}

app = FastAPI(title="Take a Day Off XHS Worker", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _auth(authorization: str | None) -> None:
    if not WORKER_SECRET:
        raise HTTPException(500, "XHS_WORKER_SECRET not set on worker")
    if not authorization or authorization.removeprefix("Bearer ").strip() != WORKER_SECRET:
        raise HTTPException(401, "Unauthorized")


class LoginStart(BaseModel):
    userId: str
    locale: str = "zh"


class PublishBody(BaseModel):
    userId: str
    sessionBlob: str = ""
    title: str
    content: str
    tags: list[str] = Field(default_factory=list)
    imageUrls: list[str] = Field(default_factory=list)
    mode: str = "preview"


class ConfirmBody(BaseModel):
    userId: str
    sessionBlob: str = ""


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "xhs_engine": xhs.available(),
        "secret_configured": bool(WORKER_SECRET),
    }


@app.post("/v1/login/start")
def login_start(body: LoginStart, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    _auth(authorization)
    if not xhs.available():
        raise HTTPException(503, "Xiaohongshu engine not available in this container")
    session_id = secrets.token_urlsafe(16)
    LOGIN_SESSIONS[session_id] = {
        "userId": body.userId,
        "created": time.time(),
        "logged_in": False,
        "qrcode_data_url": None,
        "message": "starting",
        "sessionBlob": "",
    }

    def run() -> None:
        try:
            result = xhs.login_qrcode(account=body.userId)
            LOGIN_SESSIONS[session_id].update(
                {
                    "logged_in": bool(result.get("logged_in")),
                    "qrcode_data_url": result.get("qrcode_data_url"),
                    "message": result.get("message") or "",
                    "sessionBlob": result.get("session_blob") or result.get("account") or body.userId,
                }
            )
        except xhs.XhsError as exc:
            LOGIN_SESSIONS[session_id]["error"] = str(exc)
            LOGIN_SESSIONS[session_id]["message"] = str(exc)

    threading.Thread(target=run, daemon=True).start()
    return {"sessionId": session_id, "status": "pending"}


@app.get("/v1/login/status")
def login_status(
    sessionId: str,
    userId: str,
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    _auth(authorization)
    sess = LOGIN_SESSIONS.get(sessionId)
    if not sess or sess.get("userId") != userId:
        raise HTTPException(404, "session not found")

    # Refresh login check if QR already shown
    if not sess.get("logged_in") and xhs.available():
        try:
            check = xhs.check_login(force=True, account=userId)
            if check.get("logged_in"):
                sess["logged_in"] = True
                sess["sessionBlob"] = sess.get("sessionBlob") or userId
                sess["message"] = check.get("message") or "logged in"
        except xhs.XhsError as exc:
            sess["error"] = str(exc)

    return {
        "logged_in": bool(sess.get("logged_in")),
        "qrcode_data_url": sess.get("qrcode_data_url"),
        "message": sess.get("message"),
        "error": sess.get("error"),
        "sessionBlob": sess.get("sessionBlob") if sess.get("logged_in") else None,
    }


def _download_images(job_id: str, urls: list[str]) -> list[str]:
    ensure_data_dirs()
    folder = UPLOAD_DIR / job_id
    folder.mkdir(parents=True, exist_ok=True)
    paths: list[str] = []
    for i, url in enumerate(urls[:9]):
        try:
            r = requests.get(url, timeout=30)
            r.raise_for_status()
            ext = ".jpg"
            ctype = r.headers.get("content-type", "")
            if "png" in ctype:
                ext = ".png"
            elif "webp" in ctype:
                ext = ".webp"
            dest = folder / f"img_{i}{ext}"
            dest.write_bytes(r.content)
            paths.append(str(dest))
        except Exception:
            continue
    return paths


@app.post("/v1/jobs")
def create_publish_job(body: PublishBody, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    _auth(authorization)
    if body.mode != "preview":
        raise HTTPException(400, "use preview then confirm")
    ensure_data_dirs()
    job = create_job(
        {
            "title": body.title.strip(),
            "content": body.content.strip(),
            "tags": body.tags,
            "account": body.userId,
            "platforms": ["xiaohongshu"],
            "mode": "preview",
            "sessionBlob": body.sessionBlob,
        }
    )
    images = _download_images(job["id"], body.imageUrls)
    job["video"] = None
    job["images"] = images
    if not images:
        set_status(job, "failed")
        job["error"] = "没有可用配图，请重新生成草稿"
        save_job(job)
        return _public(job)
    save_job(job)
    threading.Thread(target=_run_preview, args=(job["id"],), daemon=True).start()
    return _public(job)


@app.get("/v1/jobs/{job_id}")
def job_detail(job_id: str, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    _auth(authorization)
    job = get_job(job_id)
    if not job:
        raise HTTPException(404, "job not found")
    return _public(job)


@app.post("/v1/jobs/{job_id}/confirm")
def confirm_job(
    job_id: str,
    body: ConfirmBody,
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    _auth(authorization)
    job = get_job(job_id)
    if not job:
        raise HTTPException(404, "job not found")
    if job.get("status") != "preview_ready":
        raise HTTPException(400, "preview not ready")
    set_status(job, "publishing")
    threading.Thread(target=_run_confirm, args=(job_id,), daemon=True).start()
    return _public(get_job(job_id) or job)


def _public(job: dict[str, Any]) -> dict[str, Any]:
    data = {
        "id": job.get("id"),
        "status": job.get("status"),
        "status_label": status_label(job.get("status") or ""),
        "logs": job.get("logs") or [],
        "error": job.get("error"),
    }
    return data


def _run_preview(job_id: str) -> None:
    job = get_job(job_id)
    if job:
        run_preview_job(job)


def _run_confirm(job_id: str) -> None:
    job = get_job(job_id)
    if job:
        confirm_xhs_job(job)


def main() -> None:
    import uvicorn

    port = int(os.environ.get("PORT", "8787"))
    ensure_data_dirs()
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")


if __name__ == "__main__":
    main()
