// reference: file://./../../../../movie_finder/server/src/main.rs

mod about;
mod config;
mod data;
mod media;
mod random;
mod search;
mod search_review;
use crate::search_review::search_review_service;
mod text;
use crate::about::about_service;
use crate::config::get_config;
use crate::data::Data;
use crate::data::load_data;
use crate::media::get_media_service;
use crate::random::random_service;
use crate::search::search_service;
use actix_cors::Cors;
use actix_web::App;
use actix_web::HttpServer;
use actix_web::web;
use openssl::ssl::SslAcceptor;
use openssl::ssl::SslFiletype;
use openssl::ssl::SslMethod;
use std::env;
use std::path::PathBuf;

use actix_web::http;

fn get_key_path(environment: &str) -> PathBuf {
    match environment {
        "local" => {
            let home_dir = env::var("HOME").expect("HOME environment variable not set");
            let mut path = PathBuf::from(home_dir);
            path.push("github.com/loicbourgois/loicbourgois/privkey.pem");
            path
        }
        "staging" => {
            let home_dir = env::var("HOME").expect("HOME environment variable not set");
            let mut path = PathBuf::from(home_dir);
            path.push("github.com/loicbourgois/loicbourgois/privkey.pem");
            path
        }
        _ => panic!("invalid"),
    }
}

fn get_chain_path(environment: &str) -> PathBuf {
    match environment {
        "local" => {
            let home_dir = env::var("HOME").expect("HOME environment variable not set");
            let mut path = PathBuf::from(home_dir);
            path.push("github.com/loicbourgois/loicbourgois/fullchain.pem");
            path
        }
        "staging" => {
            let home_dir = env::var("HOME").expect("HOME environment variable not set");
            let mut path = PathBuf::from(home_dir);
            path.push("github.com/loicbourgois/loicbourgois/fullchain.pem");
            path
        }
        _ => panic!("invalid"),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let environment = match env::var("environment") {
        Ok(value) => match value.as_str() {
            "local" => "local",
            "staging" => "staging",
            _ => panic!("invalid environment"),
        },
        Err(e) => panic!("couldn't read environment: {e}"),
    };
    let config = get_config(environment);
    let mut server = HttpServer::new(move || {
        println!("[start] load_data");
        let data = load_data();
        println!("[ end ] load_data");
        println!("[start] setup");
        let cors = match environment {
            "local" => Cors::default()
                .allowed_origin("https://localhost")
                .allowed_origin("https://loicbourgois.com")
                .allowed_methods(vec!["GET", "POST", "OPTIONS"])
                .allowed_headers(vec![
                    http::header::AUTHORIZATION,
                    http::header::ACCEPT,
                    http::header::ORIGIN,
                ])
                .allowed_header(http::header::CONTENT_TYPE)
                .supports_credentials(),
            "staging" => Cors::default()
                .allowed_origin("https://localhost")
                .allowed_origin("https://loicbourgois.com")
                .allowed_methods(vec!["GET", "POST", "OPTIONS"])
                .allowed_headers(vec![
                    http::header::AUTHORIZATION,
                    http::header::ACCEPT,
                    http::header::ORIGIN,
                ])
                .allowed_header(http::header::CONTENT_TYPE)
                .supports_credentials(),
            _ => panic!("invalid environment"),
        };
        let app = App::new()
            .app_data(web::Data::new(data))
            .wrap(cors)
            .service(search_service)
            .service(search_review_service)
            .service(about_service)
            .service(random_service)
            .service(get_media_service);
        println!("[ end ] setup");
        app
    })
    .workers(config.workers);
    let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls()).unwrap();
    builder
        .set_private_key_file(get_key_path(environment), SslFiletype::PEM)
        .unwrap();
    builder
        .set_certificate_chain_file(get_chain_path(environment))
        .unwrap();
    server = server.bind_openssl("0.0.0.0:3000", builder)?;
    server.run().await
}
