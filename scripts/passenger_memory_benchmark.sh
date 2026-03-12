#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/passenger_memory_benchmark.sh [options]

Runs a repeatable Passenger memory comparison:
1. Waits for the app to respond.
2. Captures Passenger and Ruby process memory before traffic.
3. Hits the target endpoint a fixed number of times.
4. Captures the same memory snapshots again.

Options:
  --url URL         Base URL to benchmark. Default: http://127.0.0.1:3000
  --path PATH       Request path to hit. Default: /
  --requests N      Number of requests to send. Default: 25
  --concurrency N   Parallel curls to run at once. Default: 1
  --label NAME      Label for the output directory. Default: current git rev
  --header VALUE    Extra curl header. May be passed multiple times.
  --curl-arg VALUE  Extra curl argument. May be passed multiple times.
  --help            Show this help.

Example:
  scripts/passenger_memory_benchmark.sh --label "current" --header "Authorization: Bearer <token>"

Output:
  tmp/memory_benchmark/<timestamp>-<label>/
EOF
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    printf 'Missing required command: %s\n' "$1" >&2
    exit 1
  }
}

base_url="http://127.0.0.1:3000"
path="/api/points"
requests=50
concurrency=1
label="no-label"
headers=()
curl_args=()

while [ "$#" -gt 0 ]; do
  case "$1" in
    --url)
      base_url="$2"
      shift 2
      ;;
    --path)
      path="$2"
      shift 2
      ;;
    --requests)
      requests="$2"
      shift 2
      ;;
    --concurrency)
      concurrency="$2"
      shift 2
      ;;
    --label)
      label="$2"
      shift 2
      ;;
    --header)
      headers+=("$2")
      shift 2
      ;;
    --curl-arg)
      curl_args+=("$2")
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      printf 'Unknown option: %s\n\n' "$1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

require_cmd curl
require_cmd passenger-memory-stats
require_cmd passenger-status
require_cmd ps
require_cmd xargs

case "$requests" in
  ''|*[!0-9]*)
    printf '--requests must be a positive integer\n' >&2
    exit 1
    ;;
esac

case "$concurrency" in
  ''|*[!0-9]*)
    printf '--concurrency must be a positive integer\n' >&2
    exit 1
    ;;
esac

if [ "$requests" -le 0 ] || [ "$concurrency" -le 0 ]; then
  printf '--requests and --concurrency must be greater than zero\n' >&2
  exit 1
fi

timestamp="$(date +%Y%m%d-%H%M%S)"
safe_label="$(printf '%s' "$label" | tr '/[:space:]' '__')"
out_dir="tmp/memory_benchmark/${timestamp}-${safe_label}"
mkdir -p "$out_dir"

target="${base_url%/}${path}"

curl_cmd=(
  curl
  --silent
  --show-error
  --location
  --output /dev/null
)

for header in "${headers[@]}"; do
  curl_cmd+=(-H "$header")
done

for arg in "${curl_args[@]}"; do
  curl_cmd+=("$arg")
done

wait_for_app() {
  printf 'Waiting for %s\n' "$target"
  for _ in $(seq 1 60); do
    if "${curl_cmd[@]}" "$target" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  printf 'App did not become ready: %s\n' "$target" >&2
  exit 1
}

capture_snapshot() {
  name="$1"
  snapshot_dir="$out_dir/$name"
  mkdir -p "$snapshot_dir"

  passenger-memory-stats >"$snapshot_dir/passenger-memory-stats.txt"
  passenger-status >"$snapshot_dir/passenger-status.txt"
}

extract_worker_private_mb() {
  awk '/Passenger RubyApp:/ { print $4; exit }' "$1"
}

run_traffic() {
  seq "$requests" | xargs -n 1 -P "$concurrency" -I '{}' \
    "${curl_cmd[@]}" "$target"
}

wait_for_app
capture_snapshot before

printf 'Hitting %s %s times with concurrency %s\n' "$target" "$requests" "$concurrency"
run_traffic

capture_snapshot after

before_worker_mb="$(extract_worker_private_mb "$out_dir/before/passenger-memory-stats.txt")"
after_worker_mb="$(extract_worker_private_mb "$out_dir/after/passenger-memory-stats.txt")"
worker_delta_mb="$(awk "BEGIN { printf \"%.1f\", ${after_worker_mb:-0} - ${before_worker_mb:-0} }")"

printf '\nSaved benchmark to %s\n' "$out_dir"
printf 'Passenger RubyApp private MB: before=%s after=%s delta=%s\n' "$before_worker_mb" "$after_worker_mb" "$worker_delta_mb"
