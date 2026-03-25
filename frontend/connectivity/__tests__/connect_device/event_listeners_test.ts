const mockBot = {
  client: {
    subscribe: jest.fn(),
    on: jest.fn(),
  },
  on: jest.fn(),
  readStatus: jest.fn(() => Promise.resolve()),
  setUserEnv: () => Promise.resolve(),
};

import { FbjsEventName } from "farmbot/dist/constants";
import { attachEventListeners } from "../../connect_device";
import * as pingMqtt from "../../ping_mqtt";
import * as deviceActions from "../../../devices/actions";

describe("attachEventListeners", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(pingMqtt, "startPinging").mockImplementation(jest.fn());
    jest.spyOn(deviceActions, "readStatusReturnPromise")
      .mockImplementation(() => Promise.resolve());
  });

  it("attaches relevant callbacks", () => {
    const dev = mockBot as unknown as import("farmbot").Farmbot;
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
    expect(deviceActions.readStatusReturnPromise).toHaveBeenCalledTimes(1);
    mockBot.on.mock.calls[1][1]();
    expect(mockBot.readStatus).toHaveBeenCalledTimes(1);
    [
      "message",
      "reconnect",
    ].map(e => {
      expect(dev.client?.on).toHaveBeenCalledWith(e, expect.any(Function));
    });
    expect(dev.readStatus).toHaveBeenCalled();
    expect(dev.client && dev.client.subscribe).toHaveBeenCalled();
    expect(pingMqtt.startPinging).toHaveBeenCalledWith(dev);
  });
});
