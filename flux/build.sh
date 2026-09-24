#!/bin/sh
# $HOME/github.com/loicbourgois/loicbourgois/flux/build.sh
set -e
VENV_PATH="$HOME/github.com/loicbourgois/loicbourgois/flux/.venv"
python="$VENV_PATH/bin/python3.14"
cd $HOME/github.com/loicbourgois/loicbourgois/flux
$python -m build
