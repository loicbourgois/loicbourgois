#!/bin/sh
set -e
cd $HOME/github.com/loicbourgois/loicbourgois/movie-finder/api
environment=local cargo run --release
