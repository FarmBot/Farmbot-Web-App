import unittest

from scripts.analyze_test_timings import format_timings, parse_timings


SAMPLE_OUTPUT = """
frontend/fast_test.tsx:
✓ suite > milliseconds [2.44ms]
✓ suite > microseconds [900µs]

frontend/slow_test.tsx:
\x1b[32m✓ suite > seconds [1.20s]\x1b[0m
✗ suite > nanoseconds [500ns]
Ran 4 tests across 2 files. [1.30s]
"""


class AnalyzeTestTimingsTest(unittest.TestCase):
    def test_parses_and_sorts_test_timings(self):
        timings = parse_timings(SAMPLE_OUTPUT)

        self.assertEqual(
            [(timing.file, timing.name, timing.milliseconds)
             for timing in timings],
            [
                ("frontend/slow_test.tsx", "suite > seconds", 1200),
                ("frontend/fast_test.tsx", "suite > milliseconds", 2.44),
                ("frontend/fast_test.tsx", "suite > microseconds", 0.9),
                ("frontend/slow_test.tsx", "suite > nanoseconds", 0.0005),
            ],
        )

    def test_formats_only_the_requested_number_of_tests(self):
        output = format_timings(parse_timings(SAMPLE_OUTPUT), 2)

        self.assertIn("1.   1200.000ms", output)
        self.assertIn("frontend/slow_test.tsx > suite > seconds", output)
        self.assertIn("2.      2.440ms", output)
        self.assertNotIn("microseconds", output)

    def test_handles_output_without_timed_tests(self):
        self.assertEqual(format_timings(parse_timings("0 pass"), 100),
                         "No timed tests found.")


if __name__ == "__main__":
    unittest.main()
