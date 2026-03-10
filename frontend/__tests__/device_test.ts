import { auth } from "../__test_support__/fake_state/token";
import { get } from "lodash";

const loadDeviceModule = async () => {
  return await import(`../device?test=${Math.random()}`);
};

describe("getDevice()", () => {
  it("crashes if you call getDevice() too soon in the app lifecycle", async () => {
    const { getDevice } = await loadDeviceModule();
    expect(() => getDevice()).toThrow("NO DEVICE SET");
  });
});

describe("fetchNewDevice", () => {
  it("returns an instance of FarmBot", async () => {
    const { Farmbot } = await import("farmbot");
    const connectDescriptor = Object.getOwnPropertyDescriptor(
      Farmbot.prototype,
      "connect",
    );
    const connectStub = function (this: unknown) {
      return Promise.resolve(this);
    };
    Object.defineProperty(Farmbot.prototype, "connect", {
      configurable: true,
      get: () => connectStub,
      set: () => { },
    });
    try {
      const { fetchNewDevice } = await loadDeviceModule();
      const bot = await fetchNewDevice(auth);
      expect(bot).toBeInstanceOf(Farmbot);
      // We use this for debugging in local dev env
      expect(get(global, "current_bot")).toBeDefined();
    } finally {
      if (connectDescriptor) {
        Object.defineProperty(Farmbot.prototype, "connect", connectDescriptor);
      } else {
        delete (Farmbot.prototype as { connect?: unknown }).connect;
      }
    }
  });
});
