use crate::Action;
use crate::Agent;
use crate::AgentKind;
use crate::Community;
use crate::Simulation;
use std::collections::HashMap;

pub struct Metric {
    pub deaths: usize,
    pub community_food: f32,
    pub max_age: usize,
    pub median_age: usize,
    pub avg_age: f32,
    pub avg_happiness: f32,
    pub median_happiness: f32,
    pub avg_health: f32,
    pub median_health: f32,
    pub count_by_kind: HashMap<AgentKind, usize>,
    pub max_age_by_kind: HashMap<AgentKind, usize>,
    pub actions_taken: HashMap<Action, usize>,
}

impl Metric {
    pub fn from_simulation(simulation: &Simulation, community: &Community) -> Metric {
        Metric {
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
            count_by_kind: {
                let mut count_by_kind = HashMap::new();
                for agent in &simulation.agents {
                    *count_by_kind.entry(agent.get_data().kind).or_insert(0) += 1;
                }
                count_by_kind
            },
            max_age_by_kind: {
                let mut max_age_by_kind = HashMap::new();
                for agent in &simulation.agents {
                    let data = agent.get_data();
                    let max_age = max_age_by_kind.entry(data.kind).or_insert(0);
                    *max_age = (*max_age).max(data.age);
                }
                max_age_by_kind
            },
            actions_taken: {
                let mut actions_taken = HashMap::new();
                for agent in &simulation.agents {
                    let action = agent.get_action_taken().unwrap();
                    let value = actions_taken.entry(action).or_insert(0);
                    *value += 1;
                }
                actions_taken
            },
        }
    }
}
