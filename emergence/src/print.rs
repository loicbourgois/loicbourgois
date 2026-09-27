use crate::TURNS;
use crate::format_duration;
use std::time::Instant;

pub fn print_progress(turn: usize, started_at: Instant) {
    let progress = turn as f32 / TURNS as f32;
    let elapsed = started_at.elapsed();
    let estimated_total = elapsed.div_f32(progress);
    let estimated_remaining = estimated_total.saturating_sub(elapsed);
    println!(
        "{turn:5}/{TURNS} - {:5.1}% - {}/{} - {}",
        progress * 100.0,
        format_duration(elapsed),
        format_duration(estimated_total),
        format_duration(estimated_remaining),
    );
}
