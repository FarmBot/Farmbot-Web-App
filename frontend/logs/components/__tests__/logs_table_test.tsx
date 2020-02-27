import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { bySearchTerm } from "../logs_table";
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
