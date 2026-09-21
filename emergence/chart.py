from .pearson import pearson
import math
import asciichartpy
from .logger import get_logger


logger = get_logger()


def terminal_chart_width() -> int:
    """Return a usable chart width while leaving room for y-axis labels."""
    terminal_width = shutil.get_terminal_size((80, 24)).columns
    # asciichartpy uses some columns for labels and padding.
    return max(terminal_width - 12, 1)


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


def print_timeseries(
    title,
    data: list[float],
    *,
    height: int = 26,
    width: int = 200,
) -> None:
    # no direct width argument for asciichartpy
    # we need to downsample
    data_narrow = data[:: max((math.ceil(len(data) / width)), 1)]
    logger.info(
        f"{title}\n"
        + asciichartpy.plot(
            data_narrow,
            {
                "height": height,
                # "format": "{:0.2f}",
            },
        )
    )


def print_timeseries_avg(
    title,
    data: list[float],
    *,
    height: int = 26,
    width: int = 200,
) -> None:
    # asciichartpy has no direct width argument, so narrow long series by
    # averaging consecutive buckets instead of sampling every Nth value.
    if width <= 0:
        data_narrow = []
    elif len(data) <= width:
        data_narrow = data
    else:
        data_narrow = []
        for bucket_index in range(width):
            start = math.floor(bucket_index * len(data) / width)
            end = math.floor((bucket_index + 1) * len(data) / width)
            bucket = data[start:end]
            if bucket:
                data_narrow.append(sum(bucket) / len(bucket))
    logger.info(
        f"{title}\n"
        + asciichartpy.plot(
            data_narrow,
            {
                "height": height,
                # "format": "{:0.2f}",
            },
        )
    )


def print_timeseries_min_max(
    title,
    data: list[float],
    *,
    height: int = 26,
    width: int = 200,
) -> None:
    """Print bucketed min and max time series on the same chart."""
    data = data[10:]
    data_min_narrow, data_max_narrow = _bucket_min_max(data, width)
    logger.info(
        f"{title}\n"
        + asciichartpy.plot(
            [data_min_narrow, data_max_narrow],
            {
                "height": height,
                # "format": "{:0.2f}",
            },
        )
    )


def _bucket_min_max(data: list[float], width: int) -> tuple[list[float], list[float]]:
    """Return bucketed minimum and maximum series narrowed to the given width."""
    if width <= 0 or not data:
        return [], []
    bucket_count = min(width, len(data))
    data_min = []
    data_max = []
    for bucket_index in range(bucket_count):
        start = math.floor(bucket_index * len(data) / bucket_count)
        end = math.floor((bucket_index + 1) * len(data) / bucket_count)
        bucket = data[start:end]
        if bucket:
            data_min.append(min(bucket))
            data_max.append(max(bucket))

    return data_min, data_max


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
