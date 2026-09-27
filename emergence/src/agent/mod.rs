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

#[derive(Debug, Clone)]
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
            AgentKind::Neural => {
                let data = AgentData::new_data(kind, attribute_definitions, rng);
                Agent::Neural(NeuralAgent::new(rng, data, 3, 16))
            }
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
        rand_alive_agent: &Agent,
    ) {
        *self.get_data_mut() =
            AgentData::new_data(self.get_data().kind, attribute_definitions, rng);
        match self {
            Agent::Neural(a) => {
                if let Agent::Neural(rand_agent) = rand_alive_agent {
                    // 33/33/33 chance of either
                    // - random neurons
                    // - evolving from a live agent, strong coefficient
                    // - evolving from a live agent, small coefficient
                    let choice = rng.gen_range(0.0..=1.0);
                    if choice < 1.0 / 3.0 {
                        a.neurons = NeuralAgent::new_random_neurons(rng, a.neurons.len());
                    } else if choice < 2.0 / 3.0 {
                        a.neurons = NeuralAgent::evolve_neurons(rng, &rand_agent.neurons, 0.1);
                    } else {
                        a.neurons = NeuralAgent::evolve_neurons(rng, &rand_agent.neurons, 0.01);
                    }
                } else {
                    panic!("plouf");
                }
            }
            Agent::RuleBased(a) => {}
        }
    }

    pub fn choose_action(&mut self, context: ActionContext, rng: &mut impl Rng) -> Vec<Action> {
        match self {
            Agent::Neural(a) => a.choose_action(context),
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
        1.0 - data
            .state
            .values()
            .map(|attribute| (attribute.s - attribute.v).abs())
            .sum::<f32>()
            / data.state.len() as f32
    }

    pub fn health(&self) -> f32 {
        let data = self.get_data();
        let s: f32 = data
            .state
            .values()
            .map(|attribute| (attribute.v - 0.5).abs())
            .sum();
        let l: f32 = data.state.len() as f32;
        1.0 - (s / l * 2.0_f32)
    }

    pub fn eat(&mut self) {
        let data = self.get_data_mut();
        let v = data.food.min(1.0);
        data.food -= v;
        data.state.get_mut("fullness").unwrap().v += EAT_INCREMENT * v;
    }

    pub fn is_dead(&self) -> bool {
        !self.get_data().alive
    }
}
