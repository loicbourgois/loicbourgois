#!/bin/sh
# TODO: print all rs file formatted as in the yml
# $HOME/github.com/loicbourgois/loicbourgois/emergence/list_rs.sh
cd "$HOME/github.com/loicbourgois/loicbourgois/emergence" || exit 1
find src -type f -name '*.rs' | sort | sed 's#^#    - file://./../emergence/#'
