STATUS_LABELS = {
    "queued": "排队中",
    "running": "正在填表",
    "preview_ready": "待你确认",
    "publishing": "正在发布",
    "published": "已发布",
    "failed": "失败",
    "not_logged_in": "未登录",
}


def status_label(status: str) -> str:
    return STATUS_LABELS.get(status, status or "未知")


def api_error_message(payload: object, fallback: str = "请求失败") -> str:
    if payload is None:
        return fallback
    if isinstance(payload, str) and payload.strip():
        return payload
    if isinstance(payload, dict):
        for key in ("detail", "error", "message"):
            value = payload.get(key)
            if isinstance(value, str) and value.strip():
                return value
            if isinstance(value, list) and value:
                first = value[0]
                if isinstance(first, dict) and first.get("msg"):
                    return str(first["msg"])
                return str(first)
        return fallback
    if isinstance(payload, list) and payload:
        return api_error_message(payload[0], fallback)
    return fallback
