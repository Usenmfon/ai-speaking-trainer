from __future__ import annotations

import logging
from pathlib import Path


def configure_logging(worker_root: Path) -> None:
    log_dir = worker_root / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)

    logging.basicConfig(
        filename=log_dir / "worker.log",
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
        level=logging.INFO,
    )
