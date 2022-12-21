#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run build

git add dist -f

# git init
# git checkout -b main
git add .
git commit -m 'deploy'
git subtree push --prefix dist origin gh-pages

cd -