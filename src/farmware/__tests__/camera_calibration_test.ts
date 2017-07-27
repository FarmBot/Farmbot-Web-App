jest.mock("../../device", () => ({
  devices: {
    current: {
      execScript: jest.fn() // jest.fn() will capture all calls to itself.
    }
  }
}));

import { scanImage } from "../../images/actions";
import { devices } from "../../device";

describe("scanImage()", () => {
  it("calls out to the device", () => {
    let { mock } = devices.current.execScript as jest.Mock<{}>;
    // Run function to invoke side effects
    let thunk = scanImage(5);
    thunk();
    // Ensure the side effects were the ones we expected.
    expect(mock.calls.length).toEqual(1);
    let argList = mock.calls[0];
    expect(argList[0]).toEqual("historical-plant-detection");
    expect(argList[1]).toBeInstanceOf(Array);
    expect(argList[1][0].kind).toBe("pair");
    expect(argList[1][0].args).toBeInstanceOf(Object);
    expect(argList[1][0].args.value).toBe("5");
    expect(argList[1][0].args.label).toBe("PLANT_DETECTION_selected_image");
  });
});
