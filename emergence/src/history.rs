use crate::Action;
use crate::Metric;
use crate::agent::agent_kind::AgentKind;
use std::collections::HashMap;

pub struct History {
    metrics: Vec<Metric>,
}

impl History {
    pub fn new() -> Self {
        History {
            metrics: Vec::new(),
        }
    }
    pub fn push(&mut self, m: Metric) {
        self.metrics.push(m)
    }
    pub fn iter(&self) -> impl Iterator<Item = &Metric> {
        self.metrics.iter()
    }

    pub fn max_age_by_kind(&self) -> Vec<HashMap<AgentKind, usize>> {
        self.iter()
            .map(|metric| metric.max_age_by_kind.clone())
            .collect()
    }
    pub fn deaths(&self) -> Vec<usize> {
        self.iter().map(|metric| metric.deaths).collect::<Vec<_>>()
    }

    pub fn community_food(&self) -> Vec<f32> {
        self.iter()
            .map(|metric| metric.community_food)
            .collect::<Vec<_>>()
    }

    pub fn max_age(&self) -> Vec<usize> {
        self.iter().map(|metric| metric.max_age).collect()
    }

    pub fn median_age(&self) -> Vec<usize> {
        self.iter().map(|metric| metric.median_age).collect()
    }

    pub fn avg_age(&self) -> Vec<f32> {
        self.iter().map(|metric| metric.avg_age).collect()
    }
    pub fn avg_happiness(&self) -> Vec<f32> {
        self.iter().map(|metric| metric.avg_happiness).collect()
    }

    pub fn median_happiness(&self) -> Vec<f32> {
        self.iter().map(|metric| metric.median_happiness).collect()
    }

    pub fn avg_health(&self) -> Vec<f32> {
        self.iter().map(|metric| metric.avg_health).collect()
    }

    pub fn median_health(&self) -> Vec<f32> {
        self.iter().map(|metric| metric.median_health).collect()
    }

    pub fn count_by_kind(&self) -> Vec<HashMap<AgentKind, usize>> {
        self.iter()
            .map(|metric| metric.count_by_kind.clone())
            .collect()
    }

    pub fn actions_taken(&self) -> Vec<HashMap<Action, usize>> {
        self.iter()
            .map(|metric| metric.actions_taken.clone())
            .collect()
    }
}
