from pandasql import sqldf
import pandas
from .shared import (
    HOME,
)


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
