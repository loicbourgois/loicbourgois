#!/bin/sh
# $HOME/github.com/loicbourgois/loicbourgois/emergence/lint.sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

cargo fmt \
    --manifest-path "$SCRIPT_DIR/Cargo.toml" \
    --all \
    -- \
    --check

cargo check \
    --manifest-path "$SCRIPT_DIR/Cargo.toml" \
    --all-targets \
    --all-features

cargo clippy \
    --manifest-path "$SCRIPT_DIR/Cargo.toml" \
    --all-targets \
    --all-features \
    -- \
    -D warnings \
    -Aclippy::identity_op \
    -Aclippy::erasing_op \
    -Aclippy::needless_range_loop \
    -Aunused_variables \
    -Adead_code \
    -Aclippy::println_empty_string
