#!/bin/sh
set -e
docker-compose \
    --file $HOME/github.com/loicbourgois/loicbourgois/takana/lint/docker-compose.yml \
    up --build --force-recreate lint
