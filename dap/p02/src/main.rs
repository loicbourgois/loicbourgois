use chrono::Utc;
use rand::Rng;
fn main() {
    let mut rng = rand::thread_rng();
    println!("{}", rng.gen::<f32>());
}
fn log(s: &str) {
    println!("{} {} {}", Utc::now(), "|", s);
}
