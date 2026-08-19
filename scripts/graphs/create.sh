#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
target="${1:-three_d_garden}"
source_dir="$project_root/frontend/$target"
output="$project_root/scripts/graphs/$target.svg"
highlight_file="${2:-}"

if [[ "$highlight_file" == *.svg ]]; then
  output="$highlight_file"
  highlight_file="${3:-}"
fi

dot_output="${output%.*}.dot"

if [[ ! -d "$source_dir" ]]; then
  echo "Frontend directory not found: $source_dir" >&2
  exit 1
fi

cd "$project_root"

graph_json="$(mktemp)"
trap 'rm -f "$graph_json"' EXIT

"$project_root/node_modules/.bin/madge" \
  --json \
  "frontend/$target" > "$graph_json"

bun "$project_root/scripts/graphs/color_by_directory.ts" \
  "$graph_json" \
  "$dot_output" \
  "$target" \
  "$highlight_file"

dot -Ksfdp -Tsvg "$dot_output" -o "$output"

echo "Created: $output"
echo "DOT source: $dot_output"
