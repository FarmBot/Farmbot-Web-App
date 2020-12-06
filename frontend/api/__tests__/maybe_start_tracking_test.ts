jest.mock("../../connectivity/data_consistency", () => ({
  startTracking: jest.fn(),
}));

import { maybeStartTracking } from "../maybe_start_tracking";
import { startTracking } from "../../connectivity/data_consistency";

describe("maybeStartTracking()", () => {
  it("starts tracking", () => {
    const uuid = "Device.0.0";
    maybeStartTracking(uuid);
    expect(startTracking).toHaveBeenCalledWith(uuid);
  });

  it("doesn't start tracking", () => {
    const uuid = "User.0.0";
    maybeStartTracking(uuid);
    expect(startTracking).not.toHaveBeenCalled();
  });
});
