use crate::TURNS;
use crate::action::Action;
use crate::chart::print_actions_chart;
use crate::chart::print_agent_kind_chart;
use crate::chart::print_chart_f32;
use crate::chart::print_chart_usize;
use crate::chart::print_max_age_by_kind_chart;
use crate::format::format_duration;
use crate::history::History;
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

pub fn print_wip(history: &History, started_at: Instant, turn: usize) {
    // print_max_age_by_kind_chart(&history.max_age_by_kind(), "max_age by kind");
    // print_chart_f32(&history.avg_age(), "avg_age");

    println!("\n\n");
    print_actions_chart(
        &history.actions_taken(),
        &[
            Action::Eat,
            Action::Chill,
            Action::GiveFood,
            Action::FindFood,
            Action::TakeFood,
            Action::Meditate,
        ],
        "actions taken",
    );
    println!("");
    print_progress(turn + 1, started_at);
}

pub fn print_final(history: &History, started_at: Instant) {
    print_agent_kind_chart(&history.count_by_kind(), "agent kind counts");
    print_chart_usize(&history.median_age(), "median_age");
    print_chart_f32(&history.median_happiness(), "median_happiness");
    print_chart_f32(&history.avg_health(), "avg_health");
    print_chart_f32(&history.median_health(), "median_health");
    print_chart_f32(&history.avg_happiness(), "avg_happiness");
    print_chart_usize(&history.deaths(), "deaths");
    print_chart_f32(&history.community_food(), "community_food");
    print_chart_usize(&history.max_age(), "max_age");
    print_max_age_by_kind_chart(&history.max_age_by_kind(), "max_age by kind");
    print_chart_f32(&history.avg_age(), "avg_age");
    print_actions_chart(
        &history.actions_taken(),
        &[
            Action::Eat,
            Action::Chill,
            Action::GiveFood,
            Action::FindFood,
            Action::TakeFood,
            Action::Meditate,
        ],
        "actions taken",
    );
    println!("");
    print_progress(TURNS, started_at);
}
