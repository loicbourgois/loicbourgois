use crate::media::Media;
// use crate::text;
// use crate::text::generate_trigrams;
use chrono::DateTime;
use chrono::Utc;
use csv::Reader;
use serde::Deserialize;
use std::collections::HashMap;
use std::collections::HashSet;
use std::env;
use std::error::Error;
use std::fs;
use std::path::PathBuf;

#[derive(Clone)]
pub struct Data {
    pub start_time: DateTime<Utc>,
    pub qid_2_omdb_image_link: HashMap<String, HashSet<String>>,
    pub qid_2_imdb_link: HashMap<String, String>,
    pub wikidata_imdb_omd: Vec<Media>,
    pub qid_2_wikidata_imdb_omd: HashMap<String, Vec<Media>>,
    pub qid_2_plot: HashMap<String, Vec<String>>,
    pub trigram_2_plot_hash: HashMap<String, Vec<String>>,
    pub plot_hash_2_qid: HashMap<String, String>,
    pub trigram_2_review_hash: HashMap<String, Vec<String>>,
    pub review_hash_2_qid: HashMap<String, String>,
}

#[derive(Deserialize)]
struct Config {
    medias: HashSet<String>,
}

fn read_csv_file_7(
    path: PathBuf,
) -> Result<Vec<(String, String, String, String, String, String, String)>, Box<dyn Error>> {
    let mut reader = Reader::from_path(path)?;
    let mut records = Vec::new();
    for result in reader.records() {
        let record = result?;
        records.push((
            record[0].to_string(),
            record[1].to_string(),
            record[2].to_string(),
            record[3].to_string(),
            record[4].to_string(),
            record[5].to_string(),
            record[6].to_string(),
        ));
    }
    Ok(records)
}

fn read_csv_file_2(path: PathBuf) -> Result<Vec<(String, String)>, Box<dyn Error>> {
    let mut reader = Reader::from_path(path)?;
    let mut records = Vec::new();
    for result in reader.records() {
        let record = result?;
        records.push((record[0].to_string(), record[1].to_string()));
    }
    Ok(records)
}

pub fn load_data() -> Data {
    let home_dir = env::var("HOME").expect("HOME environment variable not set");
    let mut path = PathBuf::from(&home_dir);
    path.push("github.com/loicbourgois/loicbourgois/movie-finder/api/config.json");
    let config_text = fs::read_to_string(path).expect("Failed to read config.json");
    let config: Config = serde_json::from_str(&config_text).expect("Failed to parse config.json");
    let trigram_2_plot_hash: HashMap<String, Vec<String>> = {
        let mut path = PathBuf::from(&home_dir);
        path.push(
            "github.com/loicbourgois/loicbourgois/movie-finder/data/json/trigram_2_plot_hash.json",
        );
        let txt = fs::read_to_string(path).expect("Failed to read trigram_2_plot_hash.json");
        serde_json::from_str(&txt).expect("Failed to parse trigram_2_plot_hash.json")
    };
    let plot_hash_2_qid: HashMap<String, String> = {
        let mut path = PathBuf::from(&home_dir);
        path.push(
            "github.com/loicbourgois/loicbourgois/movie-finder/data/json/plot_hash_2_qid.json",
        );
        let txt = fs::read_to_string(path).expect("Failed to read plot_hash_2_qid.json");
        serde_json::from_str(&txt).expect("Failed to parse plot_hash_2_qid.json")
    };

    let trigram_2_review_hash: HashMap<String, Vec<String>> = {
        let mut path = PathBuf::from(&home_dir);
        path.push(
            "github.com/loicbourgois/loicbourgois/movie-finder/data/json/trigram_2_review_hash.json",
        );
        let txt = fs::read_to_string(path).expect("Failed to read trigram_2_review_hash.json");
        serde_json::from_str(&txt).expect("Failed to parse trigram_2_review_hash.json")
    };
    let review_hash_2_qid: HashMap<String, String> = {
        let mut path = PathBuf::from(&home_dir);
        path.push(
            "github.com/loicbourgois/loicbourgois/movie-finder/data/json/review_hash_2_qid.json",
        );
        let txt = fs::read_to_string(path).expect("Failed to read review_hash_2_qid.json");
        serde_json::from_str(&txt).expect("Failed to parse review_hash_2_qid.json")
    };
    let mut qid_2_plot = HashMap::new();
    let mut csv_path = PathBuf::from(&home_dir);
    csv_path.push("github.com/loicbourgois/loicbourgois/movie-finder/data/csv/plot_to_qid.csv");
    match read_csv_file_2(csv_path.clone()) {
        Ok(records) => {
            for (qid, plot) in &records {
                qid_2_plot
                    .entry(qid.clone())
                    .or_insert_with(Vec::new)
                    .push(plot.clone());
            }
        }
        Err(e) => {
            panic!("{}", e);
        }
    }
    let mut qid_2_omdb_image_link = HashMap::new();
    let l = config.medias.len();
    for (i, media) in config.medias.iter().enumerate() {
        let mut csv_path = PathBuf::from(&home_dir);
        csv_path.push(format!(
            "github.com/loicbourgois/loicbourgois/movie-finder/data/csv/{media}/omdb_image_id.csv"
        ));
        println!("{}/{} - {}", i + 1, l, csv_path.display());
        if let Ok(records) = read_csv_file_7(csv_path.clone()) {
            for (
                qid,
                _omdb_id,
                _omdb_image_id,
                _omdb_image_version,
                _wikidata_link,
                _omdb_link,
                omdb_image_link,
            ) in records
            {
                qid_2_omdb_image_link
                    .entry(qid.to_string())
                    .or_insert_with(HashSet::new)
                    .insert(omdb_image_link.clone());
            }
        }
    }
    let mut qid_2_imdb_link = HashMap::new();
    let l = config.medias.len();
    for (i, media) in config.medias.iter().enumerate() {
        let mut csv_path = PathBuf::from(&home_dir);
        csv_path.push(format!(
            "github.com/loicbourgois/loicbourgois/movie-finder/data/csv/{media}/imdb_id.csv"
        ));
        println!("{}/{} - {}", i + 1, l, csv_path.display());
        if let Ok(records) = read_csv_file_2(csv_path.clone()) {
            for (qid, imdb_id) in records {
                qid_2_imdb_link.insert(
                    qid.to_string()
                        .replace("http://www.wikidata.org/entity/", ""),
                    format!("https://www.imdb.com/title/{}", imdb_id.clone()),
                );
            }
        }
    }
    let wikidata_imdb_omd: Vec<Media> = {
        let mut wikidata_imdb_omd_path = PathBuf::from(&home_dir);
        wikidata_imdb_omd_path.push(
            "github.com/loicbourgois/loicbourgois/movie-finder/data/csv/wikidata_imdb_omd.csv",
        );
        let file =
            fs::File::open(&wikidata_imdb_omd_path).expect("Failed to open wikidata_imdb_omd.csv");
        let mut rdr = csv::Reader::from_reader(file);
        rdr.deserialize()
            .map(|result| result.expect("Failed to deserialize Media record"))
            .collect()
    };
    let mut qid_2_wikidata_imdb_omd = HashMap::new();
    for x in &wikidata_imdb_omd {
        qid_2_wikidata_imdb_omd
            .entry(x.qid.clone())
            .or_insert_with(Vec::new)
            .push(x.clone());
    }
    println!("qid_2_omdb_image_link.len: {}", qid_2_omdb_image_link.len());
    println!("qid_2_imdb_link.len: {}", qid_2_imdb_link.len());
    println!("wikidata_imdb_omd.len: {}", wikidata_imdb_omd.len());
    Data {
        start_time: Utc::now(),
        qid_2_omdb_image_link,
        qid_2_imdb_link,
        wikidata_imdb_omd,
        qid_2_wikidata_imdb_omd,
        qid_2_plot,
        plot_hash_2_qid,
        trigram_2_plot_hash,
        review_hash_2_qid,
        trigram_2_review_hash,
    }
}
