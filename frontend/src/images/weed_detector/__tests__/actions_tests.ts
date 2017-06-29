jest.mock("../../../device", () => {
  return {
    devices: {
      current: {
        setUserEnv: jest.fn()
      }
    }
  };
})
import { devices } from "../../../device";
import { translateImageWorkspaceAndSave } from "../actions";

describe("actions", () => {
  it("Saves environment variables", () => {
    /** This test is just here to make sure that envSave() is actually
     * triggering side effects. */
    jest.clearAllMocks();
    let translator = translateImageWorkspaceAndSave({
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
    expect(devices.current.setUserEnv).toHaveBeenCalledTimes(1);
    expect(devices.current.setUserEnv)
      .toHaveBeenLastCalledWith({ "WEED_DETECTOR_H_HI": "45" });
  });
});
