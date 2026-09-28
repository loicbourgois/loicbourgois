use rand::Rng;
use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct AttributeDefinition {}

#[derive(Debug, Clone)]
pub struct Attribute {
    // Current value.
    pub v: f32,
    // Sweet spot.
    pub s: f32,
}

impl Attribute {
    pub fn new(rng: &mut impl Rng) -> Self {
        Self {
            v: rng.gen_range(0.0..=1.0),
            s: rng.gen_range(0.0..=1.0),
        }
    }
}
