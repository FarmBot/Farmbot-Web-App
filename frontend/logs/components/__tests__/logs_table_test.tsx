import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { bySearchTerm, logVersionMatch } from "../logs_table";
import { fakeLog } from "../../../__test_support__/fake_state/resources";

describe("bySearchTerm()", () => {
  it("includes log", () => {
    const log = fakeLog();
    log.body.message = "include this log";
    const result = bySearchTerm("include", fakeTimeSettings())(log);
    expect(result).toBeTruthy();
  });

  it("excludes log", () => {
    const log = fakeLog();
    log.body.created_at = undefined;
    log.body.message = "exclude this log";
    const result = bySearchTerm("include", fakeTimeSettings())(log);
    expect(result).toBeFalsy();
  });
});

describe("logVersionMatch()", () => {
  it("matches log version", () => {
    const log = fakeLog();
    log.body.major_version = 1;
    log.body.minor_version = 2;
    log.body.patch_version = 3;
    expect(logVersionMatch(log, "1.2.3")).toBeTruthy();
  });

  it("doesn't match log version", () => {
    const log = fakeLog();
    expect(logVersionMatch(log, undefined)).toBeFalsy();
    expect(logVersionMatch(log, "1.1.1")).toBeFalsy();
    expect(logVersionMatch(log, "100.0.0")).toBeFalsy();
  });
});
