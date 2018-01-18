jest.mock("../connect_device", () => {
  return { changeLastClientConnected: jest.fn() };
});
import { generateRefreshTrigger, PartialState } from "../generate_refresh_trigger";
import { Farmbot } from "farmbot";
import { ConnectionStatus } from "../interfaces";
import { changeLastClientConnected } from "../connect_device";
import * as _ from "lodash";

describe("generateRefreshTrigger()", () => {
  const UP: ConnectionStatus = { state: "up", at: "---" };
  const DOWN: ConnectionStatus = { state: "down", at: "---" };

  function fakeState(next: ConnectionStatus | undefined): PartialState {
    return { bot: { connectivity: { ["bot.mqtt"]: next } } };
  }

  it("throttles the first 10 calls", () => {
    const device: Partial<Farmbot> = {
      readStatus: jest.fn(() => Promise.resolve())
    };
    const trigger = generateRefreshTrigger();
    const go =
      (x: ConnectionStatus | undefined) => trigger(device as Farmbot, fakeState(x));
    _.times(5, () => {
      go(UP);
      go(DOWN);
    });
    expect(changeLastClientConnected).not.toHaveBeenCalled();
    go(UP);
    expect(changeLastClientConnected).toHaveBeenCalled();
  });
});
