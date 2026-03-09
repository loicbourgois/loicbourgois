from pandasql import sqldf
import pandas
from .shared import (
    # read, 
    # write_force_csv,
    # list_all_files,
    HOME,
)


# TODO: as python code 
# pub fn generate_trigrams(s: &str) -> HashSet<String> {
#     let mut trigrams = HashSet::new();
#     if s.is_empty() {
#         return trigrams;
#     }
#     // Pad the string with two spaces at the start and end to capture
#     // trigrams involving the beginning and end of the word (e.g., "  a", " ab", "abc", "bc ", "c  ")
#     let padded_s = format!("  {s}  ");
#     let chars: Vec<char> = padded_s.chars().collect();
#     for i in 0..=chars.len() - 3 {
#         let trigram_str: String = chars[i..i + 3].iter().collect();
#         trigrams.insert(trigram_str);
#     }
#     trigrams
# }


# def generate_trigrams():
#     pass


def plot_to_qid():
    df_1 = pandas.read_csv(f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/data/csv/imdb_id___description.csv")
    print(df_1.head())
    df_2 = pandas.read_csv(f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/data/csv/wikidata_imdb_omd.csv")
    print(df_2.head())
    df_3 = sqldf(f"""
        select 
            qid,
            plot
        from df_1
        inner join df_2
            on imdb_id = replace(imdb_link, "https://www.imdb.com/title/", "")
    """, locals())
    df_3.to_csv(
        f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/data/csv/plot_to_qid.csv",
        index=False
    )
