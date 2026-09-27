use crate::ACTION_INCREMENT;
use crate::AGENT_COUNT;
use crate::Action;
use crate::ActionContext;
use crate::Agent;
use crate::AgentKind;
use crate::Community;
use crate::Config;
use crate::MORTALITY_CHANCE;
use crate::PASSIVE_DECAY;
use crate::Rule;
use rand::Rng;
use rand::seq::SliceRandom;

fn live_or_die(agent: &mut Agent, rng: &mut impl Rng) {
    let data = agent.get_data_mut();
    if data.state.values().any(|attribute| attribute.v <= 0.0) {
        data.alive = false;
    }
    if data.state.values().any(|attribute| attribute.v > 1.0) {
        data.alive = false;
    }
    if rng.gen_range(0.0..=1.0) < MORTALITY_CHANCE * (data.age as f32) {
        data.alive = false;
    }
}

#[derive(Debug)]
pub struct Simulation {
    pub agents: Vec<Agent>,
    pub rules: Vec<Rule>,
    pub food_limit: f32,
}

fn apply_passive_updates(
    agent: &mut Agent,
    community: &mut Community,
    // How much food maxim per agent
    // If an agent has more than `food_limit`, we take and give to the community
    food_limit: f32,
    rng: &mut impl Rng,
) {
    let data = agent.get_data_mut();
    data.state.get_mut("rest").unwrap().v -= PASSIVE_DECAY;
    data.state.get_mut("fullness").unwrap().v -= PASSIVE_DECAY;
    if data.food > food_limit {
        let tax = (data.food - food_limit).min(1.0);
        community.food += tax;
        data.food -= tax;
    }
    if data.luck < rng.gen_range(0.0..=1.0) {
        data.food /= 2.0;
    }
}

fn apply_action(agent: &mut Agent, actions: Vec<Action>, community: &mut Community) {
    for action in actions {
        let data = agent.get_data_mut();
        let action_applied = match action {
            Action::FindFood => {
                data.food += 1.0;
                data.state.get_mut("rest").unwrap().v -= PASSIVE_DECAY;
                true
            }
            Action::GiveFood => {
                if data.food >= 1.0 {
                    data.food -= 1.0;
                    community.food += 1.0;
                    data.state.get_mut("rest").unwrap().v -= PASSIVE_DECAY;
                    true
                } else {
                    false
                }
            }
            Action::TakeFood => {
                if community.food >= 1.0 {
                    community.food -= 1.0;
                    data.food += 1.0;
                    true
                } else {
                    false
                }
            }
            Action::Eat if data.food > 0.0 => {
                agent.eat();
                true
            }
            Action::Eat => false,
            Action::Chill => {
                data.state.get_mut("rest").unwrap().v += ACTION_INCREMENT;
                true
            }
            Action::SelfMotivate => {
                data.state.get_mut("motivation").unwrap().v += ACTION_INCREMENT;
                true
            }
        };
        if action_applied {
            return;
        }
    }
    panic!("no valid action");
}

fn clip_attributes(agent: &mut Agent) {
    for attribute in agent.get_data_mut().state.values_mut() {
        attribute.v = attribute.v.clamp(0.0, 1.0);
    }
}

fn step(
    agent: &mut Agent,
    community: &mut Community,
    rules: &[Rule],
    rng: &mut impl Rng,
    food_limit: f32,
) {
    if !agent.get_data().alive {
        return;
    }
    let actions = agent.choose_action(
        ActionContext {
            community_food: community.food,
        },
        rng,
    );
    apply_action(agent, actions, community);
    apply_passive_updates(agent, community, food_limit, rng);
    live_or_die(agent, rng);
    // Clip happens after live_or_die because we want to
    //  first:  check if out of bound
    //  second: have clean value for history
    clip_attributes(agent);
    agent.get_data_mut().age += 1;
}

impl Simulation {
    pub fn new(config: &Config, rng: &mut impl Rng, mode: &str) -> Self {
        Self {
            agents: match mode {
                "rule" => (0..AGENT_COUNT)
                    .map(|_| Agent::new(AgentKind::RuleBased, &config.attributes, rng))
                    .collect(),
                "neural" => (0..AGENT_COUNT)
                    .map(|_| Agent::new(AgentKind::Neural, &config.attributes, rng))
                    .collect(),
                "random" => (0..AGENT_COUNT)
                    .map(|_| Agent::new_random(&config.attributes, rng))
                    .collect(),
                _ => {
                    panic!("invalid mode")
                }
            },
            rules: Vec::new(),
            food_limit: 0.0,
        }
    }

    pub fn step(&mut self, community: &mut Community, rng: &mut impl Rng, turn: usize) {
        self.agents.shuffle(rng);
        // let food_limits = [100.0, 1.0, 1.2, 0.85, 0.75];

        for agent in &mut self.agents {
            step(agent, community, &self.rules, rng, self.food_limit);
        }
        // spoilage
        community.food *= 0.5;
    }

    pub fn replace_dead(&mut self, config: &Config, rng: &mut impl Rng, mode: &str) {
        let alive_agents: Vec<Agent> = self
            .agents
            .iter()
            .filter(|a| a.get_data().alive)
            .cloned()
            .collect();
        match mode {
            "random" => {
                for agent in &mut self.agents {
                    if agent.is_dead() {
                        let alive_agents_of_same_kind: Vec<&Agent> = alive_agents
                            .iter()
                            .filter(|a| a.get_data().kind == agent.get_data().kind)
                            .collect();
                        //  50% - regular reset
                        //  50% - new random agent
                        if rng.gen_range(0.0..=1.0) > 0.5 {
                            if let Some(rand_alive_agent) = alive_agents_of_same_kind.choose(rng) {
                                agent.reset(&config.attributes, rng, rand_alive_agent);
                            } else {
                                // If no alive agents of same kind, create a new random one
                                println!("warning");
                                *agent = Agent::new_random(&config.attributes, rng);
                            }
                        } else {
                            *agent = Agent::new_random(&config.attributes, rng);
                        }
                    } else {
                        // pass
                    }
                }
            }
            _ => {
                for agent in &mut self.agents {
                    if agent.is_dead() {
                        let alive_agents_of_same_kind: Vec<&Agent> = alive_agents
                            .iter()
                            .filter(|a| a.get_data().kind == agent.get_data().kind)
                            .collect();
                        if let Some(rand_alive_agent) = alive_agents_of_same_kind.choose(rng) {
                            agent.reset(&config.attributes, rng, rand_alive_agent);
                        } else {
                            *agent = Agent::new(agent.get_data().kind, &config.attributes, rng);
                        }
                    } else {
                        // pass
                    }
                }
            }
        }
    }
}
