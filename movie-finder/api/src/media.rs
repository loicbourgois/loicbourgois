use crate::data::Data;
use crate::text::generate_trigrams;
use actix_web::HttpResponse;
use actix_web::Responder;
use actix_web::get;
use actix_web::web;
use rand::prelude::IndexedRandom;
use rand::rng;
use serde::Deserialize;
use serde::Serialize;
use std::collections::HashMap;

#[derive(Deserialize, Clone, Serialize, PartialEq)]
pub struct Media {
    pub kind: String,
    pub qid: String,
    pub omdb_image_link: String,
    pub imdb_link: String,
    pub language: String,
    pub label: String,
}

#[derive(Serialize)]
pub struct Recommendation {
    pub qid: String,
    pub score: f32,
    pub label: String,
}

#[derive(Serialize)]
pub struct MediaRecommendation {
    pub kind: String,
    pub qid: String,
    pub omdb_image_link: String,
    pub imdb_link: String,
    pub language: String,
    pub label: String,
    pub reco: Recommendation,
}

#[derive(Serialize)]
pub struct MediaResponse {
    pub media: Media,
    pub recommandations: Vec<Media>,
}

#[derive(Serialize)]
pub struct MediaRecommandationResponse {
    pub media: Media,
    pub recommandations: Vec<MediaRecommendation>,
}

#[derive(Serialize, Clone)]
pub struct Reco {
    pub qid: String,
    pub score: f32,
    pub label: String,
    pub media: Option<Media>,
}

#[get("/get/{qid}")]
pub async fn get_media_service(qid: web::Path<String>, data: web::Data<Data>) -> impl Responder {
    let medias: Vec<_> = data
        .wikidata_imdb_omd
        .iter()
        .filter(|x| x.qid == *qid)
        .collect();
    let mut rng = rng();
    let media = medias
        .choose(&mut rng)
        .copied()
        .expect("Failed to choose media");
    let recommandations = recommandations_via_trigrams(&media.label, &data, &qid);
    HttpResponse::Ok().json(MediaRecommandationResponse {
        media: media.clone(),
        recommandations,
    })
}

fn get_1_wikidata_imdb_omd_by_qid(qid: &str, data: &Data) -> Option<Media> {
    match data.qid_2_wikidata_imdb_omd.get(qid) {
        Some(v) => {
            let mut rng = rng();
            let media = v.choose(&mut rng).cloned().expect("Failed to choose media");
            Some(media)
        }
        None => None,
    }
}

fn recommandations_via_trigrams(label: &str, data: &Data, qid: &str) -> Vec<MediaRecommendation> {
    let trigrams = generate_trigrams(label);
    let mut matches: HashMap<String, f32> = HashMap::new();
    for trigram in &trigrams {
        match data.trigram_2_search_str.get(trigram) {
            Some(search_strs) => {
                for search_str in search_strs {
                    if !matches.contains_key(search_str) {
                        matches.insert(search_str.to_string(), 0.0);
                    }
                    let value = matches.get(search_str).unwrap();
                    matches.insert(search_str.to_string(), value + 1.0);
                }
            }
            None => {}
        }
    }
    let mut results = HashMap::new();
    for (search_str, v) in matches {
        let percent = v / (trigrams.len() as f32);
        let percent_2 = (trigrams.len() as f32) / (generate_trigrams(&search_str).len() as f32);
        let score = percent.min(percent_2);
        let qids = data.search_str_2_movie_qid.get(&search_str).unwrap();
        for qid in qids {
            results
                .entry(qid.to_string())
                .and_modify(|existing: &mut Reco| {
                    if score > existing.score {
                        existing.score = score;
                        existing.label = search_str.to_string();
                    }
                })
                .or_insert(Reco {
                    qid: qid.to_string(),
                    score,
                    label: search_str.to_string(),
                    media: get_1_wikidata_imdb_omd_by_qid(qid, data),
                });
        }
    }
    let mut results_vec: Vec<Reco> = results.values().cloned().collect();
    results_vec.sort_by(|a, b| {
        b.score
            .partial_cmp(&a.score)
            .unwrap_or(std::cmp::Ordering::Equal)
    });
    results_vec.retain(|r| r.media.is_some());
    results_vec.retain(|r| r.qid != qid);
    results_vec.truncate(100);
    let medias: Vec<MediaRecommendation> = results_vec
        .into_iter()
        .map(|r| {
            let m = r.media.unwrap();
            MediaRecommendation {
                kind: m.kind,
                qid: m.qid,
                omdb_image_link: m.omdb_image_link,
                imdb_link: m.imdb_link,
                language: m.language,
                label: m.label,
                reco: Recommendation {
                    qid: r.qid,
                    score: r.score,
                    label: r.label,
                },
            }
        })
        .collect();
    medias
}
