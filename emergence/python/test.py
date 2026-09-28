from .logger import get_logger
from .agent.definition import Agent
from .agent.step import choose_action

logger = get_logger()

if __name__ == "__main__":
    logger.info("test")
    a = Agent()
    a.state.hydration.v = 10.0
    a.state.fullness.v = 10.0
    a.state.rest.v = 10.0
    a.state.relaxation.v = 10.0
    a.state.motivation.v = 10.0
    # logger.info(a.state_as_list())
    # logger.info(a.state)
    logger.info(a.to_dict_compressed())
    action = choose_action(a, True)
    assert action == "find-food"
