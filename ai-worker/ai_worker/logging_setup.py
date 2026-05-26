from __future__ import annotations

import logging
import os
from pathlib import Path


def configure_logging(worker_root: Path) -> None:
    log_dir = worker_root / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    level_name = os.getenv("AI_WORKER_LOG_LEVEL", "info").upper()
    level = getattr(logging, level_name, logging.INFO)

    logging.basicConfig(
        filename=log_dir / "worker.log",
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
        level=level,
    )
