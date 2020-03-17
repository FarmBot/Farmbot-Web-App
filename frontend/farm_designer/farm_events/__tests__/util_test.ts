import { maybeWarnAboutMissedTasks } from "../util";
import { fakeFarmEvent } from "../../../__test_support__/fake_state/resources";
import moment from "moment";
import { ExecutableType } from "farmbot/dist/resources/api_resources";

describe("maybeWarnAboutMissedTasks()", () => {
  function testWarn(
    time: string, executableType: ExecutableType = "Regimen",
  ): () => void {
    const callback = jest.fn();
    const fe = fakeFarmEvent(executableType, 1);
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

  it("doesn't warn when not a regimen", () => {
    const cb = testWarn("2017-05-21T22:00:00.000", "Sequence");
    expect(cb).not.toHaveBeenCalled();
  });
});
