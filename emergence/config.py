from dataclasses import dataclass


POPULATION_SIZE = 1000
TURNS = 500
ACTION_INCREMENT: float = 0.1
PASSIVE_DECAY: float = 0.016


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
