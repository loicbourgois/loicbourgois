from typing import Literal
from ..logger import get_logger
from ..shared import clamp_upper


logger = get_logger()


AttributeName = Literal[
    "hydration",
    "fullness",
    "rest",
    "relaxation",
]

ActionName = Literal[
    "drink",
    "eat",
    "sleep",
    "chill",
]


def _live_or_die(agent) -> None:
    attributes = (
        agent.state.hydration,
        agent.state.fullness,
        agent.state.rest,
        agent.state.relaxation,
    )
    if any(attribute.v < 0.0 for attribute in attributes):
        logger.info(f"oopsie: {agent.age}")
        agent.alive = False


def choose_action(agent, verbose) -> ActionName:
    states: dict[AttributeName, AttributeState] = {
        "hydration": agent.state.hydration,
        "fullness": agent.state.fullness,
        "rest": agent.state.rest,
        "relaxation": agent.state.relaxation,
    }
    actions: dict[AttributeName, ActionName] = {
        "hydration": "drink",
        "fullness": "eat",
        "rest": "sleep",
        "relaxation": "chill",
    }

    def relative_deficit(state: AttributeState) -> float:
        if state.v >= state.s or state.s == 0.0:
            return 0.0
        return (state.s - state.v) / state.s

    deficits = {name: relative_deficit(state) for name, state in states.items()}
    attribute = max(deficits, key=deficits.__getitem__)
    action = actions[attribute]
    if verbose:
        logger.info("action: %s", action)
    return action


def _apply_action(agent: Agent, action: ActionName) -> None:
    match action:
        case "drink":
            attribute = agent.state.hydration
        case "eat":
            attribute = agent.state.fullness
        case "sleep":
            attribute = agent.state.rest
        case "chill":
            attribute = agent.state.relaxation
        case _:
            raise ValueError(f"invalid action: {action}")
    attribute.v = clamp_upper(attribute.v + agent.action_increment)


def _apply_passive_updates(agent) -> None:
    if agent.state.hydration.v < agent.state.hydration.s:
        agent.state.relaxation.v -= agent.passive_decay
    if agent.state.fullness.v < agent.state.fullness.s:
        agent.state.relaxation.v -= agent.passive_decay
    agent.state.rest.v -= agent.passive_decay
    agent.state.hydration.v -= agent.passive_decay
    agent.state.fullness.v -= agent.passive_decay


def step(agent, verbose) -> None:
    if agent.alive:
        action = choose_action(agent, verbose)
        _apply_action(agent, action)
        _apply_passive_updates(agent)
        _live_or_die(agent)
        agent.age += 1
    else:
        pass
