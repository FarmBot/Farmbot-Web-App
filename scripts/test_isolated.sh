#!/usr/bin/env bash
set -euo pipefail

start="${1:-1}"
test="${2:-}"

mapfile -t generated_files < <(
  find frontend -type f \( -name "*_test.ts" -o -name "*_test.tsx" \) | sort
)
total="${#generated_files[@]}"

for idx in "${!generated_files[@]}"; do
  i=$((idx + 1))
  [ "$i" -lt "$start" ] && continue
  file="${generated_files[$idx]}"

  printf '\nfile %s of %s:\n' "$i" "$total"
  cmd=(bun test "$file")
  [ -n "$test" ] && cmd+=("$test")
  "${cmd[@]}" || {
    printf '\nsudo docker compose run web bun test-iso %s %s\n' "$i" "$test"
    printf '\nsudo docker compose run web bun test %s %s\n\n' "$file" "$test"
    exit 1
  }
done
