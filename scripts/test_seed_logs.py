"""Run with: python3 -B -m unittest test_seed_logs"""

import io
from pathlib import Path
import select
import subprocess
import sys
import unittest

from seed_logs import filter_logs


class SeedLogsTest(unittest.TestCase):
    def test_keeps_lifecycle_messages_and_discards_other_output(self):
        lines = [
            "web-1 | GET /api/device\n",
            "delayed_job-1 | SEED DATA STARTED: device_id=1\n",
            "web-1 | SEED DATA COMPLETED: device_id=2\n",
            "delayed_job-1 | SEED DATA FAILED: device_id=3 step=demo_setup\n",
            "web-1 | unrelated seed data message\n",
        ]
        output = io.StringIO()

        filter_logs(lines, output)

        self.assertEqual(output.getvalue(), "".join(lines[1:4]))

    def test_matches_colored_markers_and_preserves_original_output(self):
        line = "web-1 | \x1b[32mSEED DATA \x1b[0mCOMPLETED: device_id=1\n"
        output = io.StringIO()

        filter_logs([line], output)

        self.assertEqual(output.getvalue(), line)

    def test_emits_matching_line_before_input_closes(self):
        script = Path(__file__).with_name("seed_logs.py")
        process = subprocess.Popen(
            [sys.executable, "-B", str(script)],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        try:
            line = b"web-1 | SEED DATA STARTED: device_id=1\n"
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
