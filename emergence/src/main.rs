use rand::Rng;
use rand::seq::SliceRandom;
use serde::Deserialize;
use std::collections::HashMap;
use std::error::Error;
mod chart;
mod history;
use crate::history::History;
use crate::history::Metric;
use chart::print_chart_f32;
use chart::print_chart_usize;

const AGENT_COUNT: usize = 1000;
const TURNS: usize = 10001;
const PASSIVE_DECAY: f32 = 0.046;
const ACTION_INCREMENT: f32 = 0.06;
const EAT_INCREMENT: f32 = 0.5;
const MORTALITY_CHANCE: f32 = 0.00001;

#[derive(Debug, Default)]
struct Community {
    food: f32,
}

impl Community {
    fn new() -> Self {
        Community { food: 0.0 }
    }
}

#[derive(Debug, Clone, Deserialize)]
struct AttributeDefinition {
    // Only used for printing messages
    // Not as numerical values
    min: String,
    max: String,
}

#[derive(Debug, Clone, Copy)]
enum Action {
    FindFood,
    GiveFood,
    TakeFood,
    Eat,
    Sleep,
    Chill,
    Drink,
    SelfMotivate,
}

fn apply_passive_updates(
    agent: &mut Agent,
    community: &mut Community,
    rules: &[Rule],
    food_limit: f32,
    rng: &mut impl Rng,
) {
    agent.state.get_mut("rest").unwrap().v -= PASSIVE_DECAY;
    agent.state.get_mut("fullness").unwrap().v -= PASSIVE_DECAY;
    if agent.food > food_limit {
        let tax = (agent.food - food_limit).min(1.0);
        community.food += tax;
        agent.food -= tax;
    }
    if agent.luck < rng.gen_range(0.0..=1.0) {
        agent.food /= 2.0;
    }
}

fn choose_action(agent: &Agent, community: &Community, rng: &mut impl Rng) -> Action {
    if agent.state["fullness"].v < agent.state["fullness"].s && agent.food > 0.0 {
        Action::Eat
    } else if agent.state["rest"].v < agent.state["rest"].s {
        Action::Chill
    } else if agent.state["motivation"].v < agent.state["motivation"].s {
        Action::SelfMotivate
    } else if agent.state["motivation"].v > rng.gen_range(0.0..=1.0) {
        Action::FindFood
    } else if community.food >= 1.0 {
        Action::TakeFood
    } else {
        Action::Chill
    }
}

fn apply_action(agent: &mut Agent, action: Action, community: &mut Community) {
    match action {
        Action::FindFood => {
            agent.food += 1.0;
            agent.state.get_mut("rest").unwrap().v -= PASSIVE_DECAY;
        }
        Action::GiveFood => {
            if agent.food >= 1.0 {
                agent.food -= 1.0;
                community.food += 1.0;
                agent.state.get_mut("rest").unwrap().v -= PASSIVE_DECAY;
            } else {
                panic!("invalid action");
            }
        }
        Action::TakeFood => {
            if community.food >= 1.0 {
                community.food -= 1.0;
                agent.food += 1.0;
            } else {
                panic!("invalid action");
            }
        }
        Action::Eat => {
            let v = agent.food.min(1.0);
            agent.food -= v;
            agent.state.get_mut("fullness").unwrap().v += EAT_INCREMENT * v;
        }
        Action::Chill => {
            agent.state.get_mut("rest").unwrap().v += ACTION_INCREMENT;
        }
        Action::SelfMotivate => {
            agent.state.get_mut("motivation").unwrap().v += ACTION_INCREMENT;
        }
        Action::Sleep | Action::Drink => {
            panic!("invalid action: {action:?}");
        }
    }
}

#[derive(Debug, Deserialize)]
struct Config {
    attributs: HashMap<String, AttributeDefinition>,
}

impl Config {
    fn load() -> Result<Self, Box<dyn Error>> {
        let contents = include_str!("config.json");
        let config = serde_json::from_str(contents)?;
        Ok(config)
    }
}

#[derive(Debug, Clone)]
struct Attribut {
    // Current value.
    v: f32,
    // Sweet spot.
    s: f32,
}

impl Attribut {
    fn new(definition: &AttributeDefinition, rng: &mut impl Rng) -> Self {
        Self {
            v: rng.gen_range(0.0..=1.0),
            s: rng.gen_range(0.0..=1.0),
        }
    }
}

#[derive(Debug)]
struct Agent {
    age: usize,
    state: HashMap<String, Attribut>,
    food: f32,
    altruism: f32,
    alive: bool,
    luck: f32,
}

impl Agent {
    fn new(
        attribute_definitions: &HashMap<String, AttributeDefinition>,
        rng: &mut impl Rng,
    ) -> Self {
        let state = attribute_definitions
            .iter()
            .map(|(name, definition)| (name.clone(), Attribut::new(definition, rng)))
            .collect();
        Self {
            age: 0,
            state,
            food: 0.0,
            altruism: rng.gen_range(0.0..=1.0),
            alive: true,
            luck: rng.gen_range(0.0..=1.0),
        }
    }

    fn happiness(&self) -> f32 {
        if self.state.is_empty() {
            0.0
        } else {
            self.state
                .values()
                .map(|attribute| (attribute.s - attribute.v).abs())
                .sum::<f32>()
                / self.state.len() as f32
        }
    }
}

#[derive(Debug)]
struct Rule {
    name: String,
}

fn live_or_die(agent: &mut Agent, rng: &mut impl Rng) {
    if agent.state.values().any(|attribute| attribute.v < 0.0) {
        agent.alive = false;
    }
    if rng.gen_range(0.0..=1.0) < MORTALITY_CHANCE * (agent.age as f32) {
        agent.alive = false;
    }
}

fn step(
    agent: &mut Agent,
    community: &mut Community,
    rules: &[Rule],
    rng: &mut impl Rng,
    food_limit: f32,
) {
    if !agent.alive {
        return;
    }
    let action = choose_action(agent, community, rng);
    apply_action(agent, action, community);
    apply_passive_updates(agent, community, rules, food_limit, rng);
    live_or_die(agent, rng);
    agent.age += 1;
}

#[derive(Debug)]
struct Simulation {
    agents: Vec<Agent>,
    rules: Vec<Rule>,
    food_limit: f32,
}

impl Simulation {
    fn new(config: &Config, rng: &mut impl Rng) -> Self {
        let agents = (0..AGENT_COUNT)
            .map(|_| Agent::new(&config.attributs, rng))
            .collect();
        Self {
            agents,
            rules: Vec::new(),
            food_limit: 0.0,
        }
    }
}

fn main() -> Result<(), Box<dyn Error>> {
    let config = Config::load()?;
    let mut rng = rand::thread_rng();
    let mut simulation = Simulation::new(&config, &mut rng);
    let mut community = Community::new();
    let rules = Community::new();
    println!(
        "created {} agents with {} attributes",
        simulation.agents.len(),
        config.attributs.len()
    );
    let mut history = History::new();
    for turn in 0..TURNS {
        simulation.agents.shuffle(&mut rng);
        if turn == TURNS / 5 * 0 {
            simulation.food_limit = 100.0;
        }
        if turn == TURNS / 5 * 1 {
            simulation.food_limit = 1.0;
        }
        if turn == TURNS / 5 * 2 {
            simulation.food_limit = 1.2;
        }
        if turn == TURNS / 5 * 3 {
            simulation.food_limit = 0.85;
        }
        if turn == TURNS / 5 * 4 {
            simulation.food_limit = 0.75;
        }
        for agent in &mut simulation.agents {
            step(
                agent,
                &mut community,
                &simulation.rules,
                &mut rng,
                simulation.food_limit,
            );
        }
        // spoilage
        community.food *= 0.5;
        history.push(Metric {
            deaths: simulation
                .agents
                .iter()
                .filter(|agent| !agent.alive)
                .count(),
            community_food: community.food,
            max_age: simulation
                .agents
                .iter()
                .map(|agent| agent.age)
                .max()
                .unwrap_or(0),
            median_age: {
                let mut ages: Vec<usize> = simulation.agents.iter().map(|a| a.age).collect();
                ages.sort();
                if ages.is_empty() {
                    0
                } else if ages.len() % 2 == 0 {
                    (ages[ages.len() / 2 - 1] + ages[ages.len() / 2]) / 2
                } else {
                    ages[ages.len() / 2]
                }
            },
            avg_age: {
                if simulation.agents.is_empty() {
                    0.0
                } else {
                    simulation
                        .agents
                        .iter()
                        .map(|agent| agent.age as f32)
                        .sum::<f32>()
                        / simulation.agents.len() as f32
                }
            },
            avg_happiness: {
                if simulation.agents.is_empty() {
                    0.0
                } else {
                    simulation.agents.iter().map(Agent::happiness).sum::<f32>()
                        / simulation.agents.len() as f32
                }
            },
            median_happiness: {
                let mut happiness: Vec<f32> =
                    simulation.agents.iter().map(Agent::happiness).collect();

                happiness.sort_by(|a, b| a.total_cmp(b));

                if happiness.is_empty() {
                    0.0
                } else if happiness.len() % 2 == 0 {
                    (happiness[happiness.len() / 2 - 1] + happiness[happiness.len() / 2]) / 2.0
                } else {
                    happiness[happiness.len() / 2]
                }
            },
        });
        for agent in &mut simulation.agents {
            if !agent.alive {
                *agent = Agent::new(&config.attributs, &mut rng);
            }
        }
    }
    print_chart_usize(&history.deaths(), "deaths");
    print_chart_usize(&history.max_age(), "max_age");
    print_chart_usize(&history.median_age(), "median_age");
    print_chart_f32(&history.community_food(), "community_food");
    print_chart_f32(&history.avg_age(), "avg_age");
    print_chart_f32(&history.avg_happiness(), "avg_happiness");
    print_chart_f32(&history.median_happiness(), "median_happiness");
    Ok(())
}
