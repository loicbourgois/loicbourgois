use chrono::Utc;
fn main() {
    println!("{}", 1);
    println!("{}", "Hello");
    println!("{} {}", "Hello", "World");
    log(&format!("{} {}", "Hello", "World"));
}
fn log(s: &str) {
    println!("{} {} {}", Utc::now(), "|", s);
}
