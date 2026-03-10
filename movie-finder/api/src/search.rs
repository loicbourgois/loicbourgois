use crate::Data;
use crate::media::MediaRecommendation;
use crate::media::Recommendation;
use crate::media::get_1_wikidata_imdb_omd_by_qid;
use crate::text;
use crate::text::generate_trigrams;
use actix_web::HttpResponse;
use actix_web::Responder;
use actix_web::get;
use actix_web::web;
use serde::Serialize;
use std::collections::HashMap;
use std::collections::HashSet;

#[derive(Serialize, Clone)]
pub struct SearchResult {
    pub qid: String,
    pub score: f32,
    pub wikidata: String,
    pub label: String,
    pub omdb_image_link: Option<HashSet<String>>,
    pub imdb_link: Option<String>,
    pub search_back_link: Option<String>,
    pub trigrams: HashSet<String>,
}

#[derive(Serialize, Clone)]
pub struct SearchResponse {
    pub search: String,
    pub results: Vec<MediaRecommendation>,
}

pub fn get_matches(
    search_trigrams: &HashSet<String>,
    data: &Data,
) -> HashMap<String, HashSet<String>> {
    let mut matches: HashMap<String, HashSet<String>> = HashMap::new();
    for trigram in search_trigrams {
        match data.trigram_2_plot_hash.get(trigram) {
            Some(search_strs) => {
                for search_str in search_strs {
                    if !matches.contains_key(search_str) {
                        matches.insert(search_str.to_string(), HashSet::new());
                    }
                    let trigrams = matches.get_mut(search_str).unwrap();
                    trigrams.insert(trigram.to_string());
                }
            }
            None => {}
        }
    }
    matches
}

#[get("/search/{search_str}")]
async fn search_service(search_str: web::Path<String>, data: web::Data<Data>) -> impl Responder {
    let search_str = text::normalize(&search_str);
    let mut results = HashMap::new();
    let search_trigrams = generate_trigrams(&search_str);
    let matches = get_matches(&search_trigrams, &data);
    for (plot_hash, trigrams) in matches {
        let score = trigrams.len() as f32;
        let qid = data.plot_hash_2_qid.get(&plot_hash).unwrap();
        results
            .entry(qid.to_string())
            .and_modify(|existing: &mut SearchResult| {
                if score > existing.score {
                    existing.score = score;
                    existing.label = search_str.to_string();
                    existing.trigrams.clone_from(&trigrams);
                }
            })
            .or_insert(SearchResult {
                qid: qid.to_string(),
                score,
                wikidata: format!("https://www.wikidata.org/wiki/{qid}"),
                label: search_str.to_string(),
                omdb_image_link: None,
                imdb_link: None,
                search_back_link: None,
                trigrams: trigrams.clone(),
            });
    }
    let mut results_vec: Vec<SearchResult> = results.values().cloned().collect();
    for x in &mut results_vec {
        x.omdb_image_link = data.qid_2_omdb_image_link.get(&x.qid).cloned();
        x.imdb_link = data.qid_2_imdb_link.get(&x.qid).cloned();
        x.search_back_link = Some(format!("https://localhost:3000/search/{}", x.label));
    }
    results_vec.sort_by(|a, b| {
        b.score
            .partial_cmp(&a.score)
            .unwrap_or(std::cmp::Ordering::Equal)
    });
    results_vec.retain(|x| x.omdb_image_link.is_some());
    results_vec.truncate(100);
    let medias: Vec<MediaRecommendation> = results_vec
        .clone()
        .into_iter()
        .map(|r| {
            let m = get_1_wikidata_imdb_omd_by_qid(&r.qid, &data).unwrap();
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
    println!("search_str: {search_str}");
    let response = SearchResponse {
        search: search_str.to_string(),
        results: medias,
    };
    HttpResponse::Ok().json(response)
}
