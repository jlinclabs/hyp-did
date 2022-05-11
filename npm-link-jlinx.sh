#!/usr/bin/env bash

set -e
set -x

ls -la node_modules | grep jlinx-
npm link $(ls -1 node_modules | grep jlinx-)
ls -la node_modules | grep jlinx-
