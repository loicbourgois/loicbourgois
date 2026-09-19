#!/bin/sh
# $HOME/github.com/loicbourgois/loicbourgois/emergence/setup.sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
VENV_DIR="$SCRIPT_DIR/.venv"
PYTHON="$VENV_DIR/bin/python"
REQUIREMENTS="$SCRIPT_DIR/requirements.txt"

if ! command -v uv >/dev/null 2>&1; then
    echo "error: uv is required but was not found in PATH" >&2
    exit 1
fi

uv venv \
    --clear \
    --python 3.14 \
    "$VENV_DIR"

source $HOME/github.com/loicbourgois/loicbourgois/emergence/.venv/bin/activate

uv pip install \
    --requirement "$REQUIREMENTS"

echo "Created virtual environment at: $VENV_DIR"
echo "Installed dependencies from: $REQUIREMENTS"
