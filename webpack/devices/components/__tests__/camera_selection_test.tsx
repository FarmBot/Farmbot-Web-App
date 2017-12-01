const mockDevice = {
  setUserEnv: jest.fn(() => { return Promise.resolve(); }),
};
jest.mock("../../../device", () => ({
  getDevice: () => (mockDevice)
}));
const mockInfo = jest.fn();
const mockError = jest.fn();
jest.mock("farmbot-toastr", () => ({ info: mockInfo, error: mockError }));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { CameraSelection } from "../camera_selection";

describe("<CameraSelection/>", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("doesn't render camera", () => {
    const cameraSelection = mount(<CameraSelection
      env={{}} />);
    expect(cameraSelection.find("button").text()).toEqual("None");
  });

  it("renders camera", () => {
    const cameraSelection = mount(<CameraSelection
      env={{ "camera": "\"RPI\"" }} />);
    expect(cameraSelection.find("button").text()).toEqual("Raspberry Pi Camera");
  });

  it("changes camera", () => {
    const cameraSelection = shallow(<CameraSelection env={{}} />);
    cameraSelection.find("FBSelect")
      .simulate("change", { label: "My Camera", value: "mycamera" });
    expect(mockInfo)
      .toHaveBeenCalledWith("Sending camera configuration...", "Sending");
    expect(mockDevice.setUserEnv)
      .toHaveBeenCalledWith({ camera: "\"mycamera\"" });
  });
});
