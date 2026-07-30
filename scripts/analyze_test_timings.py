#!/usr/bin/env python3
"""Print the slowest tests found in Bun test runner output."""

import argparse
from dataclasses import dataclass
from pathlib import Path
import re


ANSI_ESCAPE = re.compile(r"\x1b\[[0-?]*[ -/]*[@-~]")
TEST_RESULT = re.compile(
    r"^(?:✓|✗|×|✖|✕|\(pass\)|\(fail\))\s+(?P<name>.+?)"
    r"\s+\[(?P<duration>\d+(?:\.\d+)?)"
    r"(?P<unit>ns|µs|μs|us|ms|s)\]\s*$",
)
UNIT_TO_MS = {
    "ns": 0.000001,
    "µs": 0.001,
    "μs": 0.001,
    "us": 0.001,
    "ms": 1,
    "s": 1000,
}


@dataclass(frozen=True)
class TestTiming:
    file: str
    name: str
    milliseconds: float


def parse_timings(output: str) -> list[TestTiming]:
    """Extract timed test result lines and their most recent file heading."""
    timings = []
    current_file = "(unknown file)"

    for raw_line in output.splitlines():
        line = ANSI_ESCAPE.sub("", raw_line).strip()
        match = TEST_RESULT.match(line)
        if match:
            duration = float(match.group("duration"))
            milliseconds = duration * UNIT_TO_MS[match.group("unit")]
            timings.append(TestTiming(
                file=current_file,
                name=match.group("name"),
                milliseconds=milliseconds,
            ))
        elif line.endswith(":") and "/" in line:
            current_file = line[:-1]

    return sorted(
        timings,
        key=lambda timing: timing.milliseconds,
        reverse=True,
    )


def format_timings(timings: list[TestTiming], limit: int) -> str:
    selected = timings[:limit]
    if not selected:
        return "No timed tests found."

    width = len(str(len(selected)))
    return "\n".join(
        f"{index:>{width}}. {timing.milliseconds:>10.3f}ms  "
        f"{timing.file} > {timing.name}"
        for index, timing in enumerate(selected, start=1)
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Print the slowest tests in saved Bun test output.",
    )
    parser.add_argument("output", type=Path)
    parser.add_argument("--limit", type=int, default=100)
    args = parser.parse_args()

    if args.limit < 1:
        parser.error("--limit must be at least 1")

    output = args.output.read_text(encoding="utf-8", errors="replace")
    print(format_timings(parse_timings(output), args.limit))


if __name__ == "__main__":
    main()
