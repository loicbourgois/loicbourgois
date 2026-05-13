#!/bin/sh
set -e
cd $HOME/github.com/loicbourgois/loicbourgois
git status
git commit -am "up"
git push
git status
