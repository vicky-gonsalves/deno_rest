#!/bin/bash

echo "Reloading dependencies and updating lock file..."

deno cache --reload --unstable --lock-write --lock=lock.json ./deps.ts

exit 1
