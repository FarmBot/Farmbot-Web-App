const mockDevice = {
  execScript: jest.fn(() => Promise.resolve({}))
};
jest.mock("../../../device", () => ({
  getDevice: () => (mockDevice)
}));

import { calibrate, scanImage } from "../actions";

describe("scanImage()", () => {
  it("calls out to the device", () => {
    // Run function to invoke side effects
    const thunk = scanImage(4);
    thunk();
    // Ensure the side effects were the ones we expected.
    expect(mockDevice.execScript)
      .toHaveBeenCalledWith("historical-camera-calibration", [{
        args: { label: "CAMERA_CALIBRATION_selected_image", value: "4" },
        kind: "pair"
      }]);
  });
});

describe("calibrate()", () => {
  it("calls out to the device", () => {
    // Run function to invoke side effects
    const thunk = calibrate();
    thunk();
    // Ensure the side effects were the ones we expected.
    expect(mockDevice.execScript).toHaveBeenCalledWith("camera-calibration");
  });
});
