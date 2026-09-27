use crate::AttributeDefinition;
use serde::Deserialize;
use std::collections::HashMap;
use std::error::Error;

#[derive(Debug, Deserialize)]
pub struct Config {
    pub attributes: HashMap<String, AttributeDefinition>,
}

impl Config {
    pub fn load() -> Result<Self, Box<dyn Error>> {
        let config: Self = serde_json::from_str(include_str!("config.json"))?;

        for name in ["fullness", "rest", "motivation"] {
            if !config.attributes.contains_key(name) {
                return Err(format!("missing required attribute: {name}").into());
            }
        }

        Ok(config)
    }
}
