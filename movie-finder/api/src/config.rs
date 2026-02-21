pub struct Config {
    pub workers: usize,
}

#[must_use]
pub fn get_config(environment: &str) -> Config {
    match environment {
        "local" => Config { workers: 1 },
        "staging" => Config { workers: 1 },
        _ => panic!("invalid environment"),
    }
}
