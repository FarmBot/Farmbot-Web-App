const mockDevice = { execScript: jest.fn((..._) => Promise.resolve({})) };
import * as deviceModule from "../../../device";
import * as photoActions from "../../actions";

import { calibrate, scanImage } from "../actions";

let getDeviceSpy: jest.SpyInstance;

beforeEach(() => {
  getDeviceSpy = jest.spyOn(deviceModule, "getDevice")
    .mockImplementation(() => mockDevice as never);
});

afterEach(() => {
  getDeviceSpy.mockRestore();
});
describe("scanImage()", () => {
  it.each<[boolean, string]>([
    [true, "\"TRUE\""],
    [false, "\"FALSE\""],
  ])("calls out to the device, use grid: %s", (grid, value) => {
    scanImage(grid)(4);
    expect(mockDevice.execScript)
      .toHaveBeenCalledWith("historical-camera-calibration", [
        {
          args: { label: "CAMERA_CALIBRATION_selected_image", value: "4" },
          kind: "pair"
        },
        {
          args: { label: "CAMERA_CALIBRATION_easy_calibration", value },
          kind: "pair"
        },
      ]);
  });
});

describe("calibrate()", () => {
  it("runs camera calibration", () => {
    const calibrateCamera = jest.spyOn(photoActions, "calibrateCamera")
      .mockImplementation(jest.fn());
    calibrate(true)();
    expect(calibrateCamera).toHaveBeenCalled();
    calibrateCamera.mockRestore();
  });
});
