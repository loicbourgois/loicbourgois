import pandas as pd
import statistics
from .agent.definition import Agent
from .agent.step import step
from .config import (
    POPULATION_SIZE,
    TURNS,
)
from .logger import get_logger
import shutil
from .community import Community
from .config import Rules
import random
from .chart import (
    print_timeseries,
    print_chart,
    print_timeseries_min_max,
)
import sys
import time


logger = get_logger()


def age(agent):
    return agent.age


def food(agent):
    return agent.food


def min_sweet_spot(agent):
    return min(attribute.s for attribute in agent.state.attributes.values())


def max_sweet_spot(agent):
    return max(attribute.s for attribute in agent.state.attributes.values())


def print_agents(agents) -> None:
    rows = [
        {
            **agent.to_dict_compressed(),
        }
        for index, agent in enumerate(agents)
    ]
    state_df = pd.DataFrame(rows).sort_values(
        by="age",
        ascending=True,
        kind="stable",
    )
    table = state_df.to_string(index=False)
    header = table.splitlines()[0]
    logger.info("agents:\n%s\n%s", table, header)


def average_health(agents) -> float:
    alive_agents = [agent for agent in agents if agent.alive]
    if not alive_agents:
        return 0.0
    return sum(agent.health() for agent in alive_agents) / len(alive_agents)


def average_age(agents) -> float:
    if not agents:
        return 0.0
    return sum(agent.age for agent in agents) / len(agents)


def median_altruism(agents) -> float:
    return float(statistics.median(agent.altruism for agent in agents))


def median_age(agents) -> float:
    if not agents:
        return 0.0
    return float(statistics.median(agent.age for agent in agents))


def median_health(agents) -> float:
    return float(statistics.median(agent.health() for agent in agents))


class History:
    def __init__(self):
        self.average_health = []
        self.alive_count = []
        self.average_age = []
        self.community_food = []
        self.median_age = []
        self.deaths = []
        self.max_food_per_agent = []
        self.median_altruism = []
        self.median_health = []


def alive_count(agents) -> int:
    return sum(1 for agent in agents if agent.alive)


def deaths(agents) -> int:
    return sum(1 for agent in agents if not agent.alive)


def print_progress(current: int, total: int, width: int = 40) -> None:
    if total <= 0:
        return
    if not hasattr(print_progress, "_started_at"):
        print_progress._started_at = time.monotonic()
    completed = min(current, total)
    ratio = completed / total
    filled = int(width * ratio)
    bar = "#" * filled + "-" * (width - filled)
    percent = ratio * 100
    elapsed = time.monotonic() - print_progress._started_at
    if completed > 0:
        remaining = elapsed * (total - completed) / completed
    else:
        remaining = 0.0
    total_width = len(str(total))
    sys.stderr.write(
        f"\r[{bar}] "
        f"{completed:{total_width}d}/{total} "
        f" | {percent:5.1f}% | "
        f"{elapsed:6.1f}s /"
        f"{(remaining + elapsed):6.1f}s"
    )
    sys.stderr.flush()
    if completed == total:
        sys.stderr.write("\n")
        sys.stderr.flush()
        delattr(print_progress, "_started_at")


def main() -> None:
    logger.info("start")
    agents = [Agent(idx) for idx in range(POPULATION_SIZE)]
    logger.info("initialized %d agents", len(agents))
    community = Community()
    rules = Rules()
    history = History()
    for turn in range(TURNS):
        print_progress(turn, TURNS)
        if turn == int(TURNS / 6 * 0):
            rules.max_food_per_agent = 1
        if turn == int(TURNS / 6 * 1):
            rules.max_food_per_agent = 10
        if turn == int(TURNS / 6 * 2):
            rules.max_food_per_agent = 1
        if turn == int(TURNS / 6 * 3):
            rules.max_food_per_agent = 10
        if turn == int(TURNS / 6 * 4):
            rules.max_food_per_agent = 1
        if turn == int(TURNS / 6 * 5):
            rules.max_food_per_agent = 0
        random.shuffle(agents)
        for agent in agents:
            step(agent, community, rules, verbose=False)
            if not agent.alive:
                agents[agent.idx] = Agent(agent.idx)
        history.average_health.append(average_health(agents))
        history.alive_count.append(alive_count(agents))
        history.average_age.append(average_age(agents))
        history.community_food.append(community.food)
        history.median_age.append(median_age(agents))
        history.deaths.append(deaths(agents))
        history.max_food_per_agent.append(rules.max_food_per_agent)
        history.median_altruism.append(median_altruism(agents))
        history.median_health.append(median_health(agents))
    print_agents(agents)
    # we don't show the first turns, because simulation needs to get going
    # before value stabilizes
    # print_timeseries_min_max(
    #     "Alive agents through time",
    #     history.alive_count,
    # )
    print_timeseries_min_max(
        "Community food",
        history.community_food,
    )
    print_timeseries_min_max(
        "deaths",
        history.deaths,
    )
    print_timeseries_min_max(
        "median_age",
        history.median_age,
    )
    print_timeseries_min_max(
        "average_age",
        history.average_age,
    )
    print_timeseries_min_max(
        "max_food_per_agent",
        history.max_food_per_agent,
    )
    print_timeseries_min_max(
        "median_altruism",
        history.median_altruism,
    )
    print_timeseries_min_max(
        "average_health",
        history.average_health,
    )
    print_timeseries_min_max(
        "median_health",
        history.median_health,
    )
    # print('')
    # logger.info("Average health: %.2f", history.average_health[-1])
    # logger.info("Average age:    %.2f", average_age(agents))
    # logger.info("Median age:     %.2f", median_age(agents))
    logger.info("Alive at end:   %d/%d", history.alive_count[-1], len(agents))
    logger.info(f"community.food: {community.food}")
    # print_chart(
    #     data=agents,
    #     title="Motivation by age",
    #     x=age,
    #     y=lambda agent: agent.state["motivation"].s,
    # )
    # print_chart(
    #     data=agents,
    #     title="Min sweet spot by age",
    #     x=lambda agent: agent.age,
    #     y=lambda agent: min(attribute.s for attribute in agent.state.attributes.values()),
    # )
    # print_chart(
    #     data=agents,
    #     title="Max sweet spot by age",
    #     x=age,
    #     y=max_sweet_spot,
    # )
    # print_chart(
    #     data=agents,
    #     title="food by age",
    #     x=age,
    #     y=food,
    # )
    # print_chart(
    #     data=agents,
    #     title="Altruism by age",
    #     x=lambda agent: agent.age,
    #     y=lambda agent: agent.altruism,
    # )


if __name__ == "__main__":
    main()
