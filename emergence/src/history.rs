use crate::Agent;
use crate::Community;
use crate::Simulation;
use crate::agent::agent_kind::AgentKind;
use std::collections::HashMap;

pub struct History {
    metrics: Vec<Metric>,
}

impl History {
    pub fn new() -> Self {
        History {
            metrics: Vec::new(),
        }
    }
    pub fn push(&mut self, m: Metric) {
        self.metrics.push(m)
    }
    pub fn iter(&self) -> impl Iterator<Item = &Metric> {
        self.metrics.iter()
    }

    // pub fn len(&self) -> usize {
    //     self.metrics.len()
    // }

    // pub fn is_empty(&self) -> bool {
    //     self.metrics.is_empty()
    // }

    pub fn deaths(&self) -> Vec<usize> {
        self.iter().map(|metric| metric.deaths).collect::<Vec<_>>()
    }

    pub fn community_food(&self) -> Vec<f32> {
        self.iter()
            .map(|metric| metric.community_food)
            .collect::<Vec<_>>()
    }

    pub fn max_age(&self) -> Vec<usize> {
        self.iter().map(|metric| metric.max_age).collect()
    }

    pub fn median_age(&self) -> Vec<usize> {
        self.iter().map(|metric| metric.median_age).collect()
    }

    pub fn avg_age(&self) -> Vec<f32> {
        self.iter().map(|metric| metric.avg_age).collect()
    }
    pub fn avg_happiness(&self) -> Vec<f32> {
        self.iter().map(|metric| metric.avg_happiness).collect()
    }

    pub fn median_happiness(&self) -> Vec<f32> {
        self.iter().map(|metric| metric.median_happiness).collect()
    }

    pub fn avg_health(&self) -> Vec<f32> {
        self.iter().map(|metric| metric.avg_health).collect()
    }

    pub fn median_health(&self) -> Vec<f32> {
        self.iter().map(|metric| metric.median_health).collect()
    }

    pub fn count_by_kind(&self) -> Vec<HashMap<AgentKind, usize>> {
        self.iter()
            .map(|metric| metric.count_by_kind.clone())
            .collect()
    }
}

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
        }
    }
}
