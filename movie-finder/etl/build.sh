#!/bin/sh
set -e
cd $HOME/github.com/loicbourgois/loicbourgois/movie-finder
$HOME/github.com/loicbourgois/loicbourgois/movie-finder/etl/.venv/bin/python3.14 \
    -m etl.build
