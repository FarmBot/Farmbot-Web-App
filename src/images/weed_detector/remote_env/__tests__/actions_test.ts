jest.mock("../../../../device", () => {
  return {
    devices: {
      current: {
        setUserEnv: jest.fn()
      }
    }
  };
})
import { envSave } from "../actions";
import { devices } from "../../../../device";

describe("actions", () => {
  it("Saves environment variables", () => {
    /** This test is just here to make sure that envSave() is actually
     * triggering side effects. */
    jest.clearAllMocks();
    envSave("CAMERA_CALIBRATION_blur", 24);
    expect(devices.current.setUserEnv).toHaveBeenCalledTimes(1);
    expect(devices.current.setUserEnv)
      .toHaveBeenLastCalledWith({ "CAMERA_CALIBRATION_blur": "24" });
  });
});
