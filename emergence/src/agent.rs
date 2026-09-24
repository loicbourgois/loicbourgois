use crate::AttributeDefinition;
use crate::attribute::Attribut;
use rand::Rng;
use std::collections::HashMap;

// The original `Agent` struct is renamed to `AgentData`.
// This struct now represents the common, shared data for all types of agents.
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
    // This is a private constructor for the core `AgentData` fields.
    // It's used by the `Agent` enum's public `new` method.
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

// The `Agent` type is now an enum. This addresses the TODO by allowing
// different types of agents (Base, Neural, RuleBased) to be represented
// and stored in a single collection (e.g., Vec<Agent>).
#[derive(Debug)]
pub enum Agent {
    Base(AgentData), // Represents the original, basic agent type.
    Neural {
        data: AgentData, // Common agent data.
        brain: Vec<f32>, // Additional field for neural agents, as requested by TODO.
    },
    RuleBased {
        data: AgentData, // Common agent data.
                         // No additional fields explicitly requested for RuleBasedAgent,
                         // but it's a distinct type.
    },
}

impl Agent {
    // This `new` method is the public constructor for creating `Agent` enum instances.
    // By default, it creates a `Base` agent. This can be extended later to create
    // other types of agents randomly or based on parameters.
    pub fn new(
        attribute_definitions: &HashMap<String, AttributeDefinition>,
        rng: &mut impl Rng,
    ) -> Self {
        Agent::Base(AgentData::new_data(attribute_definitions, rng))
    }

    // Helper method to get an immutable reference to the common `AgentData`
    // regardless of the specific agent variant. This simplifies accessing
    // shared properties without extensive pattern matching in `main.rs`.
    pub fn get_data(&self) -> &AgentData {
        match self {
            Agent::Base(data) => data,
            Agent::Neural { data, .. } => data,
            Agent::RuleBased { data, .. } => data,
        }
    }

    // Helper method to get a mutable reference to the common `AgentData`.
    // Essential for modifying shared agent properties like `age`, `food`, `state`, etc.
    pub fn get_data_mut(&mut self) -> &mut AgentData {
        match self {
            Agent::Base(data) => data,
            Agent::Neural { data, .. } => data,
            Agent::RuleBased { data, .. } => data,
        }
    }

    // The `happiness` method, previously on `impl Agent`, now operates on the `Agent` enum
    // and delegates to the encapsulated `AgentData`.
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

    // The `health` method, previously on `impl Agent`, now operates on the `Agent` enum
    // and delegates to the encapsulated `AgentData`.
    pub fn health(&self) -> f32 {
        self.get_data()
            .state
            .values()
            .map(|attribute| (attribute.v - 0.5).abs())
            .sum()
    }
}
