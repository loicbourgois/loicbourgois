import os
import random
import pandas
from imdb import Cinemagoer


HOME = os.environ["HOME"]


def file_exists(path):
    return os.path.exists(path)


def pull_imdb_descriptions():
    ia = Cinemagoer()
    df_in = pandas.read_csv(f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/data/csv/wikidata_imdb_omd.csv")
    print(df_in.shape, flush=True)
    print(df_in.head(), flush=True)
    all_available_imdb_ids = (
        df_in["imdb_link"]
            .dropna()
            .str.replace("https://www.imdb.com/title/", "", regex=False)
            .str.replace("/", "", regex=False)
            .unique()
    )
    path_out = f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/data/csv/imdb_id___description.csv"
    path_out_2 = f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/data/csv/imdb_id___description_2.csv"
    for _ in range(10000):
        if file_exists(path_out):
            df_out = pandas.read_csv(path_out)
            df_out.to_csv(path_out_2, index=False)
        elif file_exists(path_out_2):
            df_out = pandas.read_csv(path_out_2)
        else:
            df_out = pandas.DataFrame(columns={
                "imdb_id": str,
                "plot_idx": int,
                "plot": str,
                "plot_author": str,
            })
        processed_imdb_ids = set(df_out["imdb_id"].unique())
        imdb_ids_to_process_this_round = [
            imdb_id for imdb_id in all_available_imdb_ids if imdb_id not in processed_imdb_ids
        ]
        random.shuffle(imdb_ids_to_process_this_round)
        c1 = len(all_available_imdb_ids)
        c2 = df_out["imdb_id"].nunique()
        print(f"item___imdb_id:        { c1}")
        print(f"imdb_id___description: { c2}")
        print(f"progress:              { round(c2/c1*100,2)}%")
        data_todo = imdb_ids_to_process_this_round[0:10]
        l = len(data_todo)
        for i, imdb_id in enumerate(data_todo):
            if df_out["imdb_id"].str.contains(imdb_id).any():
                print(f"{i+1}/{l} - {imdb_id} - SKIP")
            else:
                print(f"{i+1}/{l} - {imdb_id} - PULL")
                try:
                    movie = ia.get_movie(imdb_id.replace("tt", ""), info=["plot"])
                    for plot_idx, plot_str in enumerate(movie.get("plot", [])):
                        parts = plot_str.split("—")
                        if len(parts) == 2:
                            plot = parts[0]
                            plot_author = parts[1]
                        else:
                            plot = plot_str
                            plot_author = None
                        df_out = pandas.concat([df_out, pandas.DataFrame([{
                            "imdb_id": imdb_id,
                            "plot_idx": plot_idx,
                            "plot": plot,
                            "plot_author": plot_author,
                        }])], ignore_index=True)
                except Exception as e:
                    print(f"ERROR: {e}")
        print(df_out)
        df_out.to_csv(path_out, index=False)
