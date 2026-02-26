import * as dataConsistency from "../../connectivity/data_consistency";
import { maybeStartTracking } from "../maybe_start_tracking";

describe("maybeStartTracking()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts tracking", () => {
    const startTrackingSpy = jest.spyOn(dataConsistency, "startTracking")
      .mockImplementation(jest.fn());
    const uuid = "Device.0.0";
    maybeStartTracking(uuid);
    expect(startTrackingSpy).toHaveBeenCalledWith(uuid);
  });

  it("doesn't start tracking", () => {
    const startTrackingSpy = jest.spyOn(dataConsistency, "startTracking")
      .mockImplementation(jest.fn());
    const uuid = "User.0.0";
    maybeStartTracking(uuid);
    expect(startTrackingSpy).not.toHaveBeenCalled();
  });
});
