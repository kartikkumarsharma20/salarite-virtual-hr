from datetime import datetime, timezone


def utc_now() -> datetime:
    """Return current UTC datetime timezone-aware."""
    return datetime.now(timezone.utc)


def format_iso(dt: datetime) -> str:
    """Format datetime as ISO 8601 string."""
    if dt is None:
        return ""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()
