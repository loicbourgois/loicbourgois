#!/bin/sh
# $HOME/github.com/loicbourgois/loicbourgois/_go.sh
full_path=$HOME/github.com/loicbourgois/loicbourgois/
echo "Frontend at https://localhost"
full_path=$full_path \
  docker-compose --file $full_path/docker-compose.yml up --build --force-recreate
