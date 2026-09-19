import pandas as pd

from .agent.definition import Agent
from .agent.step import step
from .config import (
    POPULATION_SIZE,
    TURNS,
)
from .logger import get_logger
import asciichartpy
import math

logger = get_logger()


def print_agents(agents):
    state_df = pd.DataFrame(
        {
            "aid": index + 1,
            **agent.to_dict_compressed(),
        }
        for index, agent in enumerate(agents)
    )
    logger.info("agents:\n%s", state_df.to_string(index=False))


def average_health(agents) -> float:
    if not agents:
        return 0.0

    return sum(agent.health() for agent in agents) / len(agents)


def print_health_chart(
    health_history: list[float], *, height: int = 32, width: int = 200
) -> None:
    if not health_history:
        return
    # no direct width argument for asciichartpy
    # we need to downsample
    health_history_narrow = health_history[
        :: max((math.ceil(len(health_history) / width)), 1)
    ]
    logger.info(
        "Average health through time\n"
        + asciichartpy.plot(
            health_history_narrow,
            {
                "height": height,
                "format": "{:0.2f}",
            },
        )
    )


def main() -> None:
    logger.info("start")

    agents = [Agent() for _ in range(POPULATION_SIZE)]
    logger.info("initialized %d agents", len(agents))

    print_agents(agents)

    average_health_history = [average_health(agents)]

    for _ in range(TURNS):
        for agent in agents:
            step(agent, verbose=False)

        average_health_history.append(average_health(agents))

    print_agents(agents)
    print_health_chart(
        average_health_history,
    )


if __name__ == "__main__":
    main()
