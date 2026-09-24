#!/bin/sh
# $HOME/github.com/loicbourgois/loicbourgois/emergence/format.sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
# https://pypi.org/project/ruff/
RUFF_VERSION="0.16.8"

if ! command -v uv >/dev/null 2>&1; then
    echo "error: uv is required but was not found in PATH" >&2
    exit 1
fi

uvx --from "ruff==$RUFF_VERSION" ruff format "$SCRIPT_DIR"
cargo fmt \
    --manifest-path "$SCRIPT_DIR/Cargo.toml" \
    --all