const mockDevice = {
  setUserEnv: jest.fn(() => Promise.resolve({})),
  execScript: jest.fn(() => Promise.resolve({})),
};
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

import { scanImage, detectPlants } from "../actions";
import { error } from "../../../toast/toast";

describe("scanImage()", () => {
  it("calls out to the device", () => {
    scanImage(5);
    expect(mockDevice.execScript)
      .toHaveBeenCalledWith("historical-plant-detection", [{
        args: { label: "PLANT_DETECTION_selected_image", value: "5" },
        kind: "pair"
      }]);
  });
});

describe("detectPlants()", () => {
  it("executes", () => {
    detectPlants(1)();
    expect(mockDevice.execScript).toHaveBeenCalledWith("plant-detection");
    expect(error).not.toHaveBeenCalled();
  });

  it("does not execute", () => {
    detectPlants(0)();
    expect(mockDevice.execScript).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Calibrate camera first");
  });
});
