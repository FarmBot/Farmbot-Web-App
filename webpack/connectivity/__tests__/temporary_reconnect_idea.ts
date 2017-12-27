import { temporaryReconnectIdea } from "../reducer";
import { ConnectionState, EdgeStatus } from "../interfaces";
import { success } from "farmbot-toastr";
describe("temporaryReconnectIdea", () => {
  it("calls success() when going from down to up", () => {
    jest.resetAllMocks();
    const state: ConnectionState = {
      ["user.mqtt"]: { state: "down", at: "---" },
      ["user.api"]: undefined,
      ["bot.mqtt"]: undefined
    };

    const action: EdgeStatus = {
      name: "user.mqtt",
      status: { state: "up", at: "---" }
    };

    temporaryReconnectIdea(state, action);
    expect(success).toHaveBeenCalled();
  });

  it("skips success() when going from up to down", () => {
    jest.resetAllMocks();
    const state: ConnectionState = {
      ["user.mqtt"]: { state: "up", at: "---" },
      ["user.api"]: undefined,
      ["bot.mqtt"]: undefined
    };

    const action: EdgeStatus = {
      name: "user.mqtt",
      status: { state: "down", at: "---" }
    };

    temporaryReconnectIdea(state, action);
    expect(success).not.toHaveBeenCalled();
  });
});
