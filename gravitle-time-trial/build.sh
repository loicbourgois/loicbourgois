#!/bin/sh
# $HOME/github.com/loicbourgois/loicbourgois/gravitle-time-trial/build.sh
set -e
echo "Format"
cd $HOME/github.com/loicbourgois/loicbourgois/gravitle-time-trial
dprint fmt

echo "Validate rust"
cd $HOME/github.com/loicbourgois/loicbourgois/gravitle-time-trial/engine
cargo fmt
cargo clippy --release \
    -- -Dwarnings -Dclippy::pedantic \
    -Aclippy::cast_precision_loss \
    -Aclippy::cast_sign_loss \
    -Aclippy::cast_possible_truncation \
    -Aclippy::similar_names \
    -Aclippy::cast_possible_wrap \
    -Aclippy::too_many_lines \
    -Aclippy::too_many_arguments \
    -Aclippy::module_name_repetitions \
    -Aunused_variables \
    -Adead_code \
    -Aunused_imports

echo "Build wasm"
RUSTFLAGS='--cfg getrandom_backend="wasm_js"' wasm-pack build --target web

echo "Copy wasm"
source="$HOME/github.com/loicbourgois/loicbourgois/gravitle-time-trial/engine/pkg/"
dest="$HOME/github.com/loicbourgois/loicbourgois/gravitle-time-trial/"
cp $source/gravitle_time_trial_bg.wasm $dest/gravitle_time_trial_bg.wasm
cp $source/gravitle_time_trial.js $dest/gravitle_time_trial.js
