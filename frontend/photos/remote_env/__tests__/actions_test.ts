const mockDevice = { setUserEnv: jest.fn(() => Promise.resolve()) };
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

import { envSave } from "../actions";
import { getDevice } from "../../../device";

describe("envSave()", () => {
  it("saves environment variables", () => {
    envSave("CAMERA_CALIBRATION_blur", 24);
    expect(getDevice().setUserEnv).toHaveBeenCalledTimes(1);
    expect(getDevice().setUserEnv)
      .toHaveBeenLastCalledWith({ "CAMERA_CALIBRATION_blur": "24" });
  });

  it("handles error", async () => {
    mockDevice.setUserEnv = jest.fn(() => Promise.reject());
    await envSave("CAMERA_CALIBRATION_blur", 24);
    expect(getDevice().setUserEnv).toHaveBeenCalledTimes(1);
    expect(getDevice().setUserEnv)
      .toHaveBeenLastCalledWith({ "CAMERA_CALIBRATION_blur": "24" });
  });
});
