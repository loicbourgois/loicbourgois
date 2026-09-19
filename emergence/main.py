import pandas as pd
import statistics
from .agent.definition import Agent
from .agent.step import step
from .config import (
    POPULATION_SIZE,
    TURNS,
)
from .logger import get_logger
import asciichartpy
import math
import shutil

logger = get_logger()


def motivation_age_correlation(
    agents,
) -> float | None:
    if len(agents) < 2:
        return None
    ages = [float(agent.age) for agent in agents]
    motivations = [motivation_sweet_spot(agent) for agent in agents]
    mean_age = sum(ages) / len(ages)
    mean_motivation = sum(motivations) / len(motivations)
    age_delta = [age - mean_age for age in ages]
    motivation_delta = [motivation - mean_motivation for motivation in motivations]
    numerator = sum(
        age_change * motivation_change
        for age_change, motivation_change in zip(
            age_delta,
            motivation_delta,
        )
    )
    age_variance = sum(value * value for value in age_delta)
    motivation_variance = sum(value * value for value in motivation_delta)
    denominator = math.sqrt(age_variance * motivation_variance)
    if denominator == 0.0:
        return None
    return numerator / denominator


def motivation_sweet_spot(agent) -> float:
    return agent.state["motivation"].s


def min_sweet_spot(agent):
    return min(attribute.s for attribute in agent.state.attributes.values())


def max_sweet_spot(agent):
    return max(attribute.s for attribute in agent.state.attributes.values())


def print_agents(agents) -> None:
    rows = [
        {
            "aid": index + 1,
            **agent.to_dict_compressed(),
        }
        for index, agent in enumerate(agents)
    ]
    state_df = pd.DataFrame(rows).sort_values(
        by="food",
        ascending=True,
        kind="stable",
    )
    table = state_df.to_string(index=False)
    header = table.splitlines()[0]
    logger.info("agents:\n%s\n%s", table, header)


def average_health(agents) -> float:
    if not agents:
        return 0.0

    return sum(agent.health() for agent in agents) / len(agents)


def get_grid(width, height, points):
    grid = [["·" for _ in range(width)] for _ in range(height)]
    for age, motivation in points:
        x = round((age) / TURNS * (width - 1))
        y = int((1.0 - motivation) * height)
        x = max(0, min(width - 1, x))
        y = max(0, min(height - 1, y))
        grid[y][x] = "x" if grid[y][x] == "·" else "●"
    return grid


def print_motivation_age_chart(agents) -> None:
    height = 50
    width = 150
    # points = [
    #     (float(agent.age), motivation_sweet_spot(agent))
    #     for agent in agents
    # ]
    points = [(float(agent.age), min_sweet_spot(agent)) for agent in agents]
    grid = get_grid(width, height, points)
    correlation = motivation_age_correlation(agents)
    correlation_text = "undefined" if correlation is None else f"{correlation:+.3f}"
    chart = "\n".join("".join(row) for row in grid)
    logger.info(
        "Motivation by age\n%s\nPearson: %s",
        chart,
        correlation_text,
    )


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


def average_age(agents) -> float:
    if not agents:
        return 0.0
    return sum(agent.age for agent in agents) / len(agents)


def terminal_chart_width() -> int:
    """Return a usable chart width while leaving room for y-axis labels."""
    terminal_width = shutil.get_terminal_size((80, 24)).columns

    # asciichartpy uses some columns for labels and padding.
    return max(terminal_width - 12, 1)


def median_age(agents) -> float:
    if not agents:
        return 0.0
    return float(statistics.median(agent.age for agent in agents))


def main() -> None:
    logger.info("start")
    agents = [Agent() for _ in range(POPULATION_SIZE)]
    logger.info("initialized %d agents", len(agents))
    # print_agents(agents)
    average_health_history = [average_health(agents)]
    for _ in range(TURNS):
        for agent in agents:
            step(agent, verbose=False)

        average_health_history.append(average_health(agents))
    print_agents(agents)
    # print_health_chart(
    #     average_health_history,
    # )
    logger.info("Average health: %.2f", average_health_history[-1])
    logger.info("Average age:    %.2f", average_age(agents))
    logger.info("Median age:     %.2f", median_age(agents))
    alive_count = sum(1 for agent in agents if agent.alive)
    logger.info("Alive at end:   %d/%d", alive_count, len(agents))

    print_motivation_age_chart(agents)


if __name__ == "__main__":
    main()
