import os
import json
from pathlib import Path
from .shared import (
    list_all_files,
    read,
    write_force,
)
import requests
from datetime import datetime, UTC
import time
import urllib


HOME = os.environ['HOME']


endpoint_url = "https://query.wikidata.org/sparql"
headers = {
    "User-Agent": "movie_finder/v2"
}


def pull_wikidata():
    paths = list_all_files(f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/etl/queries", "*.sparql")
    todos = []
    l = len(paths)
    for i, path in enumerate(paths):
        path_json = str(path).replace("etl/queries", "data/json").replace(".sparql", ".json")
        label = str(path).replace(
            f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/etl/queries/", ""
        ).replace(
            ".sparql", ""
        )
        try:
            c = json.loads(read(path_json))
            print(f"(skip) {i+1}/{l} - {label}")
        except Exception:
            print(f"(todo) {i+1}/{l} - {label}")
            todos.append({
                "query": str(path),
                "out": path_json,
            })
    l = len(todos)
    for i, todo in enumerate(todos):
        print(
            f"(pull) {i+1}/{l} - " + todo['query'].replace(
                f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/etl/queries/", ""
            ).replace(
                ".sparql", ""
            )
        )
        start = time.time()
        start_2 = datetime.now(UTC)
        args = urllib.parse.urlencode({
            "query": read(todo['query']),
            "format": "json"
        })
        try:
            r = requests.get(
                f"{endpoint_url}?{args}",
                timeout=60*5,
                headers= headers,
            )
            if r.status_code != 200:
                print(r.text)
            write_force(todo['out'], r.text)
        except:
            print(f"  failed")
        end = time.time()
        time.sleep( max(0, 3 - (end - start)) )

