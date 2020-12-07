let mockPhotoOutcome = Promise.resolve();
const mockDevice = { takePhoto: jest.fn(() => mockPhotoOutcome) };
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

import React from "react";
import { mount } from "enzyme";
import { TakePhotoButtonProps } from "../interfaces";
import { TakePhotoButton } from "../take_photo_button";
import { Content, ToolTips } from "../../../constants";
import { error } from "../../../toast/toast";

describe("<TakePhotoButton />", () => {
  const fakeProps = (): TakePhotoButtonProps => ({
    env: {},
  });

  it("takes photo", () => {
    const jogButtons = mount(<TakePhotoButton {...fakeProps()} />);
    const cameraBtn = jogButtons.find("button").at(0);
    expect(cameraBtn.props().title).not.toEqual(Content.NO_CAMERA_SELECTED);
    cameraBtn.simulate("click");
    expect(mockDevice.takePhoto).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("error taking photo", () => {
    mockPhotoOutcome = Promise.reject();
    const jogButtons = mount(<TakePhotoButton {...fakeProps()} />);
    jogButtons.find("button").at(0).simulate("click");
    expect(mockDevice.takePhoto).toHaveBeenCalled();
  });

  it("shows camera as disabled", () => {
    const p = fakeProps();
    p.env = { camera: "NONE" };
    const jogButtons = mount(<TakePhotoButton {...p} />);
    const cameraBtn = jogButtons.find("button").at(0);
    expect(cameraBtn.props().title).toEqual(Content.NO_CAMERA_SELECTED);
    cameraBtn.simulate("click");
    expect(error).toHaveBeenCalledWith(
      ToolTips.SELECT_A_CAMERA, { title: Content.NO_CAMERA_SELECTED });
    expect(mockDevice.takePhoto).not.toHaveBeenCalled();
  });
});
