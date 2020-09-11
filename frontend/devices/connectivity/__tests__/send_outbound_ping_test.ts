jest.mock("../../../connectivity", () => ({
  pingNO: jest.fn(),
  dispatchQosStart: jest.fn(),
}));
import { sendOutboundPing } from "../../../connectivity/ping_mqtt";
import { DeepPartial } from "redux";
import { Farmbot } from "farmbot";
import { pingNO } from "../../../connectivity";

describe("sendOutboundPing()", () => {
  it("handles failure", async () => {
    const fakeBot: DeepPartial<Farmbot> = {
      ping: jest.fn(() => Promise.reject())
    };
    expect(pingNO).not.toHaveBeenCalled();
    await expect(sendOutboundPing(fakeBot as Farmbot)).rejects
      .toThrowError(/sendOutboundPing failed/);
    expect(pingNO).toHaveBeenCalled();
  });
});
