from __future__ import annotations

import json
import os
import subprocess
import threading
from collections.abc import Callable
from pathlib import Path

from cutpost.paths import XHS_SCRIPTS
from cutpost.runner import CommandResult, python_argv, run_command


def _want_headless() -> bool:
    """Cloud/Docker: headless Chrome. Local desktop: headed unless XHS_CHROME_HEADLESS=1."""
    v = os.environ.get("XHS_CHROME_HEADLESS", "").strip().lower()
    if v in ("1", "true", "yes"):
        return True
    if v in ("0", "false", "no"):
        return False
    return Path("/.dockerenv").exists()

LOGIN_CACHE = XHS_SCRIPTS.parent / "tmp" / "login_status_cache.json"

PIPELINE = XHS_SCRIPTS / "publish_pipeline.py"
CDP = XHS_SCRIPTS / "cdp_publish.py"
LAUNCHER = XHS_SCRIPTS / "chrome_launcher.py"

xhs_lock = threading.Lock()


class XhsError(RuntimeError):
    pass


def available() -> bool:
    return PIPELINE.is_file() and CDP.is_file()


def _run(
    argv: list[str],
    *,
    timeout: int = 600,
    on_line: Callable[[str], None] | None = None,
) -> CommandResult:
    if not available():
        raise XhsError("未找到 XiaohongshuSkills，请确认 vendor/XiaohongshuSkills 存在。")
    try:
        result = run_command(argv, cwd=XHS_SCRIPTS, timeout=timeout, on_line=on_line)
    except subprocess.TimeoutExpired as exc:
        raise XhsError("等太久了。请不要关掉弹出的 Chrome，再试一次。") from exc
    if "Chrome not found" in result.output or "Failed to start Chrome" in result.output:
        raise XhsError("没有找到 Google Chrome。请先安装官方 Chrome，不要只用 Edge。")
    return result


def clear_login_cache() -> None:
    try:
        LOGIN_CACHE.unlink(missing_ok=True)
    except OSError:
        pass


def check_login(account: str | None = None, *, force: bool = False) -> dict:
    if force:
        clear_login_cache()
    argv = python_argv(str(CDP), "check-login")
    if account:
        argv.extend(["--account", account])
    if _want_headless():
        argv.append("--headless")
    result = _run(argv, timeout=90)
    if result.returncode not in (0, 1):
        raise XhsError(result.output or "检查登录失败")
    logged_in = result.returncode == 0 and "NOT LOGGED IN" not in result.output
    return {
        "logged_in": logged_in,
        "output": result.output,
        "returncode": result.returncode,
    }


def login(account: str | None = None) -> dict:
    argv = python_argv(str(CDP), "login")
    if account:
        argv.extend(["--account", account])
    result = _run(argv, timeout=120)
    return {
        "ok": result.returncode == 0,
        "output": result.output,
        "message": "已打开小红书创作者登录页，请用手机扫码。",
    }


def login_qrcode(
    account: str | None = None,
    wait_seconds: float = 10.0,
    on_line: Callable[[str], None] | None = None,
) -> dict:
    clear_login_cache()
    restart = python_argv(str(LAUNCHER), "--restart")
    if account:
        restart.extend(["--account", account])
    if _want_headless():
        restart.append("--headless")
    try:
        restart_result = _run(restart, timeout=35, on_line=on_line)
    except subprocess.TimeoutExpired as exc:
        raise XhsError("启动浏览器超时。请稍后重试。") from exc
    argv = python_argv(str(CDP), "get-login-qrcode", "--wait-seconds", str(wait_seconds))
    if account:
        argv.extend(["--account", account])
    if _want_headless():
        argv.append("--headless")
    try:
        result = _run(argv, timeout=50, on_line=on_line)
    except subprocess.TimeoutExpired as exc:
        raise XhsError("获取登录二维码超时。请稍后重试。") from exc
    payload = _extract_json(result.stdout) or {}
    payload.setdefault("logged_in", False)
    if payload.get("logged_in"):
        payload["message"] = "已经是登录状态，可以直接预览。"
    elif payload.get("qrcode_data_url") or payload.get("qrcode_base64"):
        payload["message"] = "请用小红书 App 扫这个码。扫完后本页会自动检测。"
    else:
        hint = (result.output or "")[-500:]
        payload["message"] = "没有截到二维码，请重试。"
        if hint:
            payload["error"] = hint
    payload["output"] = result.output
    if restart_result.output and "exited early" in restart_result.output.lower():
        raise XhsError(restart_result.output[-800:])
    return payload


def fill_or_publish(
    *,
    title: str,
    content: str,
    video: str | None = None,
    images: list[str] | None = None,
    account: str | None = None,
    preview: bool = True,
    on_line: Callable[[str], None] | None = None,
) -> dict:
    if not title.strip() or not content.strip():
        raise XhsError("标题和正文不能为空")
    if bool(video) == bool(images):
        raise XhsError("请只选择一个视频，或一组图片")

    argv = python_argv(str(PIPELINE), "--title", title, "--content", content)
    if video:
        argv.extend(["--video", str(Path(video).resolve())])
    else:
        argv.append("--images")
        argv.extend(str(Path(p).resolve()) for p in (images or []))
    if account:
        argv.extend(["--account", account])
    if preview:
        argv.append("--preview")
    if _want_headless():
        argv.append("--headless")

    with xhs_lock:
        result = _run(argv, timeout=900, on_line=on_line)

    status = "failed"
    if result.contains("NOT_LOGGED_IN") or result.returncode == 1:
        status = "not_logged_in"
    elif result.contains("READY_TO_PUBLISH") and preview:
        status = "preview_ready"
    elif result.contains("PUBLISHED"):
        status = "published"
    elif result.returncode == 0:
        status = "preview_ready" if preview else "published"

    if status == "failed":
        raise XhsError(result.output or "小红书填表失败")

    return {
        "status": status,
        "preview": preview,
        "output": result.output,
        "returncode": result.returncode,
    }


def click_publish(account: str | None = None, on_line: Callable[[str], None] | None = None) -> dict:
    argv = python_argv(str(CDP), "click-publish")
    if account:
        argv.extend(["--account", account])
    if _want_headless():
        argv.append("--headless")
    with xhs_lock:
        result = _run(argv, timeout=180, on_line=on_line)
    if result.returncode != 0 or not result.contains("PUBLISHED"):
        raise XhsError(result.output or "点击发布失败，请看 Chrome 里的发布页是否还开着")
    return {"status": "published", "output": result.output}


def _extract_json(text: str) -> dict | None:
    marker = "GET_LOGIN_QRCODE_RESULT:"
    if marker not in text:
        return None
    raw = text.split(marker, 1)[1].strip()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        start = raw.find("{")
        end = raw.rfind("}")
        if start < 0 or end < 0:
            return None
        data = json.loads(raw[start : end + 1])
    return data if isinstance(data, dict) else None
