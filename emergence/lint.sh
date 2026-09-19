#!/bin/sh
# $HOME/github.com/loicbourgois/loicbourgois/emergence/lint.sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
RUFF_VERSION="0.16.8"

if ! command -v uv >/dev/null 2>&1; then
    echo "error: uv is required but was not found in PATH" >&2
    exit 1
fi

if ! command -v shellcheck >/dev/null 2>&1; then
    echo "error: shellcheck is required but was not found in PATH" >&2
    exit 1
fi

uvx --from "ruff==$RUFF_VERSION" ruff check "$SCRIPT_DIR"
uvx --from "ruff==$RUFF_VERSION" ruff format --check "$SCRIPT_DIR"

find "$SCRIPT_DIR" \
    -type f \
    -name '*.sh' \
    -exec shellcheck {} +