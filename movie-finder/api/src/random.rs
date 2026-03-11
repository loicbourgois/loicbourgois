use crate::data::Data;
use crate::media::MediaResponse;
use actix_web::HttpResponse;
use actix_web::Responder;
use actix_web::get;
use actix_web::web;
use rand::prelude::IndexedRandom;
use rand::prelude::IteratorRandom;
use rand::rng;

#[get("/random")]
pub async fn random_service(data: web::Data<Data>) -> impl Responder {
    let mut rng = rng();
    let media = data
        .wikidata_imdb_omd
        .choose(&mut rng)
        .cloned()
        .expect("Failed to choose media");
    let recommandations = data
        .wikidata_imdb_omd
        .iter()
        .filter(|m| m != &&media)
        .sample(&mut rng, 99)
        .into_iter()
        .cloned()
        .collect();
    HttpResponse::Ok().json(MediaResponse {
        media,
        recommandations,
    })
}
