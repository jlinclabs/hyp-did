#!/usr/bin/env bash

cd "$(dirname "$0")"

set -e
set -x

(cd node && npm link ../util && ls -la ./node_modules/jlinx-*);
(cd host && npm link ../util ../vault ../node && ls -la ./node_modules/jlinx-*);
(cd client && npm link ../util ../vault && ls -la ./node_modules/jlinx-*);
(cd cli && npm link ../util ../client ../vault && ls -la ./node_modules/jlinx-*);
(cd demo-apps && npm link ../util ../client ../vault && ls -la ./node_modules/jlinx-*);
(cd desktop/release/app && npm link ../../../util ../../../client ../../../vault ../../../identification  && ls -la ./node_modules/jlinx-*);
