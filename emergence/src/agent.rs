use crate::AttributeDefinition;
use crate::attribute::Attribut;
use rand::Rng;
use std::collections::HashMap;

#[derive(Debug)]
pub struct AgentData {
    pub age: usize,
    pub state: HashMap<String, Attribut>,
    pub food: f32,
    pub altruism: f32,
    pub alive: bool,
    pub luck: f32,
}

impl AgentData {
    fn new_data(
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
}

#[derive(Debug)]
pub enum Agent {
    Base(AgentData),
    Neural { data: AgentData, brain: Vec<f32> },
    RuleBased { data: AgentData },
}

impl Agent {
    pub fn new(
        attribute_definitions: &HashMap<String, AttributeDefinition>,
        rng: &mut impl Rng,
    ) -> Self {
        Agent::Base(AgentData::new_data(attribute_definitions, rng))
    }

    pub fn get_data(&self) -> &AgentData {
        match self {
            Agent::Base(data) => data,
            Agent::Neural { data, .. } => data,
            Agent::RuleBased { data, .. } => data,
        }
    }

    pub fn get_data_mut(&mut self) -> &mut AgentData {
        match self {
            Agent::Base(data) => data,
            Agent::Neural { data, .. } => data,
            Agent::RuleBased { data, .. } => data,
        }
    }

    pub fn happiness(&self) -> f32 {
        let data = self.get_data();
        if data.state.is_empty() {
            0.0
        } else {
            data.state
                .values()
                .map(|attribute| (attribute.s - attribute.v).abs())
                .sum::<f32>()
                / data.state.len() as f32
        }
    }

    pub fn health(&self) -> f32 {
        self.get_data()
            .state
            .values()
            .map(|attribute| (attribute.v - 0.5).abs())
            .sum()
    }
}
