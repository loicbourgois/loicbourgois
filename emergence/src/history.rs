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

    // pub fn len(&self) -> usize {
    //     self.metrics.len()
    // }

    // pub fn is_empty(&self) -> bool {
    //     self.metrics.is_empty()
    // }

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
}

pub struct Metric {
    pub deaths: usize,
    pub community_food: f32,
    pub max_age: usize,
    pub median_age: usize,
    pub avg_age: f32,
    pub avg_happiness: f32,
    pub median_happiness: f32,
    pub avg_health: f32,
    pub median_health: f32,
}
