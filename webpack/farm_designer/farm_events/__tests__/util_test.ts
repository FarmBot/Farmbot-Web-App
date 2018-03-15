import { maybeWarnAboutMissedTasks } from "../util";
import { fakeFarmEvent } from "../../../__test_support__/fake_state/resources";
import * as moment from "moment";

describe("maybeWarnAboutMissedTasks()", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  function testWarn(time: string): () => void {
    const callback = jest.fn();
    const fe = fakeFarmEvent("Regimen", 1);
    fe.body.start_time = "2017-05-21T22:00:00.000";
    maybeWarnAboutMissedTasks(fe,
      () => callback("missed event warning"),
      moment(time))();
    return callback;
  }
  it("warns", () => {
    const cb = testWarn("2017-05-21T22:00:00.000");
    expect(cb).toHaveBeenCalledWith("missed event warning");
  });

  it("doesn't warn", () => {
    const cb = testWarn("2017-05-01T22:00:00.000");
    expect(cb).not.toHaveBeenCalled();
  });
});
