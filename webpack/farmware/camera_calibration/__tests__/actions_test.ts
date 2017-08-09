jest.mock("../../../device", () => ({
  devices: {
    current: {
      execScript: jest.fn() // jest.fn() will capture all calls to itself.
    }
  }
}));

import { calibrate, scanImage } from "../actions";
import { devices } from "../../../device";

describe("scanImage()", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });
  it("calls out to the device", () => {
    let { mock } = devices.current.execScript as jest.Mock<{}>;
    // Run function to invoke side effects
    let thunk = scanImage(4);
    thunk();
    // Ensure the side effects were the ones we expected.
    expect(mock.calls.length).toEqual(1);
    let argList = mock.calls[0];
    expect(argList[0]).toEqual("historical-camera-calibration");
    expect(argList[1]).toBeInstanceOf(Array);
    expect(argList[1][0].kind).toBe("pair");
    expect(argList[1][0].args).toBeInstanceOf(Object);
    expect(argList[1][0].args.value).toBe("4");
    expect(argList[1][0].args.label).toBe("CAMERA_CALIBRATION_selected_image");
  });
});

describe("calibrate()", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });
  it("calls out to the device", () => {
    let { mock } = devices.current.execScript as jest.Mock<{}>;
    // Run function to invoke side effects
    let thunk = calibrate();
    thunk();
    // Ensure the side effects were the ones we expected.
    expect(mock.calls.length).toEqual(1);
    let argList = mock.calls[0];
    expect(argList[0]).toEqual("camera-calibration");
    expect(argList[1]).toBeUndefined();
  });
});
