#!/usr/bin/env python3
r"""Show selected logs in real time.

Usage:
    sudo docker compose logs --follow 2>&1 | python scripts/filter_logs.py 'SEED DATA'
    sudo docker compose logs --follow 2>&1 | python scripts/filter_logs.py \
        --regex '\bSEED DATA (?:STARTED|COMPLETED|FAILED):'
"""

import argparse
import re
import sys


ANSI_ESCAPE = re.compile(r"\x1b\[[0-?]*[ -/]*[@-~]")


def filter_logs(source, destination, pattern, *, regex=False):
    """Keep original matching lines, flushing each one as it arrives."""
    if not pattern:
        raise ValueError("pattern must not be empty")
    if regex:
        matches = re.compile(pattern).search
    else:
        def matches(line):
            return pattern in line
    for line in source:
        if matches(ANSI_ESCAPE.sub("", line)):
            destination.write(line)
            destination.flush()


def main():
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("pattern", help="case-sensitive text to match")
    parser.add_argument(
        "--regex",
        action="store_true",
        help="interpret pattern as a regular expression",
    )
    args = parser.parse_args()
    if not args.pattern:
        parser.error("pattern must not be empty")
    if args.regex:
        try:
            re.compile(args.pattern)
        except re.error as error:
            parser.error(f"invalid regular expression: {error}")
    if sys.stdin.isatty():
        parser.error("pipe log output into this script")
    try:
        filter_logs(sys.stdin, sys.stdout, args.pattern, regex=args.regex)
    except KeyboardInterrupt:
        return 130
    return 0


if __name__ == "__main__":
    sys.exit(main())
