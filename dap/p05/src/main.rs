use rand::Rng;
fn std_random() -> f32 {
    let mut rng = rand::thread_rng();
    return rng.gen::<f32>();
}
fn main() {
    println!("{}", random_ranged(1.0, 2.0));
}
fn mul(a: f32, b: f32) -> f32 {
    return a * b;
}
fn dist(a: f32, b: f32) -> f32 {
    return b - a;
}
fn random_ranged(min: f32, max: f32) -> f32 {
    return mul(std_random(), dist(min, max));
}
