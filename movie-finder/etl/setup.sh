#!/bin/sh
set -e
cd $HOME/github.com/loicbourgois/loicbourgois/movie-finder/etl
python3 -m venv .venv
$HOME/github.com/loicbourgois/loicbourgois/movie-finder/etl/.venv/bin/python3.14 \
    -m pip install --upgrade pip
$HOME/github.com/loicbourgois/loicbourgois/movie-finder/etl/.venv/bin/python3.14 \
    -m pip install -r \
    $HOME/github.com/loicbourgois/loicbourgois/movie-finder/etl/requirements.txt
