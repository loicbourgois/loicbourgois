use super::agent_kind::AgentKind;
use crate::AttributeDefinition;
use crate::attribute::Attribut;
use rand::Rng;
use std::collections::HashMap;

#[derive(Debug)]
pub struct AgentData {
    pub kind: AgentKind,
    pub age: usize,
    pub state: HashMap<String, Attribut>,
    pub food: f32,
    pub altruism: f32,
    pub alive: bool,
    pub luck: f32,
}

impl AgentData {
    pub fn new_data(
        kind: AgentKind,
        attribute_definitions: &HashMap<String, AttributeDefinition>,
        rng: &mut impl Rng,
    ) -> Self {
        let state = attribute_definitions
            .iter()
            .map(|(name, definition)| (name.clone(), Attribut::new(definition, rng)))
            .collect();
        Self {
            kind,
            age: 0,
            state,
            food: 0.0,
            altruism: rng.gen_range(0.0..=1.0),
            alive: true,
            luck: rng.gen_range(0.0..=1.0),
        }
    }
}
