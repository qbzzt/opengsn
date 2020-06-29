#!/usr/bin/env bash
set -e

PORT=8545

export ETH_RPC_URL=http://127.1:$PORT

npx ganache-cli -p $PORT > ganache-log 2>&1 & netpid=$!

until curl -s -o/dev/null "$ETH_RPC_URL"; do
  sleep 1
  if [ -z "$(ps -p $netpid -o pid=)" ]; then
    echo "Ganache stopped running. Check ganache-log for errors."
    exit 1
  fi
done

npx gsn start > gsn-log 2>&1 & gsnpid=$!

until grep '== startGSN: ready.' gsn-log  ; do
  sleep 1
  if [ -z "$(ps -p $gsnpid -o pid=)" ]; then
    echo "Ganache stopped running. Check gsn-log for errors."
    kill $netpid
    exit 1
  fi
done

cat gsn-log

# Stop the testnet when this script exits
trap "kill $netpid $gsnpid" EXIT

$@

