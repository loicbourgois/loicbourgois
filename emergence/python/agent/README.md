# Agent


## Extensibility
The list of attributes should be dynamic and easy to update.
Today we might have 4; tomorrow, 20.
It should be parameterized through the config.

We must be able to access a dynamic attribute directly or by key.

eg: agent.state.rest.v -= agent.passive_decay
eg: agent.state['rest'].v -= agent.passive_decay


## Health
Health is defined as the avg of the distance to 0.5 for all atributs
0.5 & 0.5 -> 100% health
0.4 & 0.4 -> 80% 
0.4 & 0.6 -> 80% 
0.4 & 0.7 -> 70% 
0.1 & 0.5 -> 60%


## Attributes
Each agent has N attributes, as a float from 0 to 1.

- hydration: how much water they've had
- fullness: how much food they've had
    opposite: hungry
- rest: how rested they feel
    opposite: tired
- relaxation:
    opposite: stressed

Attributes are objects with 2 fields: `v` (value), `s` (sweet spot).

For each attribute, there's a sweet spot
defining where that agent prefers to be.

- hydration.sweet_spot: from 0 to 1
- ...

- The constructor will set sweet_spot to a random value and attributes to 0.5.
- The attributes describe the current state.
- The sweet spot describes what that agent aims for.


## Sweet spot vs Health
Sweet spot is used to take action.
It's the preferred state of an agent.
Ideal health and sweet spot can differ.


## Actions
Each turn, the agent will take the action for the state where 
they are farther from their sweet spot.

We should not use absolute: action is taken only if state is below preference
the distance should be relative
    0.1/0.2 = 50% -> to be prioritized
    0.7/0.9 = 77%

Possible actions:
- drink: +hydration
- eat: +fullness
- sleep: +rest
- chill: +relaxation

_apply_action should use match, instead of if/else


## State updates
We do one stress penalty per unmet need:
    hydration.value < hydration.sweet_spot: -relaxation
    fullness.value < fullness.sweet_spot: -relaxation
Other rules:
    always: -rest
    always: -hydration
    always: -fullness


## Death condition
attributs value can go in the negative
if any attributs value is < 0, the agent dies 
if agent is dead nothing happens 


## Misc
def to_str() -> f"{}/{} | {}/{}"
        will print all v/s

Attributs are grouped into self.state.{attribut}
