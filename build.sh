#!/bin/sh
rustup override set stable
cargo +nightly fmt --manifest-path $HOME/github.com/loicbourgois/loicbourgois/takana/wasm/Cargo.toml
cargo clippy \
    --manifest-path $HOME/github.com/loicbourgois/loicbourgois/takana/wasm/Cargo.toml \
    --fix \
    --allow-dirty \
    -- \
    -A clippy::single_match \
    -A clippy::too_many_arguments \
    -W clippy::pedantic \
    -A clippy::cast_precision_loss \
    -A clippy::cast_sign_loss \
    -A clippy::cast_possible_truncation \
    -A clippy::module_name_repetitions \
    -A clippy::unused_self \
    -A clippy::too_many_lines \
    -A clippy::match_same_arms \
    -A clippy::similar_names \
    -A clippy::many_single_char_names \
    -A clippy::match_on_vec_items \
    -A clippy::single_match_else \
    -A clippy::missing_panics_doc \
    -A clippy::must_use_candidate
RUST_BACKTRACE=1 cargo test \
    --manifest-path $HOME/github.com/loicbourgois/loicbourgois/takana/wasm/Cargo.toml \
    -- --nocapture
# echo "wasm-pack build"
# echo "build"
# rm -rf $HOME/github.com/loicbourgois/loicbourgois/takana/wasm_compiled
rm -rf $HOME/github.com/loicbourgois/loicbourgois/takana/wasm/pkg/
cd $HOME/github.com/loicbourgois/loicbourgois/takana/wasm
wasm-pack build --no-typescript --release --target web
# cp -r $HOME/github.com/loicbourgois/loicbourgois/takana/wasm/pkg/ \
  # $HOME/github.com/loicbourgois/loicbourgois/takana/wasm_compiled
# echo "http://localhost/"
# docker-compose \
#   --file $HOME/github.com/loicbourgois/notana/docker-compose.yml \
#   up \
#   --renew-anon-volumes --build --force-recreate --remove-orphans
