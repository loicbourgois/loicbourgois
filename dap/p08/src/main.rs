struct new_vec_input {
    size: usize,
}
fn new_vec(x: &new_vec_input) -> Vec<f32> {
    return vec![0.0; x.size];
}
struct new_matrice_input {
    width: usize,
    height: usize,
}
fn new_matrice(x: &new_matrice_input) -> Matrice {
    return Matrice {
        columns: x.width,
        row: x.height,
        data: vec![0.0; x.width * x.height],
    };
}
fn main() {
    return println!(
        "{:?}",
        new_matrice(&new_matrice_input {
            width: 2,
            height: 3
        })
    );
}
struct Matrice {
    columns: usize,
    row: usize,
    data: Vec<f32>,
}
