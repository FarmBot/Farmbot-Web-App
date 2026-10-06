"""Run with: python3 -B -m unittest discover -s scripts -p 'test_filter_logs.py'"""

import io
from pathlib import Path
import select
import subprocess
import sys
import unittest
from unittest.mock import patch

from filter_logs import filter_logs, main


SCRIPT = Path(__file__).with_name("filter_logs.py")


class FilterLogsTest(unittest.TestCase):
    def test_keeps_arbitrary_literal_messages_and_discards_other_output(self):
        lines = [
            "web-1 | GET /api/device\n",
            "worker-1 | task completed: id=1\n",
            "worker-1 | task completed: id=2\n",
            "worker-1 | task pending: id=3\n",
        ]
        output = io.StringIO()

        filter_logs(lines, output, "task completed")

        self.assertEqual(output.getvalue(), "".join(lines[1:3]))

    def test_treats_regex_metacharacters_as_literal_by_default(self):
        line = "worker-1 | task [done].*\n"
        output = io.StringIO()

        filter_logs(["worker-1 | task done\n", line], output, "[done].*")

        self.assertEqual(output.getvalue(), line)

    def test_regex_matches_alternatives(self):
        lines = ["task STARTED\n", "task pending\n", "task FAILED\n"]
        output = io.StringIO()

        filter_logs(lines, output, "STARTED|FAILED", regex=True)

        self.assertEqual(output.getvalue(), lines[0] + lines[2])

    def test_matching_is_case_sensitive(self):
        for regex in (False, True):
            with self.subTest(regex=regex):
                output = io.StringIO()

                filter_logs(["ready\n", "READY\n"], output, "READY", regex=regex)

                self.assertEqual(output.getvalue(), "READY\n")

    def test_matches_colored_text_and_preserves_original_output(self):
        line = "worker-1 | \x1b[32mtask \x1b[0mcompleted: id=1\n"
        for regex in (False, True):
            with self.subTest(regex=regex):
                output = io.StringIO()

                filter_logs([line], output, "task completed", regex=regex)

                self.assertEqual(output.getvalue(), line)

    def test_rejects_empty_pattern(self):
        with self.assertRaisesRegex(ValueError, "pattern must not be empty"):
            filter_logs([], io.StringIO(), "")

    def test_cli_matches_literal_and_regex_patterns(self):
        for arguments, expected in (
            (["[done]"], "task [done]\n"),
            (["--regex", "STARTED|FAILED"], "task STARTED\ntask FAILED\n"),
        ):
            with self.subTest(arguments=arguments):
                result = subprocess.run(
                    [sys.executable, "-B", str(SCRIPT), *arguments],
                    input="task [done]\ntask STARTED\ntask FAILED\ntask pending\n",
                    capture_output=True,
                    text=True,
                    timeout=5,
                )

                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(result.stdout, expected)

    def test_cli_rejects_invalid_arguments_before_reading_input(self):
        for arguments, error in (
            ([], "required"),
            ([""], "pattern must not be empty"),
            (["--regex", "["], "invalid regular expression"),
        ):
            with self.subTest(arguments=arguments):
                with patch("sys.argv", [str(SCRIPT), *arguments]), \
                        patch("sys.stdin") as source, \
                        patch("sys.stderr", new_callable=io.StringIO) as errors:
                    with self.assertRaises(SystemExit) as raised:
                        main()

                    self.assertEqual(raised.exception.code, 2)
                    self.assertIn(error, errors.getvalue())
                    source.isatty.assert_not_called()
                    source.__iter__.assert_not_called()

    def test_cli_requires_piped_input(self):
        with patch("sys.argv", [str(SCRIPT), "ready"]), \
                patch("sys.stdin") as source, \
                patch("sys.stderr", new_callable=io.StringIO) as errors:
            source.isatty.return_value = True

            with self.assertRaises(SystemExit) as raised:
                main()

            self.assertEqual(raised.exception.code, 2)
            self.assertIn("pipe log output into this script", errors.getvalue())

    def test_cli_returns_130_on_keyboard_interrupt(self):
        with patch("sys.argv", [str(SCRIPT), "ready"]), \
                patch("sys.stdin") as source, \
                patch("filter_logs.filter_logs", side_effect=KeyboardInterrupt):
            source.isatty.return_value = False

            self.assertEqual(main(), 130)

    def test_emits_matching_line_before_input_closes(self):
        process = subprocess.Popen(
            [sys.executable, "-B", str(SCRIPT), "task completed"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        try:
            line = b"worker-1 | task completed: id=1\n"
            process.stdin.write(b"db-1 | ready\n" + line)
            process.stdin.flush()

            ready, _, _ = select.select([process.stdout], [], [], 5)
            self.assertTrue(ready, "matching log was buffered until EOF")
            self.assertEqual(process.stdout.readline(), line)
            self.assertIsNone(process.poll())

            _, errors = process.communicate(timeout=5)
            self.assertEqual(process.returncode, 0, errors.decode())
        finally:
            if process.poll() is None:
                process.kill()
                process.communicate()
            for stream in (process.stdin, process.stdout, process.stderr):
                stream.close()


if __name__ == "__main__":
    unittest.main()
