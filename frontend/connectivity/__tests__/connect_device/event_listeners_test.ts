const on = jest.fn((_e: string, _cb: unknown) => undefined);
const stub = () => Promise.resolve();
const mockBot = {
  client: {
    subscribe: jest.fn(),
    on
  },
  on,
  readStatus: jest.fn(stub),
  setUserEnv: stub,
};

jest.mock("../../../device", () => { return { getDevice: () => mockBot }; });
jest.mock("../../ping_mqtt", () => { return { startPinging: jest.fn() }; });

import { getDevice } from "../../../device";
import { attachEventListeners, BROADCAST_CHANNEL } from "../../connect_device";
import { startPinging } from "../../ping_mqtt";

describe("attachEventListeners", () => {
  it("attaches relevant callbacks", () => {
    const dev = getDevice();
    attachEventListeners(dev, jest.fn(), jest.fn());
    [
      "legacy_status",
      "logs",
      "malformed",
      "offline",
      "online",
      "online",
      "sent",
      "status_v8",
      BROADCAST_CHANNEL,
    ].map(e => expect(dev.on).toHaveBeenCalledWith(e, expect.any(Function)));
    [
      "message",
      "reconnect"
    ].map(e => {
      if (dev.client) {
        expect(dev.client.on).toHaveBeenCalledWith(e, expect.any(Function));
      } else {
        fail("Bad mock");
      }
    });
    expect(dev.readStatus).toHaveBeenCalled();
    expect(dev.client && dev.client.subscribe).toHaveBeenCalled();
    expect(startPinging).toHaveBeenCalledWith(dev);
  });
});
