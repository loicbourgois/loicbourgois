POPULATION_SIZE = 1
TURNS = 2


preferences = {
    "hydration": ["thirsty", "hydrated"],
    "nutrition": ["hungry", "full"],
    "environment": ["nature", "urban"],
    "time": ["night", "day"],
    "visibility": ["obscurity", "light"],
    "temperature": ["cold", "heat"],
}


# effort = distance_traveled + thinking
# food_eaten = ...
# hydration = hydration - external_temperature - effort
# nutrition = nutrition - effort + food_eaten
