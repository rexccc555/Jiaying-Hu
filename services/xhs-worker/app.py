"""
Take a Day Off · 小红书云端发布 Worker
部署到 Railway 等常驻环境；主站通过 Bearer XHS_WORKER_SECRET 调用。
"""

from __future__ import annotations

import json
import os
import secrets
import threading
import time
import traceback
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
_SESS_LOCK = threading.Lock()
SESSION_DIR = Path(os.environ.get("XHS_SESSION_DIR", "/tmp/xhs-login-sessions"))


def _sess_path(session_id: str) -> Path:
    safe = "".join(c for c in session_id if c.isalnum() or c in "-_")
    return SESSION_DIR / f"{safe}.json"


def _save_session(session_id: str, data: dict[str, Any]) -> None:
    SESSION_DIR.mkdir(parents=True, exist_ok=True)
    payload = {**data}
    path = _sess_path(session_id)
    path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")


def _load_session(session_id: str) -> dict[str, Any] | None:
    with _SESS_LOCK:
        mem = LOGIN_SESSIONS.get(session_id)
        if mem is not None:
            return mem
    path = _sess_path(session_id)
    if not path.is_file():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            with _SESS_LOCK:
                LOGIN_SESSIONS[session_id] = data
            return data
    except Exception:
        return None
    return None


def _update_session(session_id: str, **fields: Any) -> None:
    with _SESS_LOCK:
        sess = LOGIN_SESSIONS.setdefault(session_id, {})
        sess.update(fields)
        snapshot = dict(sess)
    try:
        _save_session(session_id, snapshot)
    except Exception:
        pass

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
    _update_session(
        session_id,
        userId=body.userId,
        created=time.time(),
        logged_in=False,
        qrcode_data_url=None,
        message="正在打开浏览器获取二维码…",
        sessionBlob="",
        error=None,
    )

    def run() -> None:
        try:
            _update_session(session_id, message="正在启动 Chrome…")

            def on_line(line: str) -> None:
                text = (line or "").strip()
                if not text:
                    return
                # Keep UI feeling alive while launcher/cdp prints progress
                if len(text) > 160:
                    text = text[:157] + "…"
                _update_session(session_id, message=text)

            result = xhs.login_qrcode(account=body.userId, wait_seconds=10.0, on_line=on_line)
            qr = result.get("qrcode_data_url")
            if not qr and result.get("qrcode_base64"):
                qr = f"data:image/png;base64,{result['qrcode_base64']}"
            err = result.get("error")
            _update_session(
                session_id,
                logged_in=bool(result.get("logged_in")),
                qrcode_data_url=qr,
                message=result.get("message") or ("已获取二维码" if qr else "未获取到二维码"),
                sessionBlob=result.get("session_blob") or result.get("account") or body.userId,
                error=err,
            )
            if not qr and not result.get("logged_in"):
                _update_session(
                    session_id,
                    error=err or "no_qrcode",
                    message=result.get("message") or "未获取到二维码，请重试",
                )
        except xhs.XhsError as exc:
            _update_session(
                session_id,
                error=str(exc),
                message=str(exc),
                qrcode_data_url=None,
            )
        except Exception as exc:
            _update_session(
                session_id,
                error=str(exc),
                message=f"获取二维码失败：{exc}",
                qrcode_data_url=None,
            )
            print(f"[login] unexpected error:\n{traceback.format_exc()}", flush=True)

    threading.Thread(target=run, daemon=True).start()
    return {"sessionId": session_id, "status": "pending", "guestId": body.userId}


@app.get("/v1/login/status")
def login_status(
    sessionId: str,
    userId: str,
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    _auth(authorization)
    sess = _load_session(sessionId)
    if not sess:
        return {
            "logged_in": False,
            "qrcode_data_url": None,
            "message": "绑定会话不存在或已过期，请重新点扫码绑定",
            "error": "session_not_found",
            "sessionBlob": None,
        }
    if sess.get("userId") and sess.get("userId") != userId:
        return {
            "logged_in": False,
            "qrcode_data_url": None,
            "message": "访客身份不匹配，请重新点扫码绑定",
            "error": "user_mismatch",
            "sessionBlob": None,
        }

    # Refresh login check if QR already shown
    if not sess.get("logged_in") and xhs.available() and sess.get("qrcode_data_url"):
        try:
            check = xhs.check_login(force=True, account=userId)
            if check.get("logged_in"):
                _update_session(
                    sessionId,
                    logged_in=True,
                    sessionBlob=sess.get("sessionBlob") or userId,
                    message=check.get("message") or "已登录",
                    error=None,
                )
                sess = _load_session(sessionId) or sess
        except xhs.XhsError as exc:
            _update_session(sessionId, error=str(exc))
            sess = _load_session(sessionId) or sess

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
