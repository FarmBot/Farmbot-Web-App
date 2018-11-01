const mockDevice = {
  setUserEnv: jest.fn(() => { return Promise.resolve(); }),
};
jest.mock("../../../../device", () => ({
  getDevice: () => mockDevice
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { CameraSelection } from "../camera_selection";
import { CameraSelectionProps } from "../interfaces";
import { info, error } from "farmbot-toastr";

describe("<CameraSelection/>", () => {
  const fakeProps = (): CameraSelectionProps => {
    return {
      env: {},
      botOnline: true,
      shouldDisplay: () => false,
      saveFarmwareEnv: jest.fn(),
      dispatch: jest.fn(),
    };
  };

  it("doesn't render camera", () => {
    const cameraSelection = mount(<CameraSelection {...fakeProps()} />);
    expect(cameraSelection.find("button").text()).toEqual("USB Camera");
  });

  it("renders camera", () => {
    const p = fakeProps();
    p.env = { "camera": "\"RPI\"" };
    const cameraSelection = mount(<CameraSelection {...p} />);
    expect(cameraSelection.find("button").text()).toEqual("Raspberry Pi Camera");
  });

  it("changes camera", () => {
    const cameraSelection = shallow(<CameraSelection {...fakeProps()} />);
    cameraSelection.find("FBSelect")
      .simulate("change", { label: "My Camera", value: "mycamera" });
    expect(info)
      .toHaveBeenCalledWith("Sending camera configuration...", "Sending");
    expect(mockDevice.setUserEnv)
      .toHaveBeenCalledWith({ camera: "\"mycamera\"" });
  });

  it("handles error changing camera", async () => {
    mockDevice.setUserEnv = jest.fn(() => { return Promise.reject(); });
    const cameraSelection = shallow(<CameraSelection {...fakeProps()} />);
    await cameraSelection.find("FBSelect")
      .simulate("change", { label: "My Camera", value: "mycamera" });
    await expect(info)
      .toHaveBeenCalledWith("Sending camera configuration...", "Sending");
    expect(error)
      .toHaveBeenCalledWith("An error occurred during configuration.");
  });

  it("stores config in API", () => {
    const p = fakeProps();
    p.shouldDisplay = () => true;
    const wrapper = shallow(<CameraSelection {...p} />);
    wrapper.find("FBSelect")
      .simulate("change", { label: "My Camera", value: "mycamera" });
    expect(info)
      .toHaveBeenCalledWith("Sending camera configuration...", "Sending");
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("camera", "\"mycamera\"");
  });
});
