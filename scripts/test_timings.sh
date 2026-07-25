#!/usr/bin/env bash
set -uo pipefail

output_file="${BUN_TEST_OUTPUT:-bun-test-output.log}"
timings_file="${BUN_TEST_TIMINGS_OUTPUT:-bun-test-slowest.log}"
config_file="$(mktemp .bunfig.test-timings.XXXXXX.toml)"
trap 'rm -f "$config_file"' EXIT

sed -E \
  's/^([[:space:]]*onlyFailures[[:space:]]*=[[:space:]]*).*/\1false/' \
  bunfig.toml > "$config_file"

bun test --config="$config_file" 2>&1 | tee "$output_file"
pipeline_status=("${PIPESTATUS[@]}")
test_status="${pipeline_status[0]}"
tee_status="${pipeline_status[1]}"

printf '\nTop 100 slowest tests:\n'
python3 scripts/analyze_test_timings.py "$output_file" --limit 100 \
  | tee "$timings_file"
analysis_pipeline_status=("${PIPESTATUS[@]}")
analyzer_status="${analysis_pipeline_status[0]}"
timings_tee_status="${analysis_pipeline_status[1]}"
printf '\nSaved slowest test report to %s\n' "$timings_file"

if [ "$tee_status" -ne 0 ]; then
  exit "$tee_status"
fi

if [ "$analyzer_status" -ne 0 ]; then
  exit "$analyzer_status"
fi

if [ "$timings_tee_status" -ne 0 ]; then
  exit "$timings_tee_status"
fi

exit "$test_status"
