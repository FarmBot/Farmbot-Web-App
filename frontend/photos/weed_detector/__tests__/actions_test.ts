const mockDevice = { execScript: jest.fn((..._) => Promise.resolve({})) };
import * as deviceModule from "../../../device";

import { scanImage, detectPlants } from "../actions";
import { error } from "../../../toast/toast";
import * as photoActions from "../../actions";

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(deviceModule, "getDevice")
    .mockImplementation(() => mockDevice as never);
  mockDevice.execScript = jest.fn((..._) => Promise.resolve({}));
});


describe("scanImage()", () => {
  it("executes with selected image id", () => {
    scanImage(1)(5);
    expect(mockDevice.execScript)
      .toHaveBeenCalledWith("historical-plant-detection", [{
        args: { label: "PLANT_DETECTION_selected_image", value: "5" },
        kind: "pair"
      }]);
    expect(error).not.toHaveBeenCalled();
  });

  it("handles error", async () => {
    mockDevice.execScript = jest.fn(() => Promise.reject());
    await scanImage(1)(5);
    expect(mockDevice.execScript).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("errors without calibration", () => {
    scanImage(0)(5);
    expect(mockDevice.execScript).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Calibrate camera first");
  });
});

describe("detectPlants()", () => {
  it("executes", () => {
    const detectWeeds = jest.spyOn(photoActions, "detectWeeds")
      .mockImplementation(jest.fn());
    detectPlants(1)();
    expect(detectWeeds).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    detectWeeds.mockRestore();
  });

  it("executes for demo accounts without prior calibration", () => {
    localStorage.setItem("myBotIs", "online");
    const detectWeeds = jest.spyOn(photoActions, "detectWeeds")
      .mockImplementation(jest.fn());
    detectPlants(0)();
    expect(detectWeeds).toHaveBeenCalled();
    detectWeeds.mockRestore();
    localStorage.removeItem("myBotIs");
  });

  it("does not execute", () => {
    detectPlants(0)();
    expect(mockDevice.execScript).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Calibrate camera first");
  });
});
