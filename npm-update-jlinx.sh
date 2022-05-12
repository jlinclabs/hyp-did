# #!/usr/bin/env bash

set -e
set -x

PACKAGES=$(ls -1 node_modules | grep jlinx-)
npm upgrade $PACKAGES
git diff package.json package-lock.json
git add package.json package-lock.json
git ci -m "upgraded npm dep $PACKAGES"
