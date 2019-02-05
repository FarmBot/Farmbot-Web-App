jest.mock("../../connectivity/connect_device", () => {
  return { changeLastClientConnected: jest.fn(() => jest.fn()) };
});

jest.mock("../../device", () => {
  return { maybeGetDevice: jest.fn(() => ({})) };
});

import { createRefreshTrigger } from "../create_refresh_trigger";
import { changeLastClientConnected } from "../../connectivity/connect_device";
import { maybeGetDevice } from "../../device";

describe("createRefreshTrigger", () => {
  it("never calls the bot if status is undefined", () => {
    const go = createRefreshTrigger();
    go(undefined); go(undefined); go(undefined);
    expect(changeLastClientConnected).not.toHaveBeenCalled();
  });

  it("calls the bot when going from down => up", () => {
    const go = createRefreshTrigger();
    go({ at: "?", state: "down" });
    go({ at: "?", state: "down" });
    expect(changeLastClientConnected).not.toHaveBeenCalled();
    go({ at: "?", state: "up" });
    expect(changeLastClientConnected).toHaveBeenCalled();
    expect(maybeGetDevice).toHaveBeenCalled();
  });
});
