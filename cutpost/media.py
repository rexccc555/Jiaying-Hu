from __future__ import annotations

from pathlib import Path

IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}
VIDEO_SUFFIXES = {".mp4", ".mov", ".m4v", ".avi", ".mkv"}


def classify_names(names: list[str]) -> dict:
    videos: list[str] = []
    images: list[str] = []
    other: list[str] = []
    for raw in names:
        name = Path(raw).name
        suffix = Path(name).suffix.lower()
        if suffix in VIDEO_SUFFIXES:
            videos.append(name)
        elif suffix in IMAGE_SUFFIXES:
            images.append(name)
        elif name:
            other.append(name)
    error = None
    if other:
        error = f"不支持的文件：{', '.join(other)}"
    elif videos and images:
        error = "视频和图文请分开发，不要混在一次任务里"
    elif len(videos) > 1:
        error = "一次只发一个视频"
    elif not videos and not images:
        error = "请上传一个视频，或至少一张图片"
    return {
        "videos": videos,
        "images": images,
        "other": other,
        "error": error,
    }
