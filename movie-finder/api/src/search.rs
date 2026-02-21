use crate::Data;
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
struct SearchResult {
    qid: String,
    score: f32,
    wikidata: String,
    label: String,
    omdb_image_link: Option<HashSet<String>>,
    imdb_link: Option<String>,
    search_back_link: Option<String>,
}

#[derive(Serialize, Clone)]
struct SearchResponse {
    search: String,
    results: Vec<SearchResult>,
}

#[get("/search/{search_str}")]
async fn search_service(search_str: web::Path<String>, data: web::Data<Data>) -> impl Responder {
    let search_str = text::normalize(&search_str);
    let mut results = HashMap::new();
    for (k, v) in &data.search_str_2_movie_qid {
        if *k == *search_str {
            let score = 1.0;
            for x in v {
                results
                    .entry(x.to_string())
                    .and_modify(|existing: &mut SearchResult| {
                        existing.score = existing.score.max(score);
                    })
                    .or_insert(SearchResult {
                        qid: x.to_string(),
                        score,
                        wikidata: format!("https://www.wikidata.org/wiki/{x}"),
                        label: k.to_string(),
                        omdb_image_link: None,
                        imdb_link: None,
                        search_back_link: None,
                    });
            }
        } else if k.contains(&*search_str) {
            let percent = (search_str.len() as f32) / (k.len() as f32);
            let score = percent * 0.95;
            for x in v {
                results
                    .entry(x.to_string())
                    .and_modify(|existing: &mut SearchResult| {
                        existing.score = existing.score.max(score);
                    })
                    .or_insert(SearchResult {
                        qid: x.to_string(),
                        score,
                        wikidata: format!("https://www.wikidata.org/wiki/{x}"),
                        label: k.to_string(),
                        omdb_image_link: None,
                        imdb_link: None,
                        search_back_link: None,
                    });
            }
        } else if (*search_str).contains(k) {
            let percent = (k.len() as f32) / (search_str.len() as f32);
            let score = percent * 0.95;
            for x in v {
                results
                    .entry(x.to_string())
                    .and_modify(|existing: &mut SearchResult| {
                        existing.score = existing.score.max(score);
                    })
                    .or_insert(SearchResult {
                        qid: x.to_string(),
                        score,
                        wikidata: format!("https://www.wikidata.org/wiki/{x}"),
                        label: k.to_string(),
                        omdb_image_link: None,
                        imdb_link: None,
                        search_back_link: None,
                    });
            }
        }
    }
    let trigrams = generate_trigrams(&search_str);
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
    for (search_str, v) in matches {
        let percent = v / (trigrams.len() as f32);
        let percent_2 = (trigrams.len() as f32) / (generate_trigrams(&search_str).len() as f32);
        let score = percent.min(percent_2);
        let qids = data.search_str_2_movie_qid.get(&search_str).unwrap();
        for qid in qids {
            results
                .entry(qid.to_string())
                .and_modify(|existing: &mut SearchResult| {
                    if score > existing.score {
                        existing.score = score;
                        existing.label = search_str.to_string();
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
                });
        }
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
    for x in results_vec.iter().rev() {
        println!(
            "{} - {} - {} - {}",
            x.label,
            x.score,
            x.omdb_image_link.clone().unwrap().iter().next().unwrap(),
            x.imdb_link.clone().unwrap_or(String::new()),
        );
    }
    let response = SearchResponse {
        search: search_str.to_string(),
        results: results_vec,
    };
    HttpResponse::Ok().json(response)
}
