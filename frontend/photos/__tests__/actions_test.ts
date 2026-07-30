import * as deviceActions from "../../devices/actions";
import {
  calibrateCamera, detectWeeds, measureSoilHeight,
} from "../actions";

describe("camera operations", () => {
  it.each([
    [calibrateCamera, "calibrate_camera()"],
    [detectWeeds, "detect_weeds()"],
    [measureSoilHeight, "measure_soil_height()"],
  ])("runs the operation", (operation, lua) => {
    const sendRPC = jest.spyOn(deviceActions, "sendRPC")
      .mockImplementation(jest.fn());
    operation();
    expect(sendRPC).toHaveBeenCalledWith({ kind: "lua", args: { lua } });
    sendRPC.mockRestore();
  });
});
