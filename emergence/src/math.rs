use rand::Rng;

pub fn rand(rng: &mut impl Rng, min_inclusive: f32, max_inclusive: f32) -> f32 {
    rng.gen_range(min_inclusive..=max_inclusive)
}
