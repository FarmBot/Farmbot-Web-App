const mockBot = {
  client: {
    subscribe: jest.fn(),
    on: jest.fn(),
  },
  on: jest.fn(),
  readStatus: jest.fn(() => Promise.resolve()),
  setUserEnv: () => Promise.resolve(),
};

jest.mock("../../../device", () => ({ getDevice: () => mockBot }));
jest.mock("../../ping_mqtt", () => ({ startPinging: jest.fn() }));

import { getDevice } from "../../../device";
import { FbjsEventName } from "farmbot/dist/constants";
import { attachEventListeners } from "../../connect_device";
import { startPinging } from "../../ping_mqtt";

describe("attachEventListeners", () => {
  it("attaches relevant callbacks", () => {
    const dev = getDevice();
    attachEventListeners(dev, jest.fn(), jest.fn());
    [
      FbjsEventName.status,
      FbjsEventName.logs,
      FbjsEventName.malformed,
      FbjsEventName.offline,
      FbjsEventName.online,
      FbjsEventName.online,
      FbjsEventName.sent,
      FbjsEventName.publicBroadcast,
    ].map(e => expect(dev.on).toHaveBeenCalledWith(e, expect.any(Function)));
    expect(mockBot.readStatus).toHaveBeenCalledTimes(1);
    mockBot.on.mock.calls[1][1]();
    expect(mockBot.readStatus).toHaveBeenCalledTimes(2);
    [
      "message",
      "reconnect",
    ].map(e => {
      expect(dev.client?.on).toHaveBeenCalledWith(e, expect.any(Function));
    });
    expect(dev.readStatus).toHaveBeenCalled();
    expect(dev.client && dev.client.subscribe).toHaveBeenCalled();
    expect(startPinging).toHaveBeenCalledWith(dev);
  });
});
