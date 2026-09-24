// TODO: refactor using agent, not v0
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
mod agent;
use crate::agent::Agent;
mod attribute;
use crate::attribute::AttributeDefinition;

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

#[derive(Debug, Clone, Copy)]
enum Action {
    FindFood,
    GiveFood,
    TakeFood,
    Eat,
    // Sleep,
    Chill,
    // Drink,
    SelfMotivate,
}

fn apply_passive_updates(
    agent: &mut Agent,
    community: &mut Community,
    // How much food maxim per agent
    // If an agent has more than `food_limit`, we take and give to the community
    food_limit: f32,
    rng: &mut impl Rng,
) {
    let data = agent.get_data_mut();

    data.state.get_mut("rest").unwrap().v -= PASSIVE_DECAY;
    data.state.get_mut("fullness").unwrap().v -= PASSIVE_DECAY;

    if data.food > food_limit {
        let tax = (data.food - food_limit).min(1.0);
        community.food += tax;
        data.food -= tax;
    }

    if data.luck < rng.gen_range(0.0..=1.0) {
        data.food /= 2.0;
    }
}

fn choose_action(agent: &Agent, community: &Community, rng: &mut impl Rng) -> Action {
    let data = agent.get_data();

    if data.state["fullness"].v < data.state["fullness"].s && data.food > 0.0 {
        Action::Eat
    } else if data.state["rest"].v < data.state["rest"].s {
        Action::Chill
    } else if data.state["motivation"].v < data.state["motivation"].s {
        Action::SelfMotivate
    } else if data.state["motivation"].v > rng.gen_range(0.0..=1.0) {
        if data.food >= 1.0 && data.altruism > rng.gen_range(0.0..=1.0) {
            Action::GiveFood
        } else {
            Action::FindFood
        }
    } else if community.food >= 1.0 {
        Action::TakeFood
    } else {
        Action::Chill
    }
}

fn apply_action(agent: &mut Agent, action: Action, community: &mut Community) {
    let data = agent.get_data_mut();

    match action {
        Action::FindFood => {
            data.food += 1.0;
            data.state.get_mut("rest").unwrap().v -= PASSIVE_DECAY;
        }
        Action::GiveFood => {
            if data.food >= 1.0 {
                data.food -= 1.0;
                community.food += 1.0;
                data.state.get_mut("rest").unwrap().v -= PASSIVE_DECAY;
            } else {
                panic!("invalid action");
            }
        }
        Action::TakeFood => {
            if community.food >= 1.0 {
                community.food -= 1.0;
                data.food += 1.0;
            } else {
                panic!("invalid action");
            }
        }
        Action::Eat => {
            let v = data.food.min(1.0);
            data.food -= v;
            data.state.get_mut("fullness").unwrap().v += EAT_INCREMENT * v;
        }
        Action::Chill => {
            data.state.get_mut("rest").unwrap().v += ACTION_INCREMENT;
        }
        Action::SelfMotivate => {
            data.state.get_mut("motivation").unwrap().v += ACTION_INCREMENT;
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

#[derive(Debug)]
struct Rule {
    name: String,
}

fn live_or_die(agent: &mut Agent, rng: &mut impl Rng) {
    let data = agent.get_data_mut();

    if data.state.values().any(|attribute| attribute.v < 0.0) {
        data.alive = false;
    }

    if rng.gen_range(0.0..=1.0) < MORTALITY_CHANCE * (data.age as f32) {
        data.alive = false;
    }
}

fn step(
    agent: &mut Agent,
    community: &mut Community,
    rules: &[Rule],
    rng: &mut impl Rng,
    food_limit: f32,
) {
    if !agent.get_data().alive {
        return;
    }
    let action = choose_action(agent, community, rng);
    apply_action(agent, action, community);
    apply_passive_updates(agent, community, food_limit, rng);
    live_or_die(agent, rng);
    agent.get_data_mut().age += 1;
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
        let food_limits = [100.0, 1.0, 1.2, 0.85, 0.75];
        let phase = (turn * food_limits.len() / TURNS);
        simulation.food_limit = food_limits[phase];
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
                .filter(|agent| !agent.get_data().alive)
                .count(),
            community_food: community.food,
            max_age: simulation
                .agents
                .iter()
                .map(|agent| agent.get_data().age)
                .max()
                .unwrap_or(0),
            median_age: {
                let mut ages: Vec<usize> = simulation
                    .agents
                    .iter()
                    .map(|agent| agent.get_data().age)
                    .collect();
                ages.sort();
                if ages.is_empty() {
                    0
                } else if ages.len().is_multiple_of(2) {
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
                        .map(|agent| agent.get_data().age as f32)
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
                } else if happiness.len().is_multiple_of(2) {
                    (happiness[happiness.len() / 2 - 1] + happiness[happiness.len() / 2]) / 2.0
                } else {
                    happiness[happiness.len() / 2]
                }
            },
            avg_health: {
                if simulation.agents.is_empty() {
                    0.0
                } else {
                    simulation.agents.iter().map(Agent::health).sum::<f32>()
                        / simulation.agents.len() as f32
                }
            },
            median_health: {
                let mut health: Vec<f32> = simulation.agents.iter().map(Agent::health).collect();
                health.sort_by(|a, b| a.total_cmp(b));
                if health.is_empty() {
                    0.0
                } else if health.len().is_multiple_of(2) {
                    (health[health.len() / 2 - 1] + health[health.len() / 2]) / 2.0
                } else {
                    health[health.len() / 2]
                }
            },
        });
        for agent in &mut simulation.agents {
            if !agent.get_data().alive {
                *agent = Agent::new(&config.attributs, &mut rng);
            }
        }
    }
    print_chart_usize(&history.deaths(), "deaths");
    print_chart_usize(&history.max_age(), "max_age");
    print_chart_usize(&history.median_age(), "median_age");
    print_chart_f32(&history.avg_happiness(), "avg_happiness");
    print_chart_f32(&history.median_happiness(), "median_happiness");
    print_chart_f32(&history.avg_health(), "avg_health");
    print_chart_f32(&history.median_health(), "median_health");
    print_chart_f32(&history.community_food(), "community_food");
    print_chart_f32(&history.avg_age(), "avg_age");
    Ok(())
}
