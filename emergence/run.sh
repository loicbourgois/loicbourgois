#!/bin/sh
# $HOME/github.com/loicbourgois/loicbourgois/emergence/run.sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

exec cargo run --release --manifest-path "$SCRIPT_DIR/Cargo.toml" -- "$@"
