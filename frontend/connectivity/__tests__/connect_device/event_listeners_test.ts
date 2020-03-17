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
import { FbjsEventName } from "farmbot/dist/constants";
import { attachEventListeners } from "../../connect_device";
import { startPinging } from "../../ping_mqtt";

describe("attachEventListeners", () => {
  it("attaches relevant callbacks", () => {
    const dev = getDevice();
    attachEventListeners(dev, jest.fn(), jest.fn());
    [
      FbjsEventName.legacy_status,
      FbjsEventName.logs,
      FbjsEventName.malformed,
      FbjsEventName.offline,
      FbjsEventName.online,
      FbjsEventName.online,
      FbjsEventName.sent,
      FbjsEventName.upsert,
      FbjsEventName.publicBroadcast,
    ].map(e => expect(dev.on).toHaveBeenCalledWith(e, expect.any(Function)));
    [
      "message",
      "reconnect",
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
