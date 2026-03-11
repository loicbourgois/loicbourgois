use crate::data::Data;
use crate::search::get_matches;
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
use std::collections::HashSet;

#[derive(Deserialize, Clone, Serialize, PartialEq)]
pub struct Media {
    pub kind: String,
    pub qid: String,
    pub omdb_image_link: String,
    pub imdb_link: String,
    pub language: String,
    pub label: String,
}

#[derive(Serialize, Clone)]
pub struct Recommendation {
    pub qid: String,
    pub score: f32,
    pub label: String,
    pub trigrams: HashSet<String>,
}

#[derive(Serialize, Clone)]
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
    pub trigrams: HashSet<String>,
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
    let recommandations = match get_1_plot_by_qid(&qid, &data) {
        Some(plot) => recommandations_via_plot_trigrams(&plot, &data, &qid),
        None => Vec::new(),
    };
    HttpResponse::Ok().json(MediaRecommandationResponse {
        media: media.clone(),
        recommandations,
    })
}

pub fn get_1_plot_by_qid(qid: &str, data: &Data) -> Option<String> {
    match data.qid_2_plot.get(qid) {
        Some(v) => {
            let mut rng = rng();
            let plot = v.choose(&mut rng).cloned().expect("Failed to choose plot");
            Some(plot)
        }
        None => None,
    }
}

pub fn get_1_wikidata_imdb_omd_by_qid(qid: &str, data: &Data) -> Option<Media> {
    match data.qid_2_wikidata_imdb_omd.get(qid) {
        Some(v) => {
            let mut rng = rng();
            let media = v.choose(&mut rng).cloned().expect("Failed to choose media");
            Some(media)
        }
        None => None,
    }
}

fn recommandations_via_plot_trigrams(
    plot: &str,
    data: &Data,
    qid: &str,
) -> Vec<MediaRecommendation> {
    let plot_trigrams = generate_trigrams(plot);
    let matches = get_matches(&plot_trigrams, &data.trigram_2_plot_hash);
    let mut results = HashMap::new();
    for (plot_hash, trigrams) in matches {
        // let score = (trigrams.len() as f32) / (plot_hash.len() as f32);
        let score = trigrams.len() as f32;
        let qid = data.plot_hash_2_qid.get(&plot_hash).unwrap();
        results
            .entry(qid.to_string())
            .and_modify(|existing: &mut Reco| {
                if score > existing.score {
                    existing.score = score;
                    existing.label = plot.to_string();
                    existing.trigrams.clone_from(&trigrams);
                }
            })
            .or_insert(Reco {
                qid: qid.to_string(),
                score,
                label: plot.to_string(),
                media: get_1_wikidata_imdb_omd_by_qid(qid, data),
                trigrams: trigrams.clone(),
            });
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
                    trigrams: r.trigrams,
                },
            }
        })
        .collect();
    for m in medias.iter().rev() {
        println!(
            "{} - {} - {} - {:?}",
            m.reco.score,
            m.label,
            m.imdb_link.clone(),
            m.reco.trigrams,
        );
    }
    println!("qid: {qid}");
    medias
}
