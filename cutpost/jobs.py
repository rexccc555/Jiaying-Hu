from __future__ import annotations

import json
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from cutpost.paths import JOB_DIR, ensure_data_dirs

_lock = threading.Lock()


def _now() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")


def _job_path(job_id: str) -> Path:
    return JOB_DIR / f"{job_id}.json"


def create_job(payload: dict[str, Any]) -> dict[str, Any]:
    ensure_data_dirs()
    job_id = uuid.uuid4().hex[:12]
    job = {
        "id": job_id,
        "status": "queued",
        "created_at": _now(),
        "updated_at": _now(),
        "logs": [],
        **payload,
    }
    save_job(job)
    return job


def save_job(job: dict[str, Any]) -> None:
    ensure_data_dirs()
    job["updated_at"] = _now()
    path = _job_path(job["id"])
    with _lock:
        path.write_text(json.dumps(job, ensure_ascii=False, indent=2), encoding="utf-8")


def get_job(job_id: str) -> dict[str, Any] | None:
    path = _job_path(job_id)
    if not path.is_file():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def list_jobs(limit: int = 30) -> list[dict[str, Any]]:
    ensure_data_dirs()
    files = sorted(JOB_DIR.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True)
    jobs = []
    for path in files[:limit]:
        try:
            jobs.append(json.loads(path.read_text(encoding="utf-8")))
        except json.JSONDecodeError:
            continue
    return jobs


def append_log(job: dict[str, Any], line: str) -> None:
    text = line.rstrip()
    if not text:
        return
    job.setdefault("logs", []).append(text)
    save_job(job)


def set_status(job: dict[str, Any], status: str, **extra: Any) -> None:
    job["status"] = status
    job.update(extra)
    save_job(job)
