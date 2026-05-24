#!/bin/sh
# $HOME/github.com/loicbourgois/loicbourgois/flow/todo.sh
set -e
cargo run --release \
    --manifest-path "$HOME/gitlab.com/loicbourgois/bot/Cargo.toml" \
    -- td \
    $HOME/github.com/loicbourgois/loicbourgois/flow/webgpu.js \
    $HOME/github.com/loicbourgois/loicbourgois/flow/shared.wgsl \
    $HOME/github.com/loicbourgois/loicbourgois/flow/physic.wgsl
