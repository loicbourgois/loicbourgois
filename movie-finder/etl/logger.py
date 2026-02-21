import logging
import os

old_factory = logging.getLogRecordFactory()


def record_factory(*args, **kwargs):
    record = old_factory(*args, **kwargs)
    ln = f"{record.levelname}"
    grey = "\x1b[38;20m"
    yellow = "\x1b[33;20m"
    red = "\x1b[31;20m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    for _i in range(max(0, 7 - len(ln))):
        ln += " "
    ln2 = {
        "DEBUG": grey + ln + reset,
        "INFO": grey + ln + reset,
        "WARNING": yellow + ln + reset,
        "ERROR": red + ln + reset,
        "CRITICAL": bold_red + ln + reset,
    }[record.levelname]
    path = f"{record.pathname}/{record.funcName}()/{record.lineno}"
    size = 42
    if len(path) < size:
        for _i in range(max(0, size - len(path))):
            path += " "
    else:
        path = "..." + path[len(path) - size + 2 :]
    record.custom_prefix = f"{ln} · {path}"
    record.custom_prefix_2 = f"{ln2} · {path}"
    return record


logging.setLogRecordFactory(record_factory)


def set_up_logger(name):
    os.environ["logger_name"] = name


def get_logger(name=None):
    if name is None:
        name = os.environ.get("logger_name", "default_logger")
    logger = logging.getLogger(name)
    if len(logger.handlers) > 0:
        return logger
    logger.propagate = False
    logger.setLevel(logging.DEBUG)
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter("%(asctime)s · %(custom_prefix_2)s · %(message)s"))
    logger.addHandler(console_handler)
    return logger


set_up_logger("movie_finder")
logger = get_logger()
