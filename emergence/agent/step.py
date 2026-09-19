from ..logger import get_logger
from ..shared import clamp_upper
from ..config import ATTRIBUTES, PASSIVE_DECAY, ACTION_INCREMENT
from random import random


logger = get_logger()


def live_or_die(agent) -> None:
    if any(attribute.v < 0.0 for attribute in agent.state.attributes.values()):
        # logger.info("oopsie: %s", agent.age)
        agent.alive = False


def relative_deficit(state) -> float:
    return (state.s - state.v) / state.s


def choose_action(agent, verbose) -> str:
    deficits = [
        (attribute_name, attribute, relative_deficit(attribute))
        for attribute_name, attribute in agent.state.attributes.items()
        if relative_deficit(attribute) > 0.0
    ]

    if deficits:
        attribute_name, _attribute, _deficit = max(
            deficits,
            key=lambda item: item[2],
        )
        action = ATTRIBUTES[attribute_name].action
    elif agent.state.motivation.v > random() and agent.food < 10:
        action = "find-food"
    else:
        action = "chill"

    if action == "eat" and agent.food <= 0:
        action = "find-food"
    if verbose:
        logger.info("action: %s", action)
    return action


def apply_action(agent, action: str) -> None:
    match action:
        case "find-food":
            agent.food += 1
            agent.state.rest.v -= ACTION_INCREMENT
        case "eat":
            agent.food -= 1
            agent.state.fullness.v = clamp_upper(
                agent.state.fullness.v + ACTION_INCREMENT
            )
        case "sleep":
            agent.state.rest.v = clamp_upper(agent.state.rest.v + ACTION_INCREMENT)
        case "chill":
            agent.state.relaxation.v = clamp_upper(
                agent.state.relaxation.v + ACTION_INCREMENT
            )
        case "drink":
            agent.state.hydration.v = clamp_upper(
                agent.state.hydration.v + ACTION_INCREMENT
            )
        case "self-motivate":
            agent.state.motivation.v = clamp_upper(
                agent.state.motivation.v + ACTION_INCREMENT
            )
        case _:
            raise ValueError(f"invalid action: {action}")


def apply_passive_updates(agent) -> None:
    if agent.state.hydration.v < agent.state.hydration.s:
        agent.state.relaxation.v -= PASSIVE_DECAY
    if agent.state.fullness.v < agent.state.fullness.s:
        agent.state.relaxation.v -= PASSIVE_DECAY
    agent.state.rest.v -= PASSIVE_DECAY
    agent.state.hydration.v -= PASSIVE_DECAY
    agent.state.fullness.v -= PASSIVE_DECAY


def step(agent, verbose) -> None:
    if agent.alive:
        action = choose_action(agent, verbose)
        apply_action(agent, action)
        apply_passive_updates(agent)
        live_or_die(agent)
        agent.age += 1
    else:
        pass
