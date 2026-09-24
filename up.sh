#!/bin/sh
set -e
$HOME/github.com/loicbourgois/loicbourgois/emergence/format.sh
cd $HOME/github.com/loicbourgois/loicbourgois
git status
git commit -am "up"
git push
git status
