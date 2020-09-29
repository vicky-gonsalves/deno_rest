#!/bin/bash

echo "Updating lock file.."
deno cache --lock=lock.json --lock-write --unstable ./deps.ts

exit 1
