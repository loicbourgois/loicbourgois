use crate::Action;
use crate::ActionContext;
use crate::Agent;
use crate::action::ACTION_COUNT;
use crate::agent::AgentData;
use crate::agent::action_from_output_index;
use crate::math::rand;
use rand::Rng;

#[derive(Debug, Clone)]
pub struct Neuron {
    weights: Vec<f32>,
    output: f32,
    bias: f32,
}

impl Neuron {
    fn new(rng: &mut impl Rng, size: usize) -> Neuron {
        Neuron {
            weights: (0..size).map(|_| rand(rng, -1.0, 1.0)).collect(),
            output: 0.0,
            bias: rand(rng, -1.0, 1.0),
        }
    }

    fn compute(&mut self, inputs: &[f32]) {
        assert_eq!(inputs.len(), self.weights.len());
        let mut sum = self.bias;
        for i in 0..inputs.len() {
            sum += inputs[i] * self.weights[i];
        }
        self.output = sum.tanh();
    }
}

#[derive(Debug, Clone)]
pub struct NeuralAgent1 {
    pub data: AgentData,
    pub neurons: Vec<Neuron>,
    pub thinking: usize,
}

impl NeuralAgent1 {
    const SENSOR_COUNT: usize = 9;

    pub fn new(rng: &mut impl Rng, data: AgentData, thinking: usize, size: usize) -> NeuralAgent1 {
        NeuralAgent1 {
            data,
            neurons: (0..size)
                .map(|_| Neuron::new(rng, Self::SENSOR_COUNT + size))
                .collect(),
            thinking,
        }
    }

    pub fn evolve(&mut self, rand_alive_agent: &Agent, rng: &mut impl Rng) {
        if let Agent::Neural1(rand_agent) = rand_alive_agent {
            let choice = rng.gen_range(0.0..=1.0);
            if choice < 1.0 / 4.0 {
                self.neurons = Self::new_random_neurons(rng, self.neurons.len());
            } else if choice < 2.0 / 4.0 {
                self.neurons = Self::evolve_neurons(rng, &rand_agent.neurons, 0.1);
            } else if choice < 3.0 / 4.0 {
                self.neurons = Self::evolve_neurons(rng, &rand_agent.neurons, 0.01);
            } else {
                self.neurons = Self::evolve_neurons(rng, &rand_agent.neurons, 0.001);
            }
        } else {
            panic!("plouf");
        }
    }

    pub fn new_random_neurons(rng: &mut impl Rng, num_neurons: usize) -> Vec<Neuron> {
        let neuron_input_size = Self::SENSOR_COUNT + num_neurons;
        (0..num_neurons)
            .map(|_| Neuron::new(rng, neuron_input_size))
            .collect()
    }

    pub fn evolve_neurons(
        rng: &mut impl Rng,
        neurons: &[Neuron],
        mutation_rate: f32,
    ) -> Vec<Neuron> {
        neurons
            .iter()
            .map(|neuron| Neuron {
                weights: neuron
                    .weights
                    .iter()
                    .map(|w| {
                        let change = rng.gen_range(-mutation_rate..=mutation_rate);
                        (w + change).clamp(-1.0, 1.0)
                    })
                    .collect(),
                output: 0.0, // Output should be reset for new neurons
                bias: {
                    let change = rng.gen_range(-mutation_rate..=mutation_rate);
                    (neuron.bias + change).clamp(-1.0, 1.0)
                },
            })
            .collect()
    }

    pub fn choose_action(&mut self, context: ActionContext) -> Vec<Action> {
        let data = &self.data;
        for _ in 0..self.thinking {
            let mut inputs: Vec<f32> = vec![
                data.state["fullness"].v,
                data.state["fullness"].s,
                data.state["rest"].v,
                data.state["rest"].s,
                data.state["peace_of_mind"].v,
                data.state["peace_of_mind"].s,
                data.food,
                data.altruism,
                context.community_food,
            ];
            inputs.extend(self.neurons.iter().map(|neuron| neuron.output));
            for neuron in &mut self.neurons {
                neuron.compute(&inputs);
            }
        }
        // Only the first {ACTION_COUNT} neurons are action neurons.
        let action_neurons = &self.neurons[0..ACTION_COUNT];
        // Sort by output in descending order
        let mut output_indexes: Vec<usize> = (0..action_neurons.len()).collect();
        output_indexes.sort_by(|left, right| {
            action_neurons[*right]
                .output
                .total_cmp(&action_neurons[*left].output)
        });
        output_indexes
            .into_iter()
            .map(action_from_output_index)
            .collect()
    }
}
