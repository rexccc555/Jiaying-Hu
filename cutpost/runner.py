from __future__ import annotations

import os
import subprocess
import sys
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
    try:
        for line in process.stdout:
            lines.append(line)
            if on_line:
                on_line(line.rstrip("\n"))
        returncode = process.wait(timeout=timeout)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait()
        raise
    output = "".join(lines)
    return CommandResult(returncode=returncode, stdout=output, stderr="")


def python_argv(*script_and_args: str) -> list[str]:
    return [sys.executable, *script_and_args]
