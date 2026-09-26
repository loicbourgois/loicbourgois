mod agent_data;
pub mod agent_kind;
mod neural_agent;
mod rule_based_agent;
use crate::AttributeDefinition;
use crate::EAT_INCREMENT;
use crate::agent::neural_agent::NeuralAgent;
use crate::agent::rule_based_agent::RuleBasedAgent;
use agent_data::AgentData;
use agent_kind::AgentKind;
use rand::Rng;
use std::collections::HashMap;

#[derive(Debug)]
pub enum Agent {
    Neural(NeuralAgent),
    RuleBased(RuleBasedAgent),
}

#[derive(Debug, Clone, Copy)]
pub struct ActionContext {
    pub community_food: f32,
}

use crate::Action;

impl Agent {
    pub fn new(
        kind: AgentKind,
        attribute_definitions: &HashMap<String, AttributeDefinition>,
        rng: &mut impl Rng,
    ) -> Self {
        match kind {
            AgentKind::RuleBased => Agent::RuleBased(RuleBasedAgent {
                data: AgentData::new_data(kind, attribute_definitions, rng),
            }),
            AgentKind::Neural => Agent::Neural(NeuralAgent {
                data: AgentData::new_data(kind, attribute_definitions, rng),
                brain: Vec::new(),
            }),
        }
    }

    pub fn new_random(
        attribute_definitions: &HashMap<String, AttributeDefinition>,
        rng: &mut impl Rng,
    ) -> Self {
        if rng.gen_range(0.0..=1.0) > 0.5 {
            Agent::new(AgentKind::RuleBased, attribute_definitions, rng)
        } else {
            Agent::new(AgentKind::Neural, attribute_definitions, rng)
        }
    }

    pub fn reset(
        &mut self,
        attribute_definitions: &HashMap<String, AttributeDefinition>,
        rng: &mut impl Rng,
    ) {
        *self.get_data_mut() = AgentData::new_data(self.get_data().kind, attribute_definitions, rng)
    }

    pub fn choose_action(&self, context: ActionContext, rng: &mut impl Rng) -> Action {
        match self {
            Agent::Neural(a) => a.choose_action(context, rng),
            Agent::RuleBased(a) => a.choose_action(context, rng),
        }
    }

    pub fn get_data(&self) -> &AgentData {
        match self {
            Agent::Neural(a) => &a.data,
            Agent::RuleBased(a) => &a.data,
        }
    }

    pub fn get_data_mut(&mut self) -> &mut AgentData {
        match self {
            Agent::Neural(a) => &mut a.data,
            Agent::RuleBased(a) => &mut a.data,
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

    pub fn eat(&mut self) {
        let data = self.get_data_mut();
        let v = data.food.min(1.0);
        data.food -= v;
        data.state.get_mut("fullness").unwrap().v += EAT_INCREMENT * v;
    }
}
