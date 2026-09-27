mod agent_data;
pub mod agent_kind;
mod neural_agent_1;
mod neural_agent_2;
mod rule_based_agent;
use crate::Action;
use crate::AttributeDefinition;
use crate::EAT_INCREMENT;
use crate::agent::neural_agent_1::NeuralAgent1;
use crate::agent::neural_agent_2::NeuralAgent2;
use crate::agent::rule_based_agent::RuleBasedAgent;
use agent_data::AgentData;
use agent_kind::AgentKind;
use rand::Rng;
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub enum Agent {
    Neural1(NeuralAgent1),
    Neural2(NeuralAgent2),
    RuleBased(RuleBasedAgent),
}

#[derive(Debug, Clone, Copy)]
pub struct ActionContext {
    pub community_food: f32,
}

fn action_from_output_index(index: usize) -> Action {
    match index {
        0 => Action::FindFood,
        1 => Action::GiveFood,
        2 => Action::TakeFood,
        3 => Action::Eat,
        4 => Action::Chill,
        5 => Action::Meditate,
        // _ => Action::Chill,
        _ => panic!("invalid index"),
    }
}

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
            AgentKind::Neural1 => {
                let data = AgentData::new_data(kind, attribute_definitions, rng);
                Agent::Neural1(NeuralAgent1::new(rng, data, 3, 16))
            }
            AgentKind::Neural2 => {
                let data = AgentData::new_data(kind, attribute_definitions, rng);
                Agent::Neural2(NeuralAgent2::new(rng, data, 5, 6))
            }
        }
    }

    pub fn new_random(
        attribute_definitions: &HashMap<String, AttributeDefinition>,
        rng: &mut impl Rng,
    ) -> Self {
        let r = rng.gen_range(0.0..=1.0);
        if r < 1.0 / 3.0 {
            Agent::new(AgentKind::RuleBased, attribute_definitions, rng)
        } else if r < 2.0 / 3.0 {
            Agent::new(AgentKind::Neural1, attribute_definitions, rng)
        } else {
            Agent::new(AgentKind::Neural2, attribute_definitions, rng)
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
            Agent::Neural1(agent) => {
                agent.evolve(rand_alive_agent, rng);
            }
            Agent::Neural2(agent) => {
                agent.evolve(rand_alive_agent, rng);
            }
            Agent::RuleBased(_agent) => {
                // pass
            }
        }
    }

    pub fn choose_action(&mut self, context: ActionContext, rng: &mut impl Rng) -> Vec<Action> {
        match self {
            Agent::Neural1(a) => a.choose_action(context),
            Agent::Neural2(a) => a.choose_action(context),
            Agent::RuleBased(a) => a.choose_action(context, rng),
        }
    }

    pub fn get_data(&self) -> &AgentData {
        match self {
            Agent::Neural1(a) => &a.data,
            Agent::Neural2(a) => &a.data,
            Agent::RuleBased(a) => &a.data,
        }
    }

    pub fn set_action_taken(&mut self, action_taken: Option<Action>) {
        self.get_data_mut().action_taken = action_taken;
    }

    pub fn get_action_taken(&self) -> Option<Action> {
        self.get_data().action_taken
    }

    pub fn get_data_mut(&mut self) -> &mut AgentData {
        match self {
            Agent::Neural1(a) => &mut a.data,
            Agent::Neural2(a) => &mut a.data,
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
