use axum::{
    routing::post,
    Json, Router,
    extract::State,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Debug, Deserialize)]
struct MovieRequest {
    movie: String,
}

#[derive(Debug, Serialize)]
struct MovieResponse {
    movie_id: String,
}

#[tokio::main]
async fn main() {
    // Router with one POST route
    let app = Router::new().route("/movie", post(get_movie_id));

    println!("Server running at http://localhost:3000");

    axum::Server::bind(&"0.0.0.0:3000".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn get_movie_id(Json(req): Json<MovieRequest>) -> Json<MovieResponse> {
    // Simulate lookup logic
    let id = if req.movie == "Titanic" {
        "Q44578".to_string()
    } else {
        "unknown".to_string()
    };

    Json(MovieResponse { movie_id: id })
}