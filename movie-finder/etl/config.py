# reference: file://./../../../movie_finder/data_builder/config.py


# https://www.wikidata.org/wiki/Q24871
wikidata_avatar = "Q24871"


wikidata_items = {
    "documentary": "wd:Q4164344", # https://www.wikidata.org/wiki/Q4164344
    "film": "wd:Q11424",
    "anime": "wd:Q1107",
}


wikidata_properties = {
    "capital_cost": "wdt:P2130",
    "cast_member": "wdt:P161",
    "composer": "wdt:P86",
    "creator": "wdt:P170",
    "date_of_birth": "wdt:P569",
    "director": "wdt:P57", # https://www.wikidata.org/wiki/Property:P57
    "distributed_by": "wdt:P750",
    "field_of_work": "wdt:P101", # https://www.wikidata.org/wiki/Property:P101
    "gender": "wdt:P21",
    # creative work's genre
    "genre": "wdt:P136", # https://www.wikidata.org/wiki/Property:P136
    "screen_writer": "wdt:P58",
    "narrator": "wdt:P2438",
    "imdb_id": "wdt:P345",
    "omdb_id": "wdt:P3302",
    "film_editor": "wdt:P1040",
    "attendance": "wdt:P1110",
    "main_subject": "wdt:P921", # https://www.wikidata.org/wiki/Property:P921
    "director_of_photography": "wdt:P344", # https://www.wikidata.org/wiki/Property:P344
    "producer": "wdt:P162", # https://www.wikidata.org/wiki/Property:P162
    "set_in_period": "wdt:P2408", # https://www.wikidata.org/wiki/Property:P2408
    "occupation": "wdt:P106", # https://www.wikidata.org/wiki/Property:P106
    "nominated_for": "wdt:P1411", # https://www.wikidata.org/wiki/Property:P1411
    "award_received": "wdt:P166", # https://www.wikidata.org/wiki/Property:P166
}


person = {
    "gender": {},
    "date_of_birth": {},
    "occupation": {},
    "nominated_for": {},
    "award_received": {},
}


media = {
    "director": person,
    "cast_member": person,
    "imdb_id": {},
    "omdb_id": {},
    "genre": {},
    "capital_cost": {},
    "main_subject": {},
}


languages = {
    "fr",
    "en",
    "ja",
    "es",
}


entities = {
    "documentary": media,
    "film": media,
    "anime": media,
}


# https://www.omdb.org/en/us/content/Help:DataDownload
omdb = {
    "movie_links",
    "image_ids",
    "movie_references",
    "category_names",
    "movie_categories",
    "all_categories",
    "all_votes",
    "all_movies",
    "all_series",
}
