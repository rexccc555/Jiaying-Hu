"""按平台裁标题、正文和话题，避免同一套文案直接甩出去。"""

from __future__ import annotations

from dataclasses import dataclass, field

XHS_TITLE_MAX = 20
XHS_CONTENT_MAX = 1000
XHS_TAG_MAX = 10
DOUYIN_TITLE_MAX = 30
DOUYIN_CONTENT_MAX = 1000
DOUYIN_TAG_MAX = 5


@dataclass
class AdaptedCopy:
    platform: str
    title: str
    content: str
    tags: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    content_with_tags: str = ""


def _clean_tags(tags: list[str], limit: int) -> tuple[list[str], list[str]]:
    cleaned: list[str] = []
    warnings: list[str] = []
    for raw in tags:
        tag = raw.strip().lstrip("#").replace(" ", "")
        if not tag:
            continue
        if tag not in cleaned:
            cleaned.append(tag)
    if len(cleaned) > limit:
        warnings.append(f"话题超过 {limit} 个，已截到前 {limit} 个")
        cleaned = cleaned[:limit]
    return cleaned, warnings


def _clip(text: str, limit: int, label: str) -> tuple[str, list[str]]:
    text = (text or "").strip()
    if len(text) <= limit:
        return text, []
    return text[:limit].rstrip(), [f"{label}超过 {limit} 字，已截断"]


def adapt_xiaohongshu(title: str, content: str, tags: list[str] | None = None) -> AdaptedCopy:
    tags = tags or []
    warnings: list[str] = []
    title, w = _clip(title, XHS_TITLE_MAX, "小红书标题")
    warnings.extend(w)
    content, w = _clip(content, XHS_CONTENT_MAX, "小红书正文")
    warnings.extend(w)
    tags, w = _clean_tags(tags, XHS_TAG_MAX)
    warnings.extend(w)
    tag_line = " ".join(f"#{t}" for t in tags)
    content_with_tags = f"{content}\n{tag_line}".strip() if tag_line else content
    return AdaptedCopy(
        platform="xiaohongshu",
        title=title,
        content=content,
        tags=tags,
        warnings=warnings,
        content_with_tags=content_with_tags,
    )


def adapt_douyin(title: str, content: str, tags: list[str] | None = None) -> AdaptedCopy:
    tags = tags or []
    warnings: list[str] = []
    title, w = _clip(title, DOUYIN_TITLE_MAX, "抖音标题")
    warnings.extend(w)
    content, w = _clip(content, DOUYIN_CONTENT_MAX, "抖音简介")
    warnings.extend(w)
    tags, w = _clean_tags(tags, DOUYIN_TAG_MAX)
    warnings.extend(w)
    return AdaptedCopy(
        platform="douyin",
        title=title,
        content=content,
        tags=tags,
        warnings=warnings,
        content_with_tags=content,
    )


def adapt_all(title: str, content: str, tags: list[str] | None = None) -> dict[str, AdaptedCopy]:
    return {
        "xiaohongshu": adapt_xiaohongshu(title, content, tags),
        "douyin": adapt_douyin(title, content, tags),
    }


def parse_tags(raw: str | list[str] | None) -> list[str]:
    if not raw:
        return []
    if isinstance(raw, list):
        parts = raw
    else:
        parts = raw.replace("，", ",").replace("#", " ").replace(" ", ",").split(",")
    return [p.strip() for p in parts if p.strip()]
