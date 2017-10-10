const mockDevice = {
  execScript: jest.fn()
};
jest.mock("../../../device", () => ({
  getDevice: () => (mockDevice)
}));

import { calibrate, scanImage } from "../actions";
import { getDevice } from "../../../device";

describe("scanImage()", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });
  it("calls out to the device", () => {
    const { mock } = getDevice().execScript as jest.Mock<{}>;
    // Run function to invoke side effects
    const thunk = scanImage(4);
    thunk();
    // Ensure the side effects were the ones we expected.
    expect(mock.calls.length).toEqual(1);
    const argList = mock.calls[0];
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
    const { mock } = getDevice().execScript as jest.Mock<{}>;
    // Run function to invoke side effects
    const thunk = calibrate();
    thunk();
    // Ensure the side effects were the ones we expected.
    expect(mock.calls.length).toEqual(1);
    const argList = mock.calls[0];
    expect(argList[0]).toEqual("camera-calibration");
    expect(argList[1]).toBeUndefined();
  });
});
