jest.mock("../../device", () => {
  const readStatus = jest.fn(() => (new Promise((r) => r())));
  return {
    getDevice() {
      return { readStatus };
    }
  };
});

import { autoRefreshBot } from "../auto_refresh_bot";
import { getDevice } from "../../device";
import { Everything } from "../../interfaces";

describe("autoRefreshBot", () => {
  function fakeState(): Everything {
    return {
      bot: {
        connectivity: {
          ["bot.mqtt"]: { state: "up", at: (new Date()).toISOString() }
        }
      }
    } as any;
  }

  it("goes from `down` to `up`", () => {
    jest.clearAllMocks();
    autoRefreshBot.fn(fakeState());
    const hmm = getDevice().readStatus;
    expect(hmm).toHaveBeenCalled();
  });
});
