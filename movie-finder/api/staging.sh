#!/bin/sh
set -e
cd $HOME/github.com/loicbourgois/loicbourgois/movie-finder/api
environment=staging cargo run --release
