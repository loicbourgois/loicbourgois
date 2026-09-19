#!/usr/bin/env bash
# $HOME/github.com/loicbourgois/loicbourgois/emergence/cleanup.sh

set -euo pipefail

main() {
    local root="${HOME:?HOME must be set}/github.com/loicbourgois/loicbourgois/emergence"
    if [[ ! -d "$root" ]]; then
        printf 'Directory does not exist: %s\n' "$root" >&2
        return 1
    fi
    find "$root" \
        -type f \
        \( \
            -name '*.yml.prompt.md' \
            -o -name '*.yml.response.*.md' \
        \) \
        -print \
        -exec rm -f -- {} +
}

main "$@"