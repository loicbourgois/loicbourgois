#!/bin/sh
# $HOME/github.com/loicbourgois/loicbourgois/flow/todo.sh
set -e
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
todo_input="$HOME/github.com/loicbourgois/loicbourgois/flow/todo_input.sh"
todo_files=()
while IFS= read -r file || [ -n "$file" ]; do
    case "$file" in
        ''|'#'*)
            continue
            ;;
        '$HOME'/*)
            # TODO: += not working 
            todo_files+=("$HOME/${file#\$HOME/}")
            echo "file: $file"
            echo "todo_files: $todo_files"
            ;;
        '${HOME}'/*)
            todo_files+=("$HOME/${file#\$\{HOME\}/}")
            ;;
        *)
            todo_files+=("$file")
            ;;
    esac
done < "$todo_input"
if [ -z "$todo_files" ]; then
    echo "No files found in $todo_input" >&2
    exit 1
fi
echo "Running TODO check on files:"
printf '%s\n' "${todo_files[@]}"
cargo run --release \
    --manifest-path "$HOME/gitlab.com/loicbourgois/bot/Cargo.toml" \
    -- td \
    "${todo_files[@]}"
