#!/bin/sh
set -e
folder=$HOME/github.com/loicbourgois/loicbourgois/dap/$1
program=$folder/main.dap
echo "# Transpiling"
cargo fmt --manifest-path $HOME/github.com/loicbourgois/loicbourgois/dap/dap/Cargo.toml
cargo clippy --release --manifest-path $HOME/github.com/loicbourgois/loicbourgois/dap/dap/Cargo.toml \
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
cargo run --release --manifest-path $HOME/github.com/loicbourgois/loicbourgois/dap/dap/Cargo.toml -- $1 $program
echo "# Formatting"
cargo fmt --manifest-path $folder/Cargo.toml
cat $folder/src/main.rs
# cargo clippy --release --manifest-path $folder/Cargo.toml \
#     -- -Dwarnings -Dclippy::pedantic \
#     -Aclippy::cast_precision_loss \
#     -Aclippy::cast_sign_loss \
#     -Aclippy::cast_possible_truncation \
#     -Aclippy::similar_names \
#     -Aclippy::cast_possible_wrap \
#     -Aclippy::too_many_lines \
#     -Aclippy::too_many_arguments \
#     -Aclippy::module_name_repetitions \
#     -Aclippy::must_use_candidate \
#     -Aclippy::match_on_vec_items \
#     -Aclippy::missing_panics_doc \
#     -Aclippy::print_literal
echo "# Running"
cargo run --release --manifest-path $folder/Cargo.toml
