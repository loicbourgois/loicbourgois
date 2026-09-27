use std::error::Error;
mod chart;
mod community;
use crate::community::Community;
mod config;
mod history;
use crate::history::History;
use crate::history::Metric;
use crate::simulation::Simulation;
use chart::print_agent_kind_chart;
use chart::print_chart_f32;
use chart::print_chart_usize;
use std::time::Duration;
use std::time::Instant;
mod agent;
use crate::agent::Agent;
use crate::agent::agent_kind::AgentKind;
mod attribute;
use crate::agent::ActionContext;
use crate::attribute::AttributeDefinition;
mod action;
mod simulation;
use crate::action::Action;
use crate::config::Config;

const AGENT_COUNT: usize = 400;
const TURNS: usize = 50001;
const PASSIVE_DECAY: f32 = 0.046;
const ACTION_INCREMENT: f32 = 0.06;
const EAT_INCREMENT: f32 = 0.5;
const MORTALITY_CHANCE: f32 = 0.00001;

#[derive(Debug)]
struct Rule {
    name: String,
}

fn format_duration(duration: Duration) -> String {
    let total_seconds = duration.as_secs();
    let hours = total_seconds / 3600;
    let minutes = (total_seconds % 3600) / 60;
    let seconds = total_seconds % 60;
    format!("{hours:02}h{minutes:02}m{seconds:02}s")
}

fn print_progress(turn: usize, started_at: Instant) {
    let progress = turn as f32 / TURNS as f32;
    let elapsed = started_at.elapsed();
    let estimated_total = elapsed.div_f32(progress);
    let estimated_remaining = estimated_total.saturating_sub(elapsed);
    println!(
        "{turn}/{TURNS} - {:.1}% - {}/{}/{}",
        progress * 100.0,
        format_duration(estimated_remaining),
        format_duration(elapsed),
        format_duration(estimated_total),
    );
}

fn main() -> Result<(), Box<dyn Error>> {
    let mode = std::env::args().nth(1).unwrap();
    let config = Config::load()?;
    let mut rng = rand::thread_rng();
    let mut simulation = Simulation::new(&config, &mut rng, &mode);
    let mut community = Community::new();
    println!(
        "created {} agents with {} attributes",
        simulation.agents.len(),
        config.attributes.len()
    );
    let mut history = History::new();
    let food_limits = [100.0, 1.0, 0.9];
    let started_at = Instant::now();
    for turn in 0..TURNS {
        let phase = turn * food_limits.len() / TURNS;
        simulation.food_limit = food_limits[phase];
        simulation.step(&mut community, &mut rng, turn);
        history.push(Metric::from_simulation(&simulation, &community));
        simulation.replace_dead(&config, &mut rng, &mode);
        if turn % (TURNS / 30) == 0 {
            print_progress(turn + 1, started_at);
            print_chart_usize(&history.max_age(), "max_age");
            print_chart_f32(&history.avg_age(), "avg_age");
        }
    }
    print_agent_kind_chart(&history.count_by_kind(), "agent kind counts");
    print_chart_usize(&history.deaths(), "deaths");
    print_chart_usize(&history.median_age(), "median_age");
    print_chart_f32(&history.avg_happiness(), "avg_happiness");
    print_chart_f32(&history.median_happiness(), "median_happiness");
    print_chart_f32(&history.avg_health(), "avg_health");
    print_chart_f32(&history.median_health(), "median_health");
    print_chart_f32(&history.community_food(), "community_food");
    print_progress(TURNS, started_at);
    print_chart_usize(&history.max_age(), "max_age");
    print_chart_f32(&history.avg_age(), "avg_age");
    Ok(())
}
