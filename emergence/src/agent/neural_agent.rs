use crate::Action;
use crate::ActionContext;
use crate::agent::AgentData;
use rand::Rng;

#[derive(Debug, Clone)]
pub struct Neuron {
    weights: Vec<f32>,
    output: f32,
    bias: f32,
}

pub fn rand(rng: &mut impl Rng, min_inclusive: f32, max_inclusive: f32) -> f32 {
    rng.gen_range(min_inclusive..=max_inclusive)
}

fn action_from_output_index(index: usize) -> Action {
    match index {
        0 => Action::FindFood,
        1 => Action::GiveFood,
        2 => Action::TakeFood,
        3 => Action::Eat,
        4 => Action::Chill,
        5 => Action::SelfMotivate,
        // _ => Action::Chill,
        _ => panic!("invalid index"),
    }
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
pub struct NeuralAgent {
    pub data: AgentData,
    pub neurons: Vec<Neuron>,
    pub thinking: usize,
}

impl NeuralAgent {
    const SENSOR_COUNT: usize = 9; // Moved to impl block for consistency

    pub fn new(rng: &mut impl Rng, data: AgentData, thinking: usize, size: usize) -> NeuralAgent {
        NeuralAgent {
            data,
            neurons: (0..size)
                .map(|_| Neuron::new(rng, Self::SENSOR_COUNT + size))
                .collect(),
            thinking,
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
                data.state["motivation"].v,
                data.state["motivation"].s,
                data.food,
                data.altruism,
                context.community_food,
            ];
            inputs.extend(self.neurons.iter().map(|neuron| neuron.output));
            for neuron in &mut self.neurons {
                neuron.compute(&inputs);
            }
        }
        let mut output_indexes: Vec<usize> = (0..self.neurons.len()).collect();
        output_indexes.sort_by(|left, right| {
            self.neurons[*right]
                .output
                .total_cmp(&self.neurons[*left].output)
        });
        output_indexes
            .into_iter()
            .filter(|index| *index <= 5)
            .map(action_from_output_index)
            .collect()
    }
}
