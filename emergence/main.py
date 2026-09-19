import pandas as pd

from .agent import Agent
from .config import (
    POPULATION_SIZE,
    TURNS,
)
from .logger import get_logger

logger = get_logger()


def print_agents(agents):
    state_df = pd.DataFrame(
        {
            "agent_id": index,
            **agent.to_state(),
        }
        for index, agent in enumerate(agents)
    )
    logger.info("agent state:\n%s", state_df.to_string(index=False))


def main() -> None:
    logger.info("start")
    agents = [Agent() for _ in range(POPULATION_SIZE)]
    logger.info("initialized %d agents", len(agents))
    print_agents(agents)
    logger.info("--------")
    logger.info(agents[0].to_str())
    for i in range(TURNS):
        # logger.info(f"-------- turn #{i}")
        agents[0].step()
        # print_agents(agents)
        logger.info(agents[0].to_str())


if __name__ == "__main__":
    main()
