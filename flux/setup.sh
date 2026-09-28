#!/bin/sh
# $HOME/github.com/loicbourgois/loicbourgois/flux/setup.sh
set -e
VENV_PATH="$HOME/github.com/loicbourgois/loicbourgois/flux/.venv"
python="$VENV_PATH/bin/python3.14"
python3.14 -m venv "$VENV_PATH"
$python -m pip install -r $HOME/github.com/loicbourgois/loicbourgois/flux/requirements.txt
