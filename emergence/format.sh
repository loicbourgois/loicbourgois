#!/bin/sh
# $HOME/github.com/loicbourgois/loicbourgois/emergence/format.sh
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cargo fmt \
    --manifest-path "$SCRIPT_DIR/Cargo.toml" \
    --all
