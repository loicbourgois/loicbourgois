import json
import pandas
from .shared import (
    read, 
    write_force_csv,
    list_all_files,
    HOME,
)
import os
from pandasql import sqldf
from .config import languages
from .plot_to_qid import plot_to_qid
from .trigram_2_plot import trigram_2_plot


def map_qid_to_omdb_to_image():
    df_omdb_image_ids = pandas.read_csv(f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/data/omdb/image_ids.csv")
    df_distinct_object_type = sqldf("SELECT distinct object_type FROM df_omdb_image_ids;", locals())
    for k in [
        'film', 'documentary', 'anime'
    ]:
        df_2 = pandas.read_csv(f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/data/csv/{k}/omdb_id.csv")
        df = sqldf(f"""
            with q1 as (
                select 
                    image_id,
                    object_id,
                    image_version
                from df_omdb_image_ids
                where object_type = "Movie"
            )
            , q2 as (
                select 
                    replace({k}, "http://www.wikidata.org/entity/", "") as qid,
                    omdb_id
                from df_2
            )
            , q3 as (
                select
                    qid,
                    omdb_id,
                    image_id as omdb_image_id,
                    image_version as omdb_image_version,
                    "http://www.wikidata.org/entity/" || qid as wikidata_link,
                    "https://www.omdb.org/movie/" || omdb_id as omdb_link,
                    replace(
                        "https://www.omdb.org/image/default/" || image_id || ".jpeg?v=" || image_version,
                        "?v=\\N",
                        ""
                    ) as omdb_image_link
                from q2
                inner join q1
                    on q1.object_id = q2.omdb_id
            )
            select * from q3
        """, locals())
        path = f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/data/csv/{k}/omdb_image_id.csv"
        print(path)
        df.to_csv(
            path,
            index=False
        )


def json_to_csv():
    paths = list_all_files(f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/data/json", "*.json")
    todos = []
    l = len(paths)
    for i, path in enumerate(paths):
        path_csv = str(path).replace("data/json", "data/csv").replace(".json", ".csv")
        label = str(path).replace(
            f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/data/json/", ""
        ).replace(
            ".json", ""
        )
        try:
            pandas.read_csv(path_csv)
            print(f"(skip) {i+1}/{l} - {label}")
        except Exception:
            print(f"(todo) {i+1}/{l} - {label}")
            todos.append({
                "json": str(path),
                "out": path_csv,
            })
    l = len(todos)
    for i, todo in enumerate(todos):
        print(
            f"(convert) {i+1}/{l} - " + todo['json'].replace(
                f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/data/json/", ""
            ).replace(
                ".json", ""
            )
        )
        try:
            d = json.loads(read(todo['json']))
            rows = [ d["head"]["vars"] ]
            for x in d["results"]["bindings"]:
                rows.append( [
                    x[column_id]["value"]
                    for column_id in rows[0]
                ] )
            write_force_csv(todo['out'], rows)
        except Exception as e:
            print("  fail")


def wikidata_imdb_omd():
    df_1 = pandas.DataFrame()
    for k in [
        'film', 'documentary', 'anime'
    ]:
        df_2 = pandas.read_csv(f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/data/csv/{k}/omdb_image_id.csv")
        df_2["kind"] = k
        df_1 = pandas.concat([df_1, df_2], ignore_index=True)
    print(df_1.head())
    df_3 = pandas.DataFrame()
    for k in [
        'film', 'documentary', 'anime'
    ]:
        df_4 = pandas.read_csv(f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/data/csv/{k}/imdb_id.csv")
        df_4["kind"] = k
        df_4['wikidata_link'] = df_4[k]
        df_3 = pandas.concat([df_3, df_4], ignore_index=True)
    print(df_3.head())

    df_5 = sqldf(f"""
        with q1 as (
            select 
                df_1.kind,
                qid,
                omdb_image_link,
                df_1.wikidata_link,
                "https://www.imdb.com/title/" || imdb_id as imdb_link
            from df_1
            inner join df_3
                on df_1.wikidata_link = df_3.wikidata_link
        )
        select * from q1
    """, locals())
    print(df_5.head())
    
    
    df_6 = pandas.DataFrame()
    for k in [
        'film', 'documentary', 'anime'
    ]:
        for l in languages:
            df_7 = pandas.read_csv(f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/data/csv/{k}/label/{l}.csv")
            df_7['wikidata_link'] = df_7[k]
            df_7['kind'] = k
            df_7['label'] = df_7[f"{k}_label"]
            df_7 = df_7[['kind', 'wikidata_link', 'label', 'language']]
            df_6 = pandas.concat([df_6, df_7], ignore_index=True)
    print("df_6")
    print(df_6.head())


    df_8 = sqldf(f"""
        select 
            df_5.kind,
            df_5.qid,
            omdb_image_link,
            imdb_link,
            language,
            label
        from df_5
        inner join df_6
            on df_5.wikidata_link = df_6.wikidata_link
    """, locals())
    print("df_8")
    print(df_8.head())
    df_8.to_csv(
        f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/data/csv/wikidata_imdb_omd.csv",
        index=False
    )




if __name__ == "__main__":
    # json_to_csv()
    # map_qid_to_omdb_to_image()
    # wikidata_imdb_omd()
    # plot_to_qid()
    trigram_2_plot()
