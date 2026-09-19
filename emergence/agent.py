import random
from typing import TypedDict


class AgentState(TypedDict):
    hydration: float
    fullness: float
    hydration_sweet_spot: float
    fullness_sweet_spot: float


class Agent:
    def __init__(self) -> None:
        self.hydration: float = 0.5
        self.fullness: float = 0.5
        self.hydration_sweet_spot: float = random.random()
        self.fullness_sweet_spot: float = random.random()

    def to_state(self) -> AgentState:
        return {
            "hydration": self.hydration,
            "fullness": self.fullness,
            "hydration_sweet_spot": self.hydration_sweet_spot,
            "fullness_sweet_spot": self.fullness_sweet_spot,
        }
