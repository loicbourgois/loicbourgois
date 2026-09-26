use crate::Action;
use crate::ActionContext;
use crate::agent::AgentData;
use rand::Rng;

#[derive(Debug)]
pub struct NeuralAgent {
    pub data: AgentData,
    pub brain: Vec<f32>,
}

impl NeuralAgent {
    pub fn choose_action(&self, _context: ActionContext, _rng: &mut impl Rng) -> Action {
        Action::Chill
    }
}
