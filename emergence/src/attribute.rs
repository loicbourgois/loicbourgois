use rand::Rng;
use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct AttributeDefinition {
    // Only used for printing messages
    // Not as numerical values
    min: String,
    max: String,
}

#[derive(Debug, Clone)]
pub struct Attribut {
    // Current value.
    pub v: f32,
    // Sweet spot.
    pub s: f32,
}

impl Attribut {
    pub fn new(definition: &AttributeDefinition, rng: &mut impl Rng) -> Self {
        Self {
            v: rng.gen_range(0.0..=1.0),
            s: rng.gen_range(0.0..=1.0),
        }
    }
}
