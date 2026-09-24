from datetime import datetime, timezone
import logging
from pathlib import Path
import sys
import time
from threading import Lock


_LOGGER_NAME = "emergence"
_LOGGER_INITIALIZED_ATTRIBUTE = "_emergence_initialized"
_LOGGER_INITIALIZATION_LOCK = Lock()


def get_logger() -> logging.Logger:
    """Return the application logger configured for terminal and file output."""
    logger = logging.getLogger(_LOGGER_NAME)

    if getattr(logger, _LOGGER_INITIALIZED_ATTRIBUTE, False):
        return logger

    with _LOGGER_INITIALIZATION_LOCK:
        if getattr(logger, _LOGGER_INITIALIZED_ATTRIBUTE, False):
            return logger

        logger.setLevel(logging.DEBUG)
        logger.propagate = False

        logs_directory = (
            Path.home()
            / "github.com"
            / "loicbourgois"
            / "loicbourgois"
            / "emergence"
            / "logs"
        )
        logs_directory.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.now(timezone.utc)
        log_file = logs_directory / timestamp.strftime("%Y-%m-%d-%H-%M-%S.txt")
        latest_log_file = logs_directory / "_latest.txt"

        formatter = logging.Formatter(
            fmt="%(asctime)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S UTC",
        )
        formatter.converter = time.gmtime

        terminal_handler = logging.StreamHandler(sys.stdout)
        terminal_handler.setLevel(logging.DEBUG)
        terminal_handler.setFormatter(formatter)

        file_handler = logging.FileHandler(log_file, encoding="utf-8")
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(formatter)

        latest_file_handler = logging.FileHandler(
            latest_log_file,
            mode="w",
            encoding="utf-8",
        )
        latest_file_handler.setLevel(logging.DEBUG)
        latest_file_handler.setFormatter(formatter)

        logger.addHandler(terminal_handler)
        logger.addHandler(file_handler)
        logger.addHandler(latest_file_handler)

        setattr(logger, _LOGGER_INITIALIZED_ATTRIBUTE, True)

    return logger


def time_gmtime(timestamp: float):
    """Return UTC time for logging.Formatter."""
    import time

    return time.gmtime(timestamp)
