fn main() {
    println!("{}", plus_one(4.0));
    println!("{}", sum(2.0, 8.0));
}
fn plus_one(x: f32) -> f32 {
    return x + 1.0;
}
fn sum(a: f32, b: f32) -> f32 {
    return a + b;
}
