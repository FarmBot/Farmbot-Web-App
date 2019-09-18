jest.mock("../../../connectivity", () => {
  return {
    pingNO: jest.fn(),
    dispatchQosStart: jest.fn()
  };
});
import { sendOutboundPing } from "../../../connectivity/ping_mqtt";
import { DeepPartial } from "redux";
import { Farmbot } from "farmbot";
import { pingNO } from "../../../connectivity";

describe("sendOutboundPing()", () => {
  it("handles failure", (done) => {
    const fakeBot: DeepPartial<Farmbot> = {
      ping: jest.fn(() => Promise.reject())
    };
    expect(pingNO).not.toHaveBeenCalled();
    sendOutboundPing(fakeBot as Farmbot).then(fail, () => {
      expect(pingNO).toHaveBeenCalled();
      done();
    });
  });
});
