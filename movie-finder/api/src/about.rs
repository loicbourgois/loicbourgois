use crate::data::Data;
use actix_web::HttpResponse;
use actix_web::Responder;
use actix_web::get;
use actix_web::web;
use serde::Serialize;

#[derive(Serialize)]
struct AboutResponse {
    start: String,
}

#[get("/about")]
pub async fn about_service(data: web::Data<Data>) -> impl Responder {
    HttpResponse::Ok().json(AboutResponse {
        start: data.start_time.to_string(),
    })
}
