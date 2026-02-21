#!/bin/sh
set -e
path=$(cat $HOME/github.com/loicbourgois/movie_finder_local/secrets.json | jq -r ".user[0].path")
host=$(cat $HOME/github.com/loicbourgois/movie_finder_local/secrets.json | jq -r ".host")
username=$(cat $HOME/github.com/loicbourgois/movie_finder_local/secrets.json | jq -r '.user[0].name')
echo "ssh -i $path $username@$host"
cd $HOME/.ssh
ssh -i $path $username@$host
