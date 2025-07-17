#!/bin/sh
# $HOME/github.com/loicbourgois/loicbourgois/go.sh
full_path=$HOME/github.com/loicbourgois/loicbourgois/
echo "Frontend at http://localhost"
full_path=$full_path \
  docker-compose --file $full_path/docker-compose.yml up --build
