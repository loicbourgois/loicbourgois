mod action;
mod agent;
mod attribute;
mod chart;
mod community;
mod config;
mod format;
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
use crate::print::print_final;
use crate::print::print_wip;
use crate::simulation::SharedState;
use serde::Serialize;
use simulation::Simulation;
use std::error::Error;
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::time::Instant;

const AGENT_COUNT: usize = 401;
const PASSIVE_DECAY: f32 = 0.1;
const MEDITATION_INCREMENT: f32 = 0.2;
const REST_INCREMENT: f32 = 0.75;
const EAT_INCREMENT: f32 = 0.75;
const MORTALITY_CHANCE: f32 = 0.00001;
const FOOD_FOUND: f32 = 1.0;

use actix_web::{App, HttpResponse, HttpServer, Responder, web};

#[derive(Serialize)]
struct TurnResponse {
    turn: usize,
}

use std::sync::{Arc, Mutex};

async fn get_turn(data: web::Data<Arc<Mutex<SharedState>>>) -> impl Responder {
    match data.lock() {
        Ok(state) => HttpResponse::Ok().json(TurnResponse { turn: state.turn }),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

#[actix_web::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let mode = std::env::args()
        .nth(1)
        .ok_or("missing mode: expected rule, neural, or random")?;
    if !matches!(mode.as_str(), "rule" | "neural" | "random") {
        return Err(format!("invalid mode {mode:?}: expected rule, neural, or random").into());
    }
    let config = Config::load()?;
    let mut rng = rand::thread_rng();
    let mut simulation = Simulation::new(&config, &mut rng, &mode);
    let shared_state_clone = simulation.shared_state.clone();
    // Bind HTTP server before starting the simulation
    // so a bind error leaves no worker running.
    let server = HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(shared_state_clone.clone()))
            .route("/turn", web::get().to(get_turn))
    })
    .bind("127.0.0.1:8080")?
    .run();
    let stop = Arc::new(AtomicBool::new(false));
    let worker_stop = Arc::clone(&stop);
    let worker = thread::spawn(move || {
        let mut community = Community::new();
        let mut history = History::new();
        let mut rng = rand::thread_rng();
        let started_at = Instant::now();
        while !worker_stop.load(Ordering::Relaxed) {
            simulation.step(&mut community, &mut rng);
            history.push(Metric::from_simulation(&simulation, &community));
            simulation.replace_dead(&config, &mut rng, &mode);
            let turn = {
                let mut state = simulation.shared_state.lock().unwrap();
                state.turn += 1;
                state.turn
            };
            if turn.is_multiple_of(1000) {
                print_wip(&history, started_at, turn);
            }
        }
        print_final(
            &history,
            started_at,
            simulation.shared_state.lock().unwrap().turn,
        );
    });
    let server_result = server.await; // Returns when Ctrl+C stops the server.
    stop.store(true, Ordering::Relaxed);
    worker.join().expect("simulation thread panicked");
    server_result?;
    Ok(())
}
