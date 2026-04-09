import { createRefreshTrigger } from "../create_refresh_trigger";
import * as connectDevice from "../../connectivity/connect_device";
import * as deviceModule from "../../device";

describe("createRefreshTrigger", () => {
  let changeLastClientConnectedSpy: jest.SpyInstance;
  let maybeGetDeviceSpy: jest.SpyInstance;

  beforeEach(() => {
    changeLastClientConnectedSpy = jest.spyOn(connectDevice, "changeLastClientConnected")
      .mockImplementation(jest.fn(() => jest.fn()));
    maybeGetDeviceSpy = jest.spyOn(deviceModule, "maybeGetDevice")
      .mockImplementation((() =>
        ({} as import("farmbot").Farmbot)) as typeof deviceModule.maybeGetDevice);
  });

  afterEach(() => {
    changeLastClientConnectedSpy.mockRestore();
    maybeGetDeviceSpy.mockRestore();
  });

  it("never calls the bot if status is undefined", () => {
    const go = createRefreshTrigger();
    go(undefined); go(undefined); go(undefined);
    expect(changeLastClientConnectedSpy).not.toHaveBeenCalled();
  });

  it("calls the bot when going from down => up", () => {
    const go = createRefreshTrigger();
    go({ at: 0, state: "down" });
    go({ at: 0, state: "down" });
    expect(changeLastClientConnectedSpy).not.toHaveBeenCalled();
    go({ at: 0, state: "up" });
    expect(changeLastClientConnectedSpy).toHaveBeenCalled();
    expect(maybeGetDeviceSpy).toHaveBeenCalled();
  });
});
