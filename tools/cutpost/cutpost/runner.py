from __future__ import annotations

import os
import subprocess
import sys
import threading
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path


@dataclass
class CommandResult:
    returncode: int
    stdout: str
    stderr: str

    @property
    def output(self) -> str:
        return "\n".join(part for part in (self.stdout, self.stderr) if part).strip()

    def contains(self, token: str) -> bool:
        return token in self.stdout or token in self.stderr


def run_command(
    argv: list[str],
    *,
    cwd: Path | None = None,
    timeout: int = 600,
    env: dict[str, str] | None = None,
    on_line: Callable[[str], None] | None = None,
) -> CommandResult:
    merged = os.environ.copy()
    merged["PYTHONIOENCODING"] = "utf-8"
    merged["PYTHONUTF8"] = "1"
    if env:
        merged.update(env)

    process = subprocess.Popen(
        argv,
        cwd=str(cwd) if cwd else None,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
        env=merged,
    )
    lines: list[str] = []
    assert process.stdout is not None

    def _reader() -> None:
        assert process.stdout is not None
        for line in process.stdout:
            lines.append(line)
            if on_line:
                on_line(line.rstrip("\n"))

    reader = threading.Thread(target=_reader, daemon=True)
    reader.start()
    reader.join(timeout=timeout)
    if reader.is_alive():
        process.kill()
        try:
            process.wait(timeout=5)
        except Exception:
            pass
        raise subprocess.TimeoutExpired(argv, timeout, output="".join(lines))

    returncode = process.wait(timeout=5)
    output = "".join(lines)
    return CommandResult(returncode=returncode, stdout=output, stderr="")


def python_argv(*script_and_args: str) -> list[str]:
    return [sys.executable, *script_and_args]
