#!/bin/sh
# $HOME/github.com/loicbourgois/loicbourgois/emergence/run.sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
VENV_DIR="$SCRIPT_DIR/.venv"
PYTHON="$VENV_DIR/bin/python"
LOG_DIR="$SCRIPT_DIR/logs"
LOG_FILE="$LOG_DIR/_latest_sh.txt"
STATUS_FILE=$(mktemp "${TMPDIR:-/tmp}/emergence-status.XXXXXX")

cleanup() {
    rm -f "$STATUS_FILE"
}

finish() {
    status=$?

    if [ "$status" -eq 0 ]; then
        printf 'done\n' | tee -a "$LOG_FILE"
    else
        printf 'error: emergence exited with status %s\n' "$status" | tee -a "$LOG_FILE"
    fi

    cleanup
    exit "$status"
}

trap finish EXIT
trap 'exit 1' HUP INT TERM

mkdir -p "$LOG_DIR"

set +e
{
    printf 'start: emergence\n'
    printf 'python: %s\n' "$PYTHON"
    "$PYTHON" --version
    printf 'project: %s\n' "$PROJECT_ROOT"

    if [ ! -x "$PYTHON" ]; then
        printf 'error: virtual environment not found at %s\n' "$VENV_DIR"
        printf 'error: run %s/setup.sh first\n' "$SCRIPT_DIR"
        exit 1
    fi

    cd "$PROJECT_ROOT"
    echo "----------------------------------------------------------------"
    "$PYTHON" -m emergence.main
    status=$?
    echo "----------------------------------------------------------------"
    printf '%s\n' "$status" > "$STATUS_FILE"
    exit "$status"
} 2>&1 | tee "$LOG_FILE"

tee_status=$?
set -e

if [ "$tee_status" -ne 0 ]; then
    printf 'error: unable to write log file %s\n' "$LOG_FILE" | tee -a "$LOG_FILE" >&2
    exit "$tee_status"
fi

status=$(cat "$STATUS_FILE")
exit "$status"