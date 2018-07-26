const mockDevice = {
  setUserEnv: jest.fn(() => Promise.resolve({})),
  execScript: jest.fn(() => Promise.resolve({}))
};
jest.mock("../../../device", () => {
  return {
    getDevice: () => (mockDevice)
  };
});
import { translateImageWorkspaceAndSave } from "../actions";
import { scanImage, test } from "../actions";

describe("actions", () => {
  it("Saves environment variables", () => {
    /** This test is just here to make sure that envSave() is actually
     * triggering side effects. */
    const translator = translateImageWorkspaceAndSave({
      "iteration": "WEED_DETECTOR_iteration",
      "morph": "WEED_DETECTOR_morph",
      "blur": "WEED_DETECTOR_blur",
      "H_HI": "WEED_DETECTOR_H_HI",
      "H_LO": "WEED_DETECTOR_H_LO",
      "S_HI": "WEED_DETECTOR_S_HI",
      "S_LO": "WEED_DETECTOR_S_LO",
      "V_HI": "WEED_DETECTOR_V_HI",
      "V_LO": "WEED_DETECTOR_V_LO"
    });
    translator("H_HI", 45);
    expect(mockDevice.setUserEnv)
      .toHaveBeenLastCalledWith({ "WEED_DETECTOR_H_HI": "45" });
  });
});

describe("scanImage()", () => {
  it("calls out to the device", () => {
    // Run function to invoke side effects
    const thunk = scanImage(5);
    thunk();
    // Ensure the side effects were the ones we expected.
    expect(mockDevice.execScript)
      .toHaveBeenCalledWith("historical-plant-detection", [{
        args: { label: "PLANT_DETECTION_selected_image", value: "5" },
        kind: "pair"
      }]);
  });
});

describe("test()", () => {
  it("calls out to the device", () => {
    // Run function to invoke side effects
    const thunk = test();
    thunk();
    // Ensure the side effects were the ones we expected.
    expect(mockDevice.execScript)
      .toHaveBeenCalledWith("plant-detection");
  });
});
