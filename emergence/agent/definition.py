import random
from dataclasses import dataclass
from typing import Any
from ..config import ATTRIBUTES


@dataclass
class AttributeState:
    # Value
    v: float
    # Sweet Spot
    s: float


@dataclass
class AgentState:
    attributes: dict[str, AttributeState]

    def __getitem__(self, name: str) -> AttributeState:
        return self.attributes[name]

    def __getattr__(self, name: str) -> AttributeState:
        # __getattr__ is called only after normal attributes were not found.
        try:
            return self.attributes[name]
        except KeyError as exc:
            raise AttributeError(
                f"{type(self).__name__!s} has no attribute {name!r}"
            ) from exc

    def items(self):
        return self.attributes.items()


class Agent:
    def __init__(
        self,
        idx,
        *,
        rng: random.Random | None = None,
    ) -> None:
        self._rng = rng if rng is not None else random.Random()
        self.alive = True
        self.age = 0
        self.food = 0
        self.altruism = self._rng.random()
        self.idx = idx

        self.state = AgentState(
            attributes={
                name: AttributeState(
                    # v=0.5,
                    v=self._rng.random(),
                    s=self._rng.random(),
                )
                for name in ATTRIBUTES
            }
        )

    def to_dict_compressed(self):
        result = {
            "idx": self.idx,
            "age": self.age,
            "health": f"{self.health():.2f}",
            "food": self.food,
            "altruism": f"{self.altruism:.2f}",
        }
        result.update({
            name: f"{attribute.v:.2f}/{attribute.s:.2f}"
            for name, attribute in self.state.attributes.items()
        })
        return result

    def state_as_list(self) -> list[dict[str, Any]]:
        return [
            {
                "id": name,
                "s": attribute.s,
                "v": attribute.v,
            }
            for name, attribute in self.state.attributes.items()
        ]

    def to_str(self) -> str:
        return " | ".join(
            f"{attribute.v:.2f}/{attribute.s:.2f}"
            for attribute in self.state.attributes.values()
        )

    def health(self) -> float:
        attributes = self.state.attributes.values()

        def attribute_health(attribute: AttributeState) -> float:
            return max(0.0, 1.0 - 2.0 * abs(attribute.v - 0.5))

        return sum(attribute_health(attribute) for attribute in attributes) / len(
            self.state.attributes
        )
