import math


def pearson(
    data,
    x,
    y,
) -> float | None:
    xs = [x(point) for point in data]
    ys = [y(point) for point in data]
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
