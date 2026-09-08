from __future__ import annotations

import sys
from collections.abc import Callable
from pathlib import Path

from cutpost.paths import SAU_ROOT
from cutpost.runner import python_argv, run_command

SAU_CLI = SAU_ROOT / "sau_cli.py"


class DouyinError(RuntimeError):
    pass


def available() -> bool:
    return SAU_CLI.is_file()


def python_ok() -> bool:
    return sys.version_info < (3, 13)


def _run(argv: list[str], timeout: int = 900, on_line: Callable[[str], None] | None = None):
    if not available():
        raise DouyinError("未找到 social-auto-upload，请确认 vendor/social-auto-upload 存在。")
    if not python_ok():
        raise DouyinError(
            f"当前 Python {sys.version_info.major}.{sys.version_info.minor} 不适合跑抖音上传。"
            "social-auto-upload 需要 Python 3.10–3.12。"
        )
    return run_command(argv, cwd=SAU_ROOT, timeout=timeout, on_line=on_line)


def login(account: str = "default") -> dict:
    result = _run(
        python_argv(str(SAU_CLI), "douyin", "login", "--account", account, "--headed"),
        timeout=180,
    )
    return {"ok": result.returncode == 0, "output": result.output}


def check(account: str = "default") -> dict:
    result = _run(
        python_argv(str(SAU_CLI), "douyin", "check", "--account", account),
        timeout=90,
    )
    valid = result.returncode == 0 and "invalid" not in result.output.lower()
    return {"logged_in": valid, "output": result.output, "returncode": result.returncode}


def publish_video(
    *,
    title: str,
    content: str,
    video: str,
    tags: list[str] | None = None,
    account: str = "default",
    on_line: Callable[[str], None] | None = None,
) -> dict:
    argv = python_argv(
        str(SAU_CLI),
        "douyin",
        "upload-video",
        "--account",
        account,
        "--file",
        str(Path(video).resolve()),
        "--title",
        title,
        "--desc",
        content,
        "--headed",
    )
    if tags:
        argv.extend(["--tags", ",".join(tags)])
    result = _run(argv, timeout=900, on_line=on_line)
    if result.returncode != 0:
        raise DouyinError(result.output or "抖音发布失败")
    return {"status": "published", "output": result.output}
