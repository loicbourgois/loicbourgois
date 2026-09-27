use super::agent_kind::AgentKind;
use crate::Action;
use crate::AttributeDefinition;
use crate::attribute::Attribute;
use rand::Rng;
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct AgentData {
    pub kind: AgentKind,
    pub age: usize,
    pub state: HashMap<String, Attribute>,
    pub food: f32,
    pub altruism: f32,
    pub alive: bool,
    pub luck: f32,
    pub action_taken: Option<Action>,
}

impl AgentData {
    pub fn new_data(
        kind: AgentKind,
        attribute_definitions: &HashMap<String, AttributeDefinition>,
        rng: &mut impl Rng,
    ) -> Self {
        let state = attribute_definitions
            .keys()
            .map(|name| (name.clone(), Attribute::new(rng)))
            .collect();
        Self {
            kind,
            age: 0,
            state,
            food: 0.0,
            altruism: rng.gen_range(0.0..=1.0),
            alive: true,
            luck: rng.gen_range(0.0..=1.0),
            action_taken: None,
        }
    }
}
