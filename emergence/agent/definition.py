import random
from typing import TypedDict
from dataclasses import dataclass, fields


@dataclass
class AttributeState:
    v: float
    s: float


@dataclass
class AgentState:
    hydration: AttributeState
    fullness: AttributeState
    rest: AttributeState
    relaxation: AttributeState


class CompressedAgent(TypedDict):
    hydration: str
    fullness: str
    rest: str
    relaxation: str
    age: int


class Agent:
    def __init__(
        self,
        *,
        rng: random.Random | None = None,
        action_increment: float = 0.2,
        passive_decay: float = 0.05,
    ) -> None:
        if action_increment < 0:
            raise ValueError("action_increment must be non-negative")
        if passive_decay < 0:
            raise ValueError("passive_decay must be non-negative")

        self._rng = rng if rng is not None else random.Random()
        self.action_increment = action_increment
        self.passive_decay = passive_decay
        self.alive = True
        self.age = 0

        self.state = AgentState(
            hydration=AttributeState(v=0.5, s=self._rng.random()),
            fullness=AttributeState(v=0.5, s=self._rng.random()),
            rest=AttributeState(v=0.5, s=self._rng.random()),
            relaxation=AttributeState(v=0.5, s=self._rng.random()),
        )

    def to_dict_compressed(self) -> CompressedAgent:
        d = {
            "age": self.age,
            "health": f"{self.health():.2f}",
        }
        return {
            "hydration": f"{self.state.hydration.v:.2f}/{self.state.hydration.s:.2f}",
            "fullness": f"{self.state.fullness.v:.2f}/{self.state.fullness.s:.2f}",
            "rest": f"{self.state.rest.v:.2f}/{self.state.rest.s:.2f}",
            "relaxation": f"{self.state.relaxation.v:.2f}/{self.state.relaxation.s:.2f}",
        }

    def state_as_list(self):
        return list(
            {
                "id": field.name,
                "s": getattr(self.state, field.name).s,
                "v": getattr(self.state, field.name).v,
            }
            for field in fields(self.state)
        )

    def to_str(self) -> str:
        return (
            f"{self.state.hydration.v:.2f}/{self.state.hydration.s:.2f} | "
            f"{self.state.fullness.v:.2f}/{self.state.fullness.s:.2f} | "
            f"{self.state.rest.v:.2f}/{self.state.rest.s:.2f} | "
            f"{self.state.relaxation.v:.2f}/{self.state.relaxation.s:.2f}"
        )

    def health(self) -> float:
        attributes = (getattr(self.state, field.name) for field in fields(self.state))

        def attribute_health(attribute: AttributeState) -> float:
            return max(0.0, 1.0 - 2.0 * abs(attribute.v - 0.5))

        return sum(attribute_health(attribute) for attribute in attributes) / len(
            fields(self.state)
        )
