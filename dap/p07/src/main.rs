struct distance_input {
    start: f32,
    end: f32,
}
fn distance(x: &distance_input) -> f32 {
    return x.end - x.start;
}
fn main() {
    return println!(
        "{}",
        distance(&distance_input {
            start: 1.0,
            end: 3.6
        })
    );
}
