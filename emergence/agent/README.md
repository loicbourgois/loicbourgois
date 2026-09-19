# Agent


## Health
Health is defined as the avg of the distance to 0.5 for all atributs
0.5 & 0.5 -> 100% health
0.4 & 0.4 -> 80% 
0.4 & 0.6 -> 80% 
0.4 & 0.7 -> 70% 
0.1 & 0.5 -> 60%


## Attributes
each agent has N attributs, as a float from 0 to 1
- hydration: how much water they've had
- fullness: how much food they've had
    oposite: hungry
- rest: how rested they feel
    oposite: tired
- relaxation: 
    oposite: stressed

        atributs are an object with 2 fields: v (value), s (sweet_spot)

        for each atributs, there's a sweet spot
        defining where that agent prefers to be 
        - hydration.sweet_spot: from 0 to 1
        - ...

    - constructor will set sweet_spot to a rand value, and atributs to 0.5
    - the atributs describe the current state
    - the sweet_spot describe what they aim for

## Actions
how actions work:
each turn, the agent will take the action for the state where they are farther from their sweet spot
we should not use absolute: action is taken only if state is below preference
the distance should be relative
    0.1/0.2 = 50% -> to be prioritized
    0.7/0.9 = 77%

possible actions:
- drink: +hydration
- eat: +fullness
- sleep: +rest
- chill: +relaxation

_apply_action should use match, instead of if/else

## State updates

we do one stress penalty per unmet need
- hydration.value < hydration.sweet_spot: -relaxation
- fullness.value < fullness.sweet_spot: -relaxation

others
- always: -rest
- always: -hydration
- always: -fullness


## Death condition
attributs value can go in the negative
if any attributs value is < 0, the agent dies 
if agent is dead nothing happens 


## Misc
def to_str() -> f"{}/{} | {}/{}"
        will print all v/s

- we should access state value with self.hydration.v.  NOT self.hydration['v']
- attributs are grouped into self.state.{attribut}
