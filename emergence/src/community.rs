#[derive(Debug, Default)]
pub struct Community {
    pub food: f32,
}

impl Community {
    pub fn new() -> Self {
        Community { food: 0.0 }
    }
}
