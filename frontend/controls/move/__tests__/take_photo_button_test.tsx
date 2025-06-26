let mockPhotoOutcome = Promise.resolve();
const mockDevice = { takePhoto: jest.fn(() => mockPhotoOutcome) };
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

import React from "react";
import { mount } from "enzyme";
import { TakePhotoButtonProps } from "../interfaces";
import { TakePhotoButton } from "../take_photo_button";
import { Content, ToolTips } from "../../../constants";
import { error } from "../../../toast/toast";
import { fakePercentJob } from "../../../__test_support__/fake_bot_data";
import { fakeLog } from "../../../__test_support__/fake_state/resources";

describe("<TakePhotoButton />", () => {
  const fakeProps = (): TakePhotoButtonProps => ({
    env: {},
    botOnline: true,
    imageJobs: [],
    logs: [],
  });

  it("takes photo", () => {
    jest.useFakeTimers();
    const jogButtons = mount(<TakePhotoButton {...fakeProps()} />);
    const cameraBtn = jogButtons.find("button").at(0);
    expect(cameraBtn.props().title).not.toEqual(Content.NO_CAMERA_SELECTED);
    cameraBtn.simulate("click");
    jest.runAllTimers();
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

  it("shows as offline", () => {
    const p = fakeProps();
    p.botOnline = false;
    const jogButtons = mount(<TakePhotoButton {...p} />);
    expect(jogButtons.html()).toContain("bp6-popover-target");
  });

  it("shows as taken", () => {
    const p = fakeProps();
    const job = fakePercentJob();
    const now = new Date().getTime() / 1000;
    job.updated_at = now + 5;
    p.imageJobs = [job];
    const log = fakeLog();
    log.body.created_at = now + 5;
    log.body.message = "Taking photo";
    p.logs = [log];
    const jogButtons = mount(<TakePhotoButton {...p} />);
    const cameraBtn = jogButtons.find("button").at(0);
    cameraBtn.simulate("click");
    expect(cameraBtn.text()).toEqual("100%");
  });
});
