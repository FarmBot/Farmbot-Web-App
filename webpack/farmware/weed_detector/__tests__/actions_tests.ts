jest.mock("../../../device", () => {
  return {
    devices: {
      current: {
        setUserEnv: jest.fn(),
        execScript: jest.fn()
      }
    }
  };
});
import { devices } from "../../../device";
import { translateImageWorkspaceAndSave } from "../actions";
import { scanImage, test } from "../actions";

describe("actions", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });
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
    expect(devices.current.setUserEnv).toHaveBeenCalledTimes(1);
    expect(devices.current.setUserEnv)
      .toHaveBeenLastCalledWith({ "WEED_DETECTOR_H_HI": "45" });
  });
});

describe("scanImage()", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });
  it("calls out to the device", () => {
    const { mock } = devices.current.execScript as jest.Mock<{}>;
    // Run function to invoke side effects
    const thunk = scanImage(5);
    thunk();
    // Ensure the side effects were the ones we expected.
    expect(mock.calls.length).toEqual(1);
    const argList = mock.calls[0];
    expect(argList[0]).toEqual("historical-plant-detection");
    expect(argList[1]).toBeInstanceOf(Array);
    expect(argList[1][0].kind).toBe("pair");
    expect(argList[1][0].args).toBeInstanceOf(Object);
    expect(argList[1][0].args.value).toBe("5");
    expect(argList[1][0].args.label).toBe("PLANT_DETECTION_selected_image");
  });
});

describe("test()", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });
  it("calls out to the device", () => {
    const { mock } = devices.current.execScript as jest.Mock<{}>;
    // Run function to invoke side effects
    const thunk = test();
    thunk();
    // Ensure the side effects were the ones we expected.
    expect(mock.calls.length).toEqual(1);
    const argList = mock.calls[0];
    expect(argList[0]).toEqual("plant-detection");
    expect(argList[1]).toBeUndefined();
  });
});
