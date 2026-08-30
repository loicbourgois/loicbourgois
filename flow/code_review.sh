#!/bin/sh
# $HOME/github.com/loicbourgois/loicbourgois/flow/code_review.sh
# TODO: ignore *.ico files
set -e
find "$HOME/github.com/loicbourgois/loicbourgois/flow" \
    -maxdepth 1 \
    -type f \
    ! -name "*.ico" \
    ! -name "*.llm.md" \
    -print0 \
| xargs -0 cargo run --release \
    --manifest-path "$HOME/gitlab.com/loicbourgois/bot/Cargo.toml" \
    -- cr
