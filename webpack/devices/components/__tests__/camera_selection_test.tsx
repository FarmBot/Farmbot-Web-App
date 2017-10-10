jest.mock("../../../device", () => ({
  devices: {
    current: {
      setUserEnv: jest.fn(() => { return Promise.resolve(); }),
    }
  }
}));
const mockInfo = jest.fn();
const mockError = jest.fn();
jest.mock("farmbot-toastr", () => ({ info: mockInfo, error: mockError }));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { getDevice } from "../../../device";
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
    const { mock } = getDevice().setUserEnv as jest.Mock<{}>;
    const cameraSelection = shallow(<CameraSelection
      env={{}} />);
    cameraSelection.find("FBSelect")
      .simulate("change", { label: "My Camera", value: "mycamera" });
    expect(mockInfo.mock.calls[0][0]).toEqual("Sending camera configuration...");
    expect(mock.calls[0][0]).toEqual({ "camera": "\"mycamera\"" });
  });
});
