#!/bin/bash

P1_REPO="https://github.com/e1732a364fed/ruci.git"
TEMP_DIR=$(mktemp -d)

git clone "$P1_REPO" "$TEMP_DIR/p1"

cd "$TEMP_DIR/p1/doc/book"
mdbook build

cd -
cp -r "$TEMP_DIR/p1/doc/book/book" "public"

git add public/book
git commit -m "Update book folder from ruci"

rm -rf "$TEMP_DIR"