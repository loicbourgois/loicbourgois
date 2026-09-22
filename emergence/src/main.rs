use rand::Rng;
use rand::seq::SliceRandom;
use serde::Deserialize;
use std::collections::HashMap;
use std::error::Error;

const AGENT_COUNT: usize = 1000;
const TURNS: usize = 2000;
const PASSIVE_DECAY: f32 = 0.04;
const ACTION_INCREMENT: f32 = 0.1;

const DEATH_CHART_WIDTH: usize = 220;
const DEATH_CHART_HEIGHT: usize = 24;

#[derive(Debug, Default)]
struct Community {
    food: usize,
}

fn death_chart_y(deaths: usize, max_deaths: usize) -> usize {
    if max_deaths == 0 {
        DEATH_CHART_HEIGHT - 1
    } else {
        let scaled = (deaths as f32 / max_deaths as f32) * (DEATH_CHART_HEIGHT - 1) as f32;
        DEATH_CHART_HEIGHT - 1 - scaled.round() as usize
    }
}

fn print_chart(history: &[Metric], title: &str) {
    if history.is_empty() {
        println!("No metrics to display.");
        return;
    }
    let max_deaths = history
        .iter()
        .map(|metric| metric.deaths)
        .max()
        .unwrap_or(0);
    println!("{title}");
    if max_deaths == 0 {
        println!("No deaths recorded.");
        return;
    }
    let bucket_count = DEATH_CHART_WIDTH.min(history.len());
    let mut buckets = Vec::with_capacity(bucket_count);
    for bucket_index in 0..bucket_count {
        let start = bucket_index * history.len() / bucket_count;
        let end = ((bucket_index + 1) * history.len() / bucket_count).max(start + 1);
        let end = end.min(history.len());
        let bucket = &history[start..end];
        let bucket_min = bucket.iter().map(|metric| metric.deaths).min().unwrap_or(0);
        let bucket_max = bucket.iter().map(|metric| metric.deaths).max().unwrap_or(0);
        buckets.push((bucket_min, bucket_max));
    }
    let mut grid = vec![vec![' '; bucket_count]; DEATH_CHART_HEIGHT];
    for (x, (min_deaths, max_bucket_deaths)) in buckets.iter().enumerate() {
        let min_y = death_chart_y(*min_deaths, max_deaths);
        let max_y = death_chart_y(*max_bucket_deaths, max_deaths);
        for row in max_y..=min_y {
            grid[row][x] = '█';
        }
    }
    for (row_index, row) in grid.iter().enumerate() {
        let value = max_deaths as f32 * (DEATH_CHART_HEIGHT - 1 - row_index) as f32
            / (DEATH_CHART_HEIGHT - 1) as f32;
        println!("{:>4.0} │{}", value, row.iter().collect::<String>());
    }
    println!("     └{}", "─".repeat(bucket_count));
    println!(
        "      0{}{}",
        " ".repeat(bucket_count.saturating_sub(2)),
        history.len().saturating_sub(1)
    );
}

impl Community {
    fn new() -> Self {
        Community { food: 0 }
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
    food_limit: usize,
) {
    agent.state.get_mut("rest").unwrap().v -= PASSIVE_DECAY;
    agent.state.get_mut("fullness").unwrap().v -= PASSIVE_DECAY;
    if agent.food > food_limit {
        community.food += 1;
        agent.food -= 1;
    }
}

fn choose_action(agent: &Agent, community: &Community, rng: &mut impl Rng) -> Action {
    if agent.state["fullness"].v < agent.state["fullness"].s && agent.food > 0 {
        Action::Eat
    } else if agent.state["rest"].v < agent.state["rest"].s {
        Action::Chill
    } else if agent.state["motivation"].v < agent.state["motivation"].s {
        Action::SelfMotivate
    } else if agent.state["motivation"].v > rng.gen_range(0.0..=1.0) {
        Action::FindFood
    } else if community.food > 0 {
        Action::TakeFood
    } else {
        Action::Chill
    }
}

fn apply_action(agent: &mut Agent, action: Action, community: &mut Community) {
    match action {
        Action::FindFood => {
            agent.food += 1;
            agent.state.get_mut("rest").unwrap().v -= PASSIVE_DECAY;
        }
        Action::GiveFood => {
            if agent.food > 0 {
                agent.food -= 1;
                community.food += 1;
                agent.state.get_mut("rest").unwrap().v -= PASSIVE_DECAY;
            } else {
                panic!("invalid action");
            }
        }
        Action::TakeFood => {
            if community.food > 0 {
                community.food -= 1;
                agent.food += 1;
            } else {
                panic!("invalid action");
            }
        }
        Action::Eat => {
            if agent.food > 0 {
                agent.food -= 1;
                agent.state.get_mut("fullness").unwrap().v += ACTION_INCREMENT;
            } else {
                panic!("invalid action: {action:?}");
            }
        }
        Action::Chill => {
            agent.state.get_mut("rest").unwrap().v += ACTION_INCREMENT;
        }
        Action::SelfMotivate => {
            agent.state.get_mut("motivation").unwrap().v += ACTION_INCREMENT;
        }
        Action::Sleep | Action::Drink | Action::SelfMotivate => {
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
    food: usize,
    altruism: f32,
    alive: bool,
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
            food: 0,
            altruism: rng.gen_range(0.0..=1.0),
            alive: true,
        }
    }
}

#[derive(Debug)]
struct Rule {
    name: String,
}

fn live_or_die(agent: &mut Agent) {
    if agent.state.values().any(|attribute| attribute.v < 0.0) {
        agent.alive = false;
    }
}

fn step(
    agent: &mut Agent,
    community: &mut Community,
    rules: &[Rule],
    rng: &mut impl Rng,
    food_limit: usize,
) {
    if !agent.alive {
        return;
    }
    let action = choose_action(agent, community, rng);
    // println!("{action:?}");
    apply_action(agent, action, community);
    apply_passive_updates(agent, community, rules, food_limit);
    live_or_die(agent);
    agent.age += 1;
}

struct Metric {
    deaths: usize,
    community_food: usize,
}

#[derive(Debug)]
struct Simulation {
    agents: Vec<Agent>,
    rules: Vec<Rule>,
    food_limit: usize,
}

impl Simulation {
    fn new(config: &Config, rng: &mut impl Rng) -> Self {
        let agents = (0..AGENT_COUNT)
            .map(|_| Agent::new(&config.attributs, rng))
            .collect();
        Self {
            agents,
            rules: Vec::new(),
            food_limit: 0,
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
    let mut history = Vec::new();
    for turn in 0..TURNS {
        simulation.agents.shuffle(&mut rng);
        if turn == TURNS / 4 * 0 {
            simulation.food_limit = 0;
        }
        if turn == TURNS / 4 * 1 {
            simulation.food_limit = 1;
        }
        if turn == TURNS / 4 * 2 {
            simulation.food_limit = 100;
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
        let deaths = simulation
            .agents
            .iter()
            .filter(|agent| !agent.alive)
            .count();
        history.push(Metric {
            deaths,
            community_food: community.food,
        });
        for agent in &mut simulation.agents {
            if !agent.alive {
                *agent = Agent::new(&config.attributs, &mut rng);
            }
        }
    }
    print_chart(&history, "deaths");
    Ok(())
}
