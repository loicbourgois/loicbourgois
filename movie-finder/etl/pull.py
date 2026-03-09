from .pull_omdb import pull_omdb
from .pull_wikidata import pull_wikidata
from .pull_imdb_descriptions import pull_imdb_descriptions
from .pull_imdb_reviews import pull_imdb_reviews


if __name__ == "__main__":
    # pull_omdb()
    # pull_wikidata()
    pull_imdb_descriptions()
    pull_imdb_reviews()
