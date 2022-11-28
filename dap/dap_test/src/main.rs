fn sum(a: f32, b: f32) -> f32 {
    a + b
}

fn main() {
    let say_hello = || println!("Hello, world!");
    say_hello();
    println!("{}", sum(2.0, 4.0));
    let pairs = [[2.0, 3.0], [3.0, 2.9]];

    // let sum_lambda =

    let sums = pairs.map(|x| sum(x[0], x[1]));
    println!("{:?}", sums);
}
