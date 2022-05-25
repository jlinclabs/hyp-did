# #!/usr/bin/env bash

set -e
set -x

PACKAGES=$(echo $(ls -1 node_modules | grep jlinx-))
npm upgrade $PACKAGES
git diff package.json
