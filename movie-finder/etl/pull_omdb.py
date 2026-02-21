from .runcmd import runcmd_list
from .config import omdb
from .shared import HOME


def pull_omdb():
    omdb_folder = f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/data/omdb"
    runcmd_list(["mkdir", "-p", omdb_folder])
    for item in omdb:
        url = f"https://www.omdb.org/data/{item}.csv.bz2"
        file = f"{item}.csv.bz2"
        runcmd_list(["curl", url, "-O"], cwd=omdb_folder)
        try:
            runcmd_list(["rm", file.replace(".csv.bz2", ".csv")], cwd=omdb_folder)
        except:
            pass
        runcmd_list(["bzip2", "-d", file], cwd=omdb_folder)
