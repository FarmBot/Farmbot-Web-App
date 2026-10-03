#!/usr/bin/env python3
"""Show seed lifecycle messages from Docker Compose output in real time.

Usage:
    docker compose up 2>&1 | python3 seed_logs.py
    docker compose logs --follow web delayed_job 2>&1 | python3 seed_logs.py
"""

import argparse
import re
import sys


ANSI_ESCAPE = re.compile(r"\x1b\[[0-?]*[ -/]*[@-~]")
SEED_MESSAGE = re.compile(r"\bSEED DATA (?:STARTED|COMPLETED|FAILED):")


def filter_logs(source, destination):
    """Keep original matching lines, flushing each one as it arrives."""
    for line in source:
        if SEED_MESSAGE.search(ANSI_ESCAPE.sub("", line)):
            destination.write(line)
            destination.flush()


def main():
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.parse_args()
    if sys.stdin.isatty():
        parser.error("pipe Docker Compose output into this script")
    try:
        filter_logs(sys.stdin, sys.stdout)
    except KeyboardInterrupt:
        return 130
    return 0


if __name__ == "__main__":
    sys.exit(main())
