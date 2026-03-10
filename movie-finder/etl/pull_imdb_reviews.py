import os
import random
import pandas
from imdb import Cinemagoer


HOME = os.environ["HOME"]


def file_exists(path):
    return os.path.exists(path)


def pull_imdb_reviews():
    ia = Cinemagoer()
    print(ia.get_movie_infoset())
    df_in = pandas.read_csv(f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/data/csv/wikidata_imdb_omd.csv")
    all_available_imdb_ids = (
        df_in["imdb_link"]
            .dropna()
            .str.replace("https://www.imdb.com/title/", "", regex=False)
            .str.replace("/", "", regex=False)
            .unique()
    )
    path_out = f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/data/csv/imdb_id___reviews.csv"
    for _ in range(10000):
        if file_exists(path_out):
            df_out = pandas.read_csv(path_out)
        else:
            df_out = pandas.DataFrame(columns={
                "imdb_id": str,
                "review_content": str,
                "review_title": str,
                "review_author": str,
                "review_author_name": str,
                "review_date": str,
                "review_rating": int,
                "review_helpful": int,
                "review_not_helpful": int,
            })
        processed_imdb_ids = set(df_out["imdb_id"].unique())
        imdb_ids_to_process_this_round = [
            imdb_id for imdb_id in all_available_imdb_ids if imdb_id not in processed_imdb_ids
        ]
        random.shuffle(imdb_ids_to_process_this_round)
        c1 = len(all_available_imdb_ids)
        c2 = df_out["imdb_id"].nunique() if not df_out.empty else 0
        print(f"item___imdb_id:   {c1}")
        print(f"imdb_id___reviews:{c2}")
        print(f"progress:         {round(c2/c1*100,2)}%")
        data_todo = imdb_ids_to_process_this_round[0:10]
        for i, imdb_id in enumerate(data_todo):
            if df_out["imdb_id"].astype(str).str.contains(imdb_id).any():
                print(f"{i+1}/{len(data_todo)} - {imdb_id} - SKIP")
                continue
            print(f"{i+1}/{len(data_todo)} - {imdb_id} - PULL REVIEWS")
            try:
                movie = ia.get_movie(imdb_id.replace("tt", ""), info=['reviews'])
                # print(movie.get("reviews")[0].keys())
                reviews = movie.get("reviews", [])
                for review_idx, review in enumerate(reviews):
                    df_out = pandas.concat([df_out, pandas.DataFrame([{
                        "imdb_id": imdb_id,
                        "review_content": review.get("content"),
                        "review_title": review.get("title"),
                        "review_author": review.get("author"),
                        "review_author_name": review.get("author_name"),
                        "review_date": review.get("date"),
                        "review_rating": review.get("rating"),
                        "review_helpful": review.get("helpful"),
                        "review_not_helpful": review.get("not_helpful"),
                    }])], ignore_index=True)
            except Exception as e:
                print(f"ERROR fetching reviews for {imdb_id}: {e}")
        df_out = df_out[[
            "imdb_id", "review_content", "review_title", 
            "review_author", "review_author_name", "review_date", "review_rating", 
            "review_helpful", "review_not_helpful"
        ]]
        df_out.to_csv(path_out, index=False)
