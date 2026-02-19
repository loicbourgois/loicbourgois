// file://./../../../movie_finder/server/src/main.rs
use actix_web::HttpServer;
use actix_web::App;
use std::collections::HashMap;
use actix_web::HttpResponse;
use actix_cors::Cors;
use actix_web::web;
use serde::Serialize;
 use actix_web::Responder;
use actix_web::get;
use std::env;
use chrono::DateTime;
use chrono::Utc;

#[derive(Serialize)]
struct SearchResult {
    qid: String,
    score: f32,
}

#[derive(Serialize)]
struct SearchResponse {
    search: String,
    results: Vec<SearchResult>,
}

#[get("/search/{search_str}")]
async fn search(search_str: web::Path<String>, data: web::Data<Data>) -> impl Responder {
    let mut results = Vec::new();
    for (k, v) in &data.search_str_2_movie_qid {
        if *k == *search_str {
            results.push(SearchResult{
                qid: v.to_string(),
                score: 1.0,
            });
        } else {
            results.push(SearchResult{
                qid: v.to_string(),
                score: 0.0,
            });
        }
    }
    let response = SearchResponse {
        search: search_str.to_string(),
        results,
    };
    HttpResponse::Ok().json(response)
}


#[derive(Serialize)]
struct AboutResponse {
    start: String,
}

#[get("/about")]
async fn about(data: web::Data<Data>) -> impl Responder {
    HttpResponse::Ok().json(AboutResponse{
        start: data.start_time.to_string(),
    })
}

#[derive(Clone)]
pub struct Data {
    search_str_2_movie_qid: HashMap<String, String>,
    start_time: DateTime<Utc>,
}

pub fn load_data() -> std::io::Result<Data> {
    let mut data = Data {
        start_time: Utc::now(),
        search_str_2_movie_qid: HashMap::new()
    };
    data.search_str_2_movie_qid.insert("titanic".to_string(), "Q44578".to_string());
    data.search_str_2_movie_qid.insert("avatar".to_string(), "Q24871".to_string());
    return Ok(data)
}


pub struct Config {
    workers: usize,
}

pub fn get_config (environment: &str) -> Config {
    match environment {
        "local" => Config {
            workers: 1
        },
        "staging" => Config {
            workers: 1
        },
        _ => panic!("invalid environment")
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let environment = match env::var("environment") {
        Ok(value) => match value.as_str() {
            "local" => "local",
            "staging" => "staging",
            _ => panic!("invalid environment")
        },
        Err(e) => panic!("couldn't read environment: {}", e),
    };
    let config = get_config(environment);
    println!("[start] load_data");
    let data = load_data()?;
    println!("[ end ] load_data");
    let mut server = HttpServer::new(move || {
        println!("[start] setup");
        let cors = match environment {
            "local" => Cors::default()
                .allowed_origin("http://localhost"),
            "staging" => Cors::default()
                .allowed_origin("http://localhost"),
            _ => panic!("invalid environment")
        };
            // .allowed_origin("localhost")
            // .allowed_origin("loicbourgois.com")
            // .allowed_origin("http://loicbourgois.com")
            // .allowed_origin("https://loicbourgois.com")
        let app = App::new()
            .app_data(web::Data::new(data.clone()))
            .wrap(cors)
            .service(search)
            .service(about);
        println!("[ end ] setup");
        app
    })
    .workers(config.workers);
    // let secure = false;
    // if secure {
    //     let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls()).unwrap();
    //     builder
    //         .set_private_key_file("/home/gravitle/privkey.pem", SslFiletype::PEM)
    //         .unwrap();
    //     builder
    //         .set_certificate_chain_file("/home/gravitle/fullchain.pem")
    //         .unwrap();
    //     aa = aa.bind_openssl("0.0.0.0:9000", builder)?;
    // } else {
    //     aa = aa.bind(("0.0.0.0", 9000))?;
    // }
    server = server.bind(("0.0.0.0", 3000))?;
    server.run().await
}
