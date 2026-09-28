pub const ACTION_COUNT: usize = 6;

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub enum Action {
    FindFood,
    GiveFood,
    TakeFood,
    Eat,
    Chill,
    Meditate,
}
