struct distance_input {
    start: f32,
    end: f32,
}
fn distance(x: &distance_input) -> f32 {
    return x.end - x.start;
}
fn main() {
    println!(
        "{}",
        distance(&distance_input {
            end: 3.6,
            start: 1.0
        })
    );
}
