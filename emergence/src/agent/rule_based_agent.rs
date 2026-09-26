use crate::Action;
use crate::ActionContext;
use crate::agent::AgentData;
use rand::Rng;

#[derive(Debug)]
pub struct RuleBasedAgent {
    pub data: AgentData,
}

impl RuleBasedAgent {
    pub fn choose_action(&self, context: ActionContext, rng: &mut impl Rng) -> Action {
        let data = &self.data;

        if data.state["fullness"].v < data.state["fullness"].s && data.food > 0.0 {
            Action::Eat
        } else if data.state["rest"].v < data.state["rest"].s {
            Action::Chill
        } else if data.state["motivation"].v < data.state["motivation"].s {
            Action::SelfMotivate
        } else if data.state["motivation"].v > rng.gen_range(0.0..=1.0) {
            if data.food >= 1.0 && data.altruism > rng.gen_range(0.0..=1.0) {
                Action::GiveFood
            } else {
                Action::FindFood
            }
        } else if context.community_food >= 1.0 {
            Action::TakeFood
        } else {
            Action::Chill
        }
    }
}
