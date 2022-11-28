#!/bin/sh
# $HOME/github.com/loicbourgois/loicbourgois/dap/dap_test/run.sh
set -e
program=$folder/main.dap
toml=$HOME/github.com/loicbourgois/loicbourgois/dap/dap_test/Cargo.toml
echo "# Transpiling"
cargo fmt --manifest-path $toml
cargo clippy --release --manifest-path $toml \
    -- -Dwarnings -Dclippy::pedantic \
    -Aclippy::cast_precision_loss \
    -Aclippy::cast_sign_loss \
    -Aclippy::cast_possible_truncation \
    -Aclippy::similar_names \
    -Aclippy::cast_possible_wrap \
    -Aclippy::too_many_lines \
    -Aclippy::too_many_arguments \
    -Aclippy::module_name_repetitions \
    -Aclippy::must_use_candidate \
    -Aclippy::match_on_vec_items \
    -Aclippy::missing_panics_doc \
    -Aclippy::unnecessary_unwrap
cargo run --release --manifest-path $toml
