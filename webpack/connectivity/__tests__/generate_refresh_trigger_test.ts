import { generateRefreshTrigger, PartialState } from "../generate_refresh_trigger";
import { Farmbot } from "farmbot";
import { ConnectionStatus } from "../interfaces";

describe("generateRefreshTrigger()", () => {
  const UP: ConnectionStatus = { state: "up", at: "---" };
  const DOWN: ConnectionStatus = { state: "down", at: "---" };

  function fakeState(next: ConnectionStatus | undefined): PartialState {
    return { bot: { connectivity: { ["bot.mqtt"]: next } } };
  }

  it("throttles the first 5 calls", () => {
    const device: Partial<Farmbot> = {
      readStatus: jest.fn(() => Promise.resolve())
    };
    const trigger = generateRefreshTrigger();
    const go =
      (x: ConnectionStatus | undefined) => trigger(device as Farmbot, fakeState(x));
    go(UP);
    go(DOWN);
    go(UP);
    go(DOWN);
    go(UP);
    expect(device.readStatus).not.toHaveBeenCalled();
    go(UP);
    expect(device.readStatus).toHaveBeenCalled();
  });
});
