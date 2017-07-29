jest.mock("../../device", () => ({
  devices: {
    current: {
      togglePin: jest.fn(() => { return Promise.resolve(); })
    }
  }
}));

import { pinToggle } from "../actions";
import { devices } from "../../device";

describe("pinToggle()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("toggles a pin", () => {
    let { mock } = devices.current.togglePin as jest.Mock<{}>;
    let toggle = pinToggle(5);
    expect(mock.calls.length).toEqual(1);
    let argList = mock.calls[0];
    expect(argList[0].pin_number).toEqual(5);
  });
});
