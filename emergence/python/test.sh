#!/bin/sh
# $HOME/github.com/loicbourgois/loicbourgois/emergence/test.sh
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
VENV_DIR="$SCRIPT_DIR/.venv"
PYTHON="$VENV_DIR/bin/python"
cd $SCRIPT_DIR/..
"$PYTHON" -m emergence.test
