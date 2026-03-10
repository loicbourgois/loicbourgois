#!/bin/sh
set -e
path=$(cat $HOME/github.com/loicbourgois/movie_finder_local/secrets.json | jq -r ".user[1].path")
host=$(cat $HOME/github.com/loicbourgois/movie_finder_local/secrets.json | jq -r ".host")
username=$(cat $HOME/github.com/loicbourgois/movie_finder_local/secrets.json | jq -r '.user[1].name')
cd $HOME/.ssh
rsync -avz --partial --progress -e "ssh -i $path" \
    $username@$host:/home/$username/github.com/loicbourgois/loicbourgois/movie-finder/data/csv/imdb_id___description.csv \
    $HOME/github.com/loicbourgois/loicbourgois/movie-finder/data/csv/imdb_id___description.csv

rsync -avz --partial --progress -e "ssh -i $path" \
    $username@$host:/home/$username/github.com/loicbourgois/loicbourgois/movie-finder/data/csv/imdb_id___reviews.csv \
    $HOME/github.com/loicbourgois/loicbourgois/movie-finder/data/csv/imdb_id___reviews.csv

ssh -i $path $username@$host \
    "wc -l /home/$username/github.com/loicbourgois/loicbourgois/movie-finder/data/csv/imdb_id___description.csv"
wc -l $HOME/github.com/loicbourgois/loicbourgois/movie-finder/data/csv/imdb_id___description.csv

ssh -i $path $username@$host \
    "wc -l /home/$username/github.com/loicbourgois/loicbourgois/movie-finder/data/csv/imdb_id___reviews.csv"
wc -l $HOME/github.com/loicbourgois/loicbourgois/movie-finder/data/csv/imdb_id___reviews.csv
