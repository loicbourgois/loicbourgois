#!/bin/sh
# $HOME/github.com/loicbourgois/loicbourgois/flow/todo.sh
set -e
cargo run --release \
    --manifest-path "$HOME/gitlab.com/loicbourgois/bot/Cargo.toml" \
    -- td \
    $HOME/github.com/loicbourgois/loicbourgois/flow/index.html \
    $HOME/github.com/loicbourgois/loicbourgois/flow/index.js \
    $HOME/github.com/loicbourgois/loicbourgois/flow/run.js \
    $HOME/github.com/loicbourgois/loicbourgois/flow/setup.js
