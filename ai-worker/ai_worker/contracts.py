from __future__ import annotations

from datetime import UTC, datetime
from typing import Any


def success_response(task: str, data: dict[str, Any], meta: dict[str, Any] | None = None) -> dict[str, Any]:
    return {
        "ok": True,
        "task": task,
        "data": data,
        "errors": [],
        "meta": {
            "schema_version": "2026-05-26",
            "generated_at": datetime.now(UTC).isoformat(),
            **(meta or {}),
        },
    }


def error_response(task: str, message: str, code: str = "worker_error") -> dict[str, Any]:
    return {
        "ok": False,
        "task": task,
        "data": {},
        "errors": [
            {
                "code": code,
                "message": message,
            },
        ],
        "meta": {
            "schema_version": "2026-05-26",
            "generated_at": datetime.now(UTC).isoformat(),
        },
    }
