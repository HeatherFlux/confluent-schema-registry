#!/usr/bin/env bash

num_commits_not_on_main="$(git rev-list --no-merges --count HEAD ^origin/main)"

# Launch commitizen-cli only when it's the first commit that isn't on main
if [[ num_commits_not_on_main -lt 1 ]]
then
    exec < /dev/tty && pnpm cz --hook || true
fi
