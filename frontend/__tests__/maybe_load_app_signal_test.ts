jest.mock("@appsignal/javascript", () => {
  return class X {
    use = jest.fn();
  };
});

jest.mock("@appsignal/plugin-window-events", () => {
  return { plugin: jest.fn() };
});

import { maybeLoadAppSignal } from "../maybe_load_app_signal";
import { plugin } from "@appsignal/plugin-window-events";

describe("maybeLoadAppSignal", () => {
  it("loads AppSignal when appropriate, but only once", async () => {
    const oldValue = globalConfig["APPSIGNAL_TOKEN"];
    globalConfig["APPSIGNAL_TOKEN"] = "=== EXAMPLE ===";
    expect(window.appSignal).not.toBeDefined();
    await maybeLoadAppSignal();
    await maybeLoadAppSignal();
    globalConfig["APPSIGNAL_TOKEN"] = oldValue;
    expect(window.appSignal).toBeDefined();
    if (window.appSignal) {
      expect(window.appSignal.use).toHaveBeenCalledTimes(1);
    }
    expect(plugin).toHaveBeenCalledTimes(1);
  });
});
