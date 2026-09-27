mod action;
mod agent;
mod attribute;
mod chart;
mod community;
mod config;
mod history;
mod math;
mod metric;
mod print;
mod simulation;

use crate::action::Action;
use crate::agent::ActionContext;
use crate::agent::Agent;
use crate::agent::agent_kind::AgentKind;
use crate::attribute::AttributeDefinition;
use crate::community::Community;
use crate::config::Config;
use crate::history::History;
use crate::metric::Metric;
use crate::print::print_progress;
use chart::print_actions_chart;
use chart::print_agent_kind_chart;
use chart::print_chart_f32;
use chart::print_chart_usize;
use chart::print_max_age_by_kind_chart;
use simulation::Simulation;
use std::error::Error;
use std::time::Duration;
use std::time::Instant;

const AGENT_COUNT: usize = 401;
const TURNS: usize = 200001;
const PASSIVE_DECAY: f32 = 0.1;
const MEDITATION_INCREMENT: f32 = 0.2;
const REST_INCREMENT: f32 = 0.75;
const EAT_INCREMENT: f32 = 0.75;
const MORTALITY_CHANCE: f32 = 0.00001;
const FOOD_FOUND: f32 = 1.0;

fn format_duration(duration: Duration) -> String {
    let total_seconds = duration.as_secs();
    let hours = total_seconds / 3600;
    let minutes = (total_seconds % 3600) / 60;
    let seconds = total_seconds % 60;
    format!("{hours:02}h{minutes:02}m{seconds:02}s")
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
    let food_limits = [
        // 0.8,
        // 0.98
        1000.0,
        // 0.8,
    ];
    let started_at = Instant::now();
    for turn in 0..TURNS {
        let phase = turn * food_limits.len() / TURNS;
        simulation.food_limit = food_limits[phase];
        simulation.step(&mut community, &mut rng);
        history.push(Metric::from_simulation(&simulation, &community));
        simulation.replace_dead(&config, &mut rng, &mode);
        if turn % (1000) == 0 {
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
    }
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
    Ok(())
}
