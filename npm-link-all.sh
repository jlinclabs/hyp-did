#!/usr/bin/env bash

cd "$(dirname "$0")"

set -e
set -x

(cd node && npm link ../util && ls -la ./node_modules/jlinx-*);
(cd client && npm link ../util ../node && ls -la ./node_modules/jlinx-*);
(cd http-server && npm link ../util ../node && ls -la ./node_modules/jlinx-*);
(cd cli && npm link ../util ../client && ls -la ./node_modules/jlinx-*);
(cd desktop && npm link ../util ../client && ls -la ./node_modules/jlinx-*);
