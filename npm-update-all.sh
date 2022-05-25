#!/usr/bin/env bash

cd "$(dirname "$0")"

set -e
set -x

(cd node && ../npm-update-jlinx.sh);
(cd client && ../npm-update-jlinx.sh);
(cd http-server && ../npm-update-jlinx.sh);
(cd cli && ../npm-update-jlinx.sh);
(cd desktop && ../npm-update-jlinx.sh);
