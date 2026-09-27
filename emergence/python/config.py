from dataclasses import dataclass


POPULATION_SIZE = 200
TURNS = 30000
ACTION_INCREMENT: float = 0.1
PASSIVE_DECAY: float = 0.013


class Rules:
    def __init__(
        self,
    ):
        self.max_food_per_agent = 0


@dataclass(frozen=True)
class AttributeConfig:
    action: str
    labels: tuple[str, str]


ATTRIBUTES: dict[str, AttributeConfig] = {
    "hydration": AttributeConfig(
        action="drink",
        labels=("thirsty", "hydrated"),
    ),
    "fullness": AttributeConfig(
        action="eat",
        labels=("hungry", "full"),
    ),
    "rest": AttributeConfig(
        action="sleep",
        labels=("tired", "well rested"),
    ),
    "relaxation": AttributeConfig(
        action="chill",
        labels=("stressed", "relaxed"),
    ),
    "motivation": AttributeConfig(
        action="self-motivate",
        labels=("lazy", "motivated"),
    ),
}
