from .logger import get_logger
from .agent.definition import Agent

logger = get_logger()

if __name__ == "__main__":
    logger.info("test")
    a = Agent()
    logger.info(a.to_dict_compressed())
    logger.info(a.state_as_list())
