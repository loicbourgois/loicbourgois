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


def pearson(
    agents,
    x,
    y,
) -> float | None:
    xs = [x(agent) for agent in agents]
    ys = [y(agent) for agent in agents]
    mean_x = sum(xs) / len(xs)
    mean_y = sum(ys) / len(ys)
    x_delta = [x_ - mean_x for x_ in xs]
    y_delta = [y_ - mean_y for y_ in ys]
    numerator = sum(
        x_change * y_change
        for x_change, y_change in zip(
            x_delta,
            y_delta,
        )
    )
    x_variance = sum(value * value for value in x_delta)
    y_variance = sum(value * value for value in y_delta)
    denominator = math.sqrt(x_variance * y_variance)
    if denominator == 0.0:
        return None
    return numerator / denominator


def age(agent):
    return agent.age


def motivation_sweet_spot(agent) -> float:
    return agent.state["motivation"].s


def food(agent):
    return agent.food


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
    alive_agents = [agent for agent in agents if agent.alive]
    if not alive_agents:
        return 0.0
    return sum(agent.health() for agent in alive_agents) / len(alive_agents)


# TODO: propeor code
# def get_grid(width, height, points):
#     max_b = max(points[1])
#     grid = [["·" for _ in range(width)] for _ in range(height)]
#     for a, b in points:
#         x = round((a) / TURNS * (width - 1))
#         y = int((1.0 - b/max_b) * height)
#         x = max(0, min(width - 1, x))
#         y = max(0, min(height - 1, y))
#         grid[y][x] = "x" if grid[y][x] == "·" else "●"
#     return grid


def get_grid(
    width: int,
    height: int,
    points,
) -> list[list[str]]:
    """Render points into a fixed-size character grid."""
    if width <= 0 or height <= 0:
        return []
    grid = [["·" for _ in range(width)] for _ in range(height)]
    if not points:
        return grid
    x_values = [point[0] for point in points]
    y_values = [point[1] for point in points]
    min_x = 0  # min(x_values)
    max_x = max(max(x_values), 1)
    min_y = 0  # min(y_values)
    max_y = max(max(y_values), 1)
    x_range = max_x - min_x
    y_range = max_y - min_y
    for x_value, y_value in points:
        if x_range == 0:
            x = 0
        else:
            x = round((x_value - min_x) / x_range * (width - 1))
        if y_range == 0:
            y = height // 2
        else:
            y = round((1.0 - (y_value - min_y) / y_range) * (height - 1))
        x = max(0, min(width - 1, x))
        y = max(0, min(height - 1, y))
        grid[y][x] = "x" if grid[y][x] == "·" else "●"
    return grid


def print_chart(data, title, x, y) -> None:
    height = 50
    width = 150
    chart = "\n".join(
        "".join(row)
        for row in get_grid(width, height, [(x(point), y(point)) for point in data])
    )
    logger.info(
        f"{title}\n%s\nPearson: %s",
        chart,
        f"{pearson(data, x, y):+.3f}",
    )


def print_health_chart(
    health_history: list[float], *, height: int = 32, width: int = 150
) -> None:
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
    print_health_chart(
        average_health_history,
    )
    logger.info("Average health: %.2f", average_health_history[-1])
    logger.info("Average age:    %.2f", average_age(agents))
    logger.info("Median age:     %.2f", median_age(agents))
    alive_count = sum(1 for agent in agents if agent.alive)
    logger.info("Alive at end:   %d/%d", alive_count, len(agents))
    print_chart(
        data=agents,
        title="Motivation by age",
        x=age,
        y=motivation_sweet_spot,
    )
    print_chart(
        data=agents,
        title="Min sweet spot by age",
        x=age,
        y=min_sweet_spot,
    )
    print_chart(
        data=agents,
        title="Max sweet spot by age",
        x=age,
        y=max_sweet_spot,
    )
    print_chart(
        data=agents,
        title="food by age",
        x=age,
        y=food,
    )


if __name__ == "__main__":
    main()
