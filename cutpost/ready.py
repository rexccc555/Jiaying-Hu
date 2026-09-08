from __future__ import annotations

import os
import shutil
import socket
import sys

from cutpost import __version__, douyin, xhs
from cutpost.paths import XHS_SCRIPTS, VENDOR


def find_chrome() -> str | None:
    candidates: list[str] = []
    if sys.platform == "win32":
        for env_var in ("PROGRAMFILES", "PROGRAMFILES(X86)", "LOCALAPPDATA"):
            base = os.environ.get(env_var, "")
            if base:
                candidates.append(
                    os.path.join(base, "Google", "Chrome", "Application", "chrome.exe")
                )
    found = shutil.which("chrome") or shutil.which("chrome.exe") or shutil.which("google-chrome")
    if found:
        candidates.insert(0, found)
    for path in candidates:
        if path and os.path.isfile(path):
            return path
    return None


def port_open(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.4)
        try:
            sock.connect((host, port))
            return True
        except OSError:
            return False


def probe_health(host: str, port: int) -> bool:
    import urllib.error
    import urllib.request

    url = f"http://{host}:{port}/api/health"
    try:
        with urllib.request.urlopen(url, timeout=1.2) as response:
            return response.status == 200
    except (urllib.error.URLError, TimeoutError, OSError):
        return False


def diagnose() -> dict:
    chrome = find_chrome()
    engine = xhs.available()
    issues: list[str] = []
    if not chrome:
        issues.append("没有找到 Google Chrome。请安装官方 Chrome，不要只用 Edge。")
    if not engine:
        issues.append("缺少小红书发布引擎，请确认 vendor/XiaohongshuSkills 还在。")
    return {
        "ok": not issues,
        "version": __version__,
        "python": sys.version.split()[0],
        "chrome": chrome,
        "engine": engine,
        "douyin_engine": douyin.available(),
        "vendor": str(VENDOR),
        "scripts": str(XHS_SCRIPTS),
        "issues": issues,
        "limits": {
            "title": 20,
            "content": 1000,
            "tags": 10,
        },
    }
