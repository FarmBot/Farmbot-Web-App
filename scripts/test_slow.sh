#!/usr/bin/env bash
set -uo pipefail

max_attempts=5

attempt=1
while true; do
  if timeout --kill-after=30s 2m bun test --bail; then
    bun run coverage-html
    exit $?
  else
    test_status=$?
  fi

  case "$test_status" in
    124|137)
      if [ "$attempt" -lt "$max_attempts" ]; then
        attempt=$((attempt + 1))
        printf 'Test run timed out; starting attempt %s of %s...\n' \
          "$attempt" "$max_attempts"
        continue
      fi
      ;;
  esac

  exit "$test_status"
done
