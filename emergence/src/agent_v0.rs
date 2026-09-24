use crate::AttributeDefinition;
use crate::attribute::Attribut;
use rand::Rng;
use std::collections::HashMap;

#[derive(Debug)]
pub struct Agent {
    pub age: usize,
    pub state: HashMap<String, Attribut>,
    pub food: f32,
    pub altruism: f32,
    pub alive: bool,
    pub luck: f32,
}

impl Agent {
    pub fn new(
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

    pub fn happiness(&self) -> f32 {
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

    pub fn health(&self) -> f32 {
        self.state
            .values()
            .map(|attribute| (attribute.v - 0.5).abs())
            .sum()
    }
}


# TODO: proper implementation
pub struct NeuralAgent derive Agent {
    + field: Brain: Vec<f32>,
}

pub struct RuleBasedAgent derive Agent {

}
