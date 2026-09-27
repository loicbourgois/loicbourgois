# Health
health is a score from 0 to 1
1 is best
ideally, individual is at 0.5 for all atributs
health = 1.0 - avg( distance(atribut.value, 0.5) ) * 2.0


# Hapiness
hapiness is a score from 0 to 1
1 is best
ideally, individual is at `Sweet Spot` for all atributs


# Cause of death
values above `1.0` represent a deliberate cause of death
agents should be smart enough to not overeat
neural agents can choose lethal actions. It is a deliberate design decision.


# Evolution
A neural replacement can inherit mutated neurons, but receives new sweet spots, altruism, and luck.
This is on purpose.
We are only interested in the decision making, based on the current environment,
both external and internal.


# Rule-based agent action panic
Rule based agent return only 1 action by design.
If the action is wrong, we panic.
This is to force correct implementation.
