#!/bin/sh
set -e
cd $HOME/github.com/loicbourgois/loicbourgois/movie-finder/api
cargo fmt
cargo clippy --release -- \
    -D warnings \
    -A clippy::single_match \
    -A clippy::too_many_arguments \
    -W clippy::pedantic \
    -A clippy::cast_precision_loss \
    -A clippy::cast_sign_loss \
    -A clippy::cast_possible_truncation \
    -A clippy::module_name_repetitions \
    -A clippy::unused_self \
    -A clippy::match_same_arms \
    -A clippy::similar_names \
    -A clippy::many_single_char_names \
    -A clippy::single_match_else \
    -A clippy::vec_init_then_push \
    -A clippy::missing_errors_doc \
    -A clippy::missing_panics_doc \
    -A clippy::too_many_lines \
    -A clippy::unused_async \
    -A clippy::manual_map \
    -A clippy::upper_case_acronyms \
    -A clippy::type_complexity \
    -A clippy::redundant_else
cargo build --release
