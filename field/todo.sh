#!/bin/sh
# $HOME/github.com/loicbourgois/loicbourgois/beacon/todo.sh
set -e
cargo run --release \
    --manifest-path "$HOME/gitlab.com/loicbourgois/bot/Cargo.toml" \
    -- td \
    $HOME/github.com/loicbourgois/loicbourgois/beacon/display.wgsl \
    $HOME/github.com/loicbourgois/loicbourgois/beacon/webgpu.js \
    $HOME/github.com/loicbourgois/loicbourgois/beacon/disk_generated.wgsl
