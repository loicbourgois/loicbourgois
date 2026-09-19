import pandas as pd

from .agent import Agent
from .config import POPULATION_SIZE
from .logger import get_logger

logger = get_logger()


def main() -> None:
    logger.info("start")

    agents = [Agent() for _ in range(POPULATION_SIZE)]
    logger.info("initialized %d agents", len(agents))

    state_df = pd.DataFrame(
        {
            "agent_id": index,
            **agent.to_state(),
        }
        for index, agent in enumerate(agents)
    )

    logger.info("agent state:\n%s", state_df.to_string(index=False))


if __name__ == "__main__":
    main()
