#!/usr/bin/env python3
import contextlib
import io
import json
import os
from pathlib import Path
import runpy
import sys
import tempfile
import unittest
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[2]
CI = ROOT / "scripts" / "ci"


class FakeResponse:
    def __init__(self, body):
        self.body = body

    def __enter__(self):
        return self

    def __exit__(self, _exc_type, _exc_value, _traceback):
        return False

    def read(self):
        return self.body.encode()


def run_script(name, argv=None, env=None):
    stdout = io.StringIO()
    stderr = io.StringIO()
    script = CI / name
    with patch.object(sys, "argv", [str(script), *(argv or [])]):
        with patch.dict(os.environ, env or {}, clear=True):
            with contextlib.redirect_stdout(stdout):
                with contextlib.redirect_stderr(stderr):
                    try:
                        runpy.run_path(str(script), run_name="__main__")
                    except SystemExit as error:
                        code = error.code if isinstance(error.code, int) else 1
                    else:
                        code = 0
    return code, stdout.getvalue(), stderr.getvalue()


class CiPythonScriptTest(unittest.TestCase):
    def test_percent_change_reports_percent(self):
        code, stdout, stderr = run_script("percent-change", [
            "--new", "110",
            "--old", "100",
        ])
        self.assertEqual(code, 0)
        self.assertEqual(stdout, "10.00\n")
        self.assertEqual(stderr, "")

    def test_percent_change_handles_zero_old_value(self):
        code, stdout, _stderr = run_script("percent-change", [
            "--new", "110",
            "--old", "0",
        ])
        self.assertEqual(code, 0)
        self.assertEqual(stdout, "n/a\n")

    def test_previous_fps_value_reads_previous_row(self):
        metrics_name = f"scene_metrics_test_{os.getpid()}"
        path = Path("/tmp") / f"{metrics_name}.csv"
        path.write_text(
            "epoch, FPS, Calls\n"
            "1, 80, 1\n"
            "2, 90, 1\n"
            "3, 100, 1\n",
        )
        try:
            code, stdout, stderr = run_script("previous-fps-value", env={
                "CHOSEN_METRICS": metrics_name,
                "FALLBACK_FPS_VALUE": "100",
            })
        finally:
            path.unlink(missing_ok=True)

        self.assertEqual(code, 0)
        self.assertEqual(stdout, "90.00\n")
        self.assertEqual(stderr, "")

    def test_previous_fps_value_uses_fallback_without_history(self):
        code, stdout, _stderr = run_script("previous-fps-value", env={
            "CHOSEN_METRICS": f"missing_metrics_{os.getpid()}",
            "FALLBACK_FPS_VALUE": "100",
        })
        self.assertEqual(code, 0)
        self.assertEqual(stdout, "100\n")

    def test_render_url_records_outputs_field_separated_records(self):
        with tempfile.NamedTemporaryFile("w", delete=False) as file:
            json.dump([{
                "name": "promo",
                "mode": "fps",
                "url": "http://localhost:3000/promo",
                "click": "Run",
                "state": "app",
            }], file)
            file_path = file.name
        try:
            code, stdout, stderr = run_script(
                "render-url-records", [file_path])
        finally:
            Path(file_path).unlink(missing_ok=True)

        self.assertEqual(code, 0)
        self.assertEqual(
            stdout, "promo\034fps\034http://localhost:3000/promo\034Run\034app\n")
        self.assertEqual(stderr, "")

    def test_create_compare_link_uses_latest_deployment_sha(self):
        deployments = json.dumps([{"sha": "old123"}])
        with patch("urllib.request.urlopen", return_value=FakeResponse(deployments)):
            code, stdout, stderr = run_script("create-compare-link", env={
                "GITHUB_SHA": "new456",
            })

        self.assertEqual(code, 0)
        self.assertEqual(
            stdout, "https://github.com/Farmbot/Farmbot-Web-App/compare/old123...new456\n")
        self.assertEqual(stderr, "")

    def test_send_notification_skips_without_webhook(self):
        code, stdout, stderr = run_script("send-notification", ["hello"])
        self.assertEqual(code, 0)
        self.assertEqual(stdout, "")
        self.assertEqual(stderr, "")

    def test_send_notification_posts_payload(self):
        calls = []

        def fake_urlopen(request, timeout):
            calls.append((request, timeout))
            return object()

        with patch("urllib.request.urlopen", side_effect=fake_urlopen):
            code, stdout, stderr = run_script("send-notification", ["hello", "world"], env={
                "SLACK_WEBHOOK_URL": "https://example.test/webhook",
            })

        self.assertEqual(code, 0)
        self.assertEqual(stdout, "")
        self.assertEqual(stderr, "")
        self.assertEqual(len(calls), 1)
        request, timeout = calls[0]
        self.assertEqual(timeout, 30)
        self.assertEqual(request.full_url, "https://example.test/webhook")
        self.assertEqual(request.get_method(), "POST")
        self.assertEqual(json.loads(request.data.decode()), {
            "text": "hello world",
            "channel": "#software",
        })

    def test_track_fe_coverage_appends_csv(self):
        coverage_name = f"fe_coverage_test_{os.getpid()}"
        csv_path = Path("/tmp") / f"{coverage_name}.csv"
        with tempfile.NamedTemporaryFile("w", delete=False) as lcov:
            lcov.write("LF:10\nLH:8\nLF:5\nLH:4\n")
            lcov_path = lcov.name

        try:
            code, stdout, stderr = run_script("track-fe-coverage", env={
                "FE_COVERAGE_NAME": coverage_name,
                "FALLBACK_FE_COVERAGE_VALUE": "75",
                "FE_LCOV_PATH": lcov_path,
                "GITHUB_SHA": "0123456789abcdef",
                "PATH": os.environ["PATH"],
            })
        finally:
            Path(lcov_path).unlink(missing_ok=True)
            csv_path.unlink(missing_ok=True)

        self.assertEqual(code, 0)
        self.assertIn(
            "Covered lines: 12, Total lines: 15, Coverage: 80.00%", stdout)
        self.assertIn("80.00% (6.67% change)", stdout)
        self.assertIn(
            "percent,covered lines,total lines,percent change,commit sha\n"
            "80.00,12,15,6.67,0123456789\n", stdout)
        self.assertEqual(stderr, "")

    def test_track_fe_coverage_migrates_csv_header(self):
        coverage_name = f"fe_coverage_existing_test_{os.getpid()}"
        csv_path = Path("/tmp") / f"{coverage_name}.csv"
        csv_path.write_text(
            "percent,covered lines,total lines,percent change\n"
            "75.00,3,4,n/a\n")
        with tempfile.NamedTemporaryFile("w", delete=False) as lcov:
            lcov.write("LF:10\nLH:8\n")
            lcov_path = lcov.name

        try:
            code, stdout, stderr = run_script("track-fe-coverage", env={
                "FE_COVERAGE_NAME": coverage_name,
                "FALLBACK_FE_COVERAGE_VALUE": "70",
                "FE_LCOV_PATH": lcov_path,
                "GITHUB_SHA": "abcdef0123456789",
                "PATH": os.environ["PATH"],
            })
        finally:
            Path(lcov_path).unlink(missing_ok=True)
            csv_path.unlink(missing_ok=True)

        self.assertEqual(code, 0)
        self.assertIn(
            "percent,covered lines,total lines,percent change,commit sha\n"
            "75.00,3,4,n/a,\n"
            "80.00,8,10,6.67,abcdef0123\n", stdout)
        self.assertEqual(stderr, "")


if __name__ == "__main__":
    unittest.main()
