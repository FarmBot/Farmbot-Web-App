const mockDevice = { takePhoto: jest.fn(() => Promise.resolve({})) };
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

jest.mock("../../../api/crud", () => ({ destroy: jest.fn() }));

jest.mock("../actions", () => ({ selectImage: jest.fn() }));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { Photos } from "../photos";
import { JobProgress } from "farmbot";
import { fakeImages } from "../../../__test_support__/fake_state/images";
import { destroy } from "../../../api/crud";
import { clickButton } from "../../../__test_support__/helpers";
import { PhotosProps } from "../interfaces";
import { success, error } from "farmbot-toastr";
import { selectImage } from "../actions";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";

describe("<Photos/>", () => {
  const fakeProps = (): PhotosProps => ({
    images: [],
    currentImage: undefined,
    dispatch: jest.fn(),
    timeSettings: fakeTimeSettings(),
    imageJobs: [],
    botToMqttStatus: "up",
    syncStatus: "synced",
  });

  it("shows photo", () => {
    const p = fakeProps();
    const images = fakeImages;
    p.currentImage = images[1];
    const wrapper = mount(<Photos {...p} />);
    expect(wrapper.text()).toContain("Created At:June 1st, 2017");
    expect(wrapper.text()).toContain("X:632Y:347Z:164");
  });

  it("no photos", () => {
    const wrapper = mount(<Photos {...fakeProps()} />);
    expect(wrapper.text()).toContain("Image:No meta data.");
  });

  it("takes photo", async () => {
    const wrapper = mount(<Photos {...fakeProps()} />);
    await clickButton(wrapper, 0, "take photo");
    expect(mockDevice.takePhoto).toHaveBeenCalled();
    await expect(success).toHaveBeenCalled();
  });

  it("fails to take photo", async () => {
    mockDevice.takePhoto = jest.fn(() => Promise.reject());
    const wrapper = mount(<Photos {...fakeProps()} />);
    await clickButton(wrapper, 0, "take photo");
    expect(mockDevice.takePhoto).toHaveBeenCalled();
    await expect(error).toHaveBeenCalled();
  });

  it("deletes photo", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve());
    const images = fakeImages;
    p.currentImage = images[1];
    const wrapper = mount(<Photos {...p} />);
    await clickButton(wrapper, 1, "delete photo");
    expect(destroy).toHaveBeenCalledWith(p.currentImage.uuid);
    await expect(success).toHaveBeenCalled();
  });

  it("fails to delete photo", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.reject("error"));
    const images = fakeImages;
    p.currentImage = images[1];
    const wrapper = mount(<Photos {...p} />);
    await clickButton(wrapper, 1, "delete photo");
    await expect(destroy).toHaveBeenCalledWith(p.currentImage.uuid);
    await expect(error).toHaveBeenCalled();
  });

  it("deletes most recent photo", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve());
    p.images = fakeImages;
    const wrapper = mount(<Photos {...p} />);
    await clickButton(wrapper, 1, "delete photo");
    expect(destroy).toHaveBeenCalledWith(p.images[0].uuid);
    await expect(success).toHaveBeenCalled();
  });

  it("no photos to delete", () => {
    const wrapper = mount(<Photos {...fakeProps()} />);
    clickButton(wrapper, 1, "delete photo");
    expect(destroy).not.toHaveBeenCalledWith();
  });

  it("shows image download progress", () => {
    const p = fakeProps();
    p.imageJobs = [{
      status: "working",
      percent: 15,
      unit: "percent",
      time: "2018-11-15 19:13:21.167440Z"
    } as JobProgress];
    const wrapper = mount(<Photos {...p} />);
    expect(wrapper.text()).toContain("uploading photo...15%");
  });

  it("doesn't show image download progress", () => {
    const p = fakeProps();
    p.imageJobs = [{
      status: "complete",
      percent: 15,
      unit: "percent",
      time: "2018-11-15 19:13:21.167440Z"
    } as JobProgress];
    const wrapper = mount(<Photos {...p} />);
    expect(wrapper.text()).not.toContain("uploading");
  });

  it("can't find meta field data", () => {
    const p = fakeProps();
    p.images = fakeImages;
    p.images[0].body.meta.x = undefined;
    p.currentImage = p.images[0];
    const wrapper = mount(<Photos {...p} />);
    expect(wrapper.text()).toContain("X:unknown");
  });

  it("flips photo", () => {
    const p = fakeProps();
    p.images = fakeImages;
    const wrapper = shallow(<Photos {...p} />);
    wrapper.find("ImageFlipper").simulate("flip", 1);
    expect(selectImage).toHaveBeenCalledWith(1);
  });
});
