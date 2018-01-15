import { generateRefreshTrigger, PartialState } from "../generate_refresh_trigger";
import { Farmbot } from "farmbot";
import { ConnectionStatus } from "../interfaces";
import { times } from "lodash";

describe("generateRefreshTrigger()", () => {
  const UP: ConnectionStatus = { state: "up", at: "---" };
  const DOWN: ConnectionStatus = { state: "down", at: "---" };

  function fakeState(next: ConnectionStatus | undefined): PartialState {
    return { bot: { connectivity: { ["bot.mqtt"]: next } } };
  }

  it("creates a function that triggers a refresh", () => {
    const device: Partial<Farmbot> = {
      readStatus: jest.fn(() => Promise.resolve())
    };
    const trigger = generateRefreshTrigger();
    times(2, () => {
      trigger(device as Farmbot, fakeState(UP));
      trigger(device as Farmbot, fakeState(DOWN));
    });
    expect(device.readStatus).not.toHaveBeenCalled();
    trigger(device as Farmbot, fakeState(UP));
    expect(device.readStatus).toHaveBeenCalled();
  });
});
