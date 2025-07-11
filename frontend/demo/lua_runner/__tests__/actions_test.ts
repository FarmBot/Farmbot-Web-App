import { TOAST_OPTIONS } from "../../../toast/constants";
import { info } from "../../../toast/toast";
import { runActions } from "../actions";

describe("runActions()", () => {
  it("runs actions", () => {
    jest.useFakeTimers();
    runActions([
      { type: "send_message", args: ["info", "Hello, world!", "toast"] },
    ]);
    jest.runAllTimers();
    expect(info).toHaveBeenCalledWith("Hello, world!", TOAST_OPTIONS().info);
  });
});
