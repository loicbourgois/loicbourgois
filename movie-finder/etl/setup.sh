#!/bin/sh
set -e
cd $HOME/github.com/loicbourgois/loicbourgois/movie-finder/etl
# rm -rf $HOME/github.com/loicbourgois/loicbourgois/movie-finder/etl/.venv
# python3.12 -m venv .venv
$HOME/github.com/loicbourgois/loicbourgois/movie-finder/etl/.venv/bin/python3 \
    -m pip install --upgrade pip
$HOME/github.com/loicbourgois/loicbourgois/movie-finder/etl/.venv/bin/python3 \
    -m pip install -r \
    $HOME/github.com/loicbourgois/loicbourgois/movie-finder/etl/requirements.txt
$HOME/github.com/loicbourgois/loicbourgois/movie-finder/etl/.venv/bin/python3 \
    -m pip install git+https://github.com/cinemagoer/cinemagoer
