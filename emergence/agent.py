import random
from typing import Literal, TypedDict
from .logger import get_logger

logger = get_logger()


AttributeName = Literal["hydration", "fullness", "rest", "relaxation"]
ActionName = Literal["drink", "eat", "sleep", "chill"]


class AttributeState(TypedDict):
    v: float
    s: float


class AgentState(TypedDict):
    hydration: AttributeState
    fullness: AttributeState
    rest: AttributeState
    relaxation: AttributeState


class Agent:
    def __init__(
        self,
        *,
        rng: random.Random | None = None,
        action_increment: float = 0.2,
        passive_decay: float = 0.05,
    ) -> None:
        self._rng = rng or random.Random()
        self.action_increment = action_increment
        self.passive_decay = passive_decay

        self.hydration: AttributeState = {
            "v": 0.5,
            "s": self._rng.random(),
        }
        self.fullness: AttributeState = {
            "v": 0.5,
            "s": self._rng.random(),
        }
        self.rest: AttributeState = {
            "v": 0.5,
            "s": self._rng.random(),
        }
        self.relaxation: AttributeState = {
            "v": 0.5,
            "s": self._rng.random(),
        }

    def to_state(self) -> AgentState:
        return {
            "hydration": f"{round(self.hydration['v'], 2)}/{round(self.hydration['s'], 2)}",
            "fullness": f"{round(self.fullness['v'], 2)}/{round(self.fullness['s'], 2)}",
            "rest": f"{round(self.rest['v'], 2)}/{round(self.rest['s'], 2)}",
            "relaxation": f"{round(self.relaxation['v'], 2)}/{round(self.relaxation['s'], 2)}",
        }

    def choose_action(self) -> ActionName | None:
        deficits: dict[AttributeName, float] = {
            "hydration": max(0.0, self.hydration["s"] - self.hydration["v"]),
            "fullness": max(0.0, self.fullness["s"] - self.fullness["v"]),
            "rest": max(0.0, self.rest["s"] - self.rest["v"]),
            "relaxation": max(0.0, self.relaxation["s"] - self.relaxation["v"]),
        }

        attribute = max(deficits, key=deficits.__getitem__)

        if deficits[attribute] <= 0.0:
            return None

        action = {
            "hydration": "drink",
            "fullness": "eat",
            "rest": "sleep",
            "relaxation": "chill",
        }[attribute]
        logger.info(f"action: {action}")
        return action

    @staticmethod
    def _clamp(value: float) -> float:
        return min(1.0, max(0.0, value))

    def _apply_action(self, action: ActionName | None) -> None:
        if action == "drink":
            self.hydration["v"] = self._clamp(
                self.hydration["v"] + self.action_increment
            )
        elif action == "eat":
            self.fullness["v"] = self._clamp(self.fullness["v"] + self.action_increment)
        elif action == "sleep":
            self.rest["v"] = self._clamp(self.rest["v"] + self.action_increment)
        elif action == "chill":
            self.relaxation["v"] = self._clamp(
                self.relaxation["v"] + self.action_increment
            )
        else:
            raise Exception(f"invalid action: {action}")

    def _apply_passive_updates(self) -> None:
        if self.hydration["v"] < self.hydration["s"]:
            self.relaxation["v"] = self._clamp(
                self.relaxation["v"] - self.passive_decay
            )

        if self.fullness["v"] < self.fullness["s"]:
            self.relaxation["v"] = self._clamp(
                self.relaxation["v"] - self.passive_decay
            )

        self.rest["v"] = self._clamp(self.rest["v"] - self.passive_decay)
        self.hydration["v"] = self._clamp(self.hydration["v"] - self.passive_decay)
        self.fullness["v"] = self._clamp(self.fullness["v"] - self.passive_decay)

    def step(self) -> ActionName | None:
        action = self.choose_action()
        self._apply_action(action)
        self._apply_passive_updates()
        return action
