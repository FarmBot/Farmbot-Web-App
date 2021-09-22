const mockDevice = { takePhoto: jest.fn(() => Promise.resolve({})) };
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

jest.mock("../../../history", () => ({ push: jest.fn() }));

jest.mock("../../../api/crud", () => ({ destroy: jest.fn() }));

import React from "react";
import { mount, shallow } from "enzyme";
import { Photos, PhotoFooter, MoveToLocation } from "../photos";
import { JobProgress } from "farmbot";
import { fakeImages } from "../../../__test_support__/fake_state/images";
import { destroy } from "../../../api/crud";
import { clickButton } from "../../../__test_support__/helpers";
import { PhotosProps, PhotoFooterProps, MoveToLocationProps } from "../interfaces";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { success, error } from "../../../toast/toast";
import { Content, ToolTips, Actions } from "../../../constants";
import {
  fakeImage, fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";
import { fakeImageShowFlags } from "../../../__test_support__/fake_camera_data";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import { push } from "../../../history";
import { locationUrl } from "../../../farm_designer/move_to";
import { fakeDesignerState } from "../../../__test_support__/fake_designer_state";

describe("<Photos />", () => {
  const fakeProps = (): PhotosProps => ({
    images: [],
    currentImage: undefined,
    currentImageSize: { width: undefined, height: undefined },
    flags: fakeImageShowFlags(),
    dispatch: mockDispatch(),
    timeSettings: fakeTimeSettings(),
    imageJobs: [],
    botToMqttStatus: "up",
    syncStatus: "synced",
    env: {},
    designer: fakeDesignerState(),
    getConfigValue: jest.fn(),
  });

  it("shows photo", () => {
    const p = fakeProps();
    const config = fakeWebAppConfig();
    config.body.show_images = true;
    config.body.photo_filter_begin = "";
    config.body.photo_filter_end = "";
    p.getConfigValue = jest.fn(key => config.body[key]);
    const images = fakeImages;
    p.currentImage = images[1];
    const wrapper = mount(<Photos {...p} />);
    expect(wrapper.text()).toContain("June 1st, 2017");
    expect(wrapper.text()).toContain("X:632Y:347Z:164");
    expect(wrapper.find(".fa-eye.green").length).toEqual(1);
  });

  it("shows photo not in map", () => {
    const p = fakeProps();
    const images = fakeImages;
    p.currentImage = images[1];
    p.currentImage.body.meta.z = 100;
    p.env["CAMERA_CALIBRATION_camera_z"] = "0";
    p.flags.zMatch = false;
    const wrapper = mount(<Photos {...p} />);
    expect(wrapper.text()).toContain("June 1st, 2017");
    expect(wrapper.text()).toContain("X:632Y:347Z:100");
    expect(wrapper.find(".fa-eye-slash.gray").length).toEqual(1);
  });

  it("no photos", () => {
    const wrapper = mount(<Photos {...fakeProps()} />);
    expect(wrapper.text()).toContain("Image:No meta data.");
  });

  it("takes photo", async () => {
    const wrapper = mount(<Photos {...fakeProps()} />);
    const btn = wrapper.find("button").first();
    expect(btn.props().title).not.toEqual(Content.NO_CAMERA_SELECTED);
    await clickButton(wrapper, 0, "take photo");
    expect(mockDevice.takePhoto).toHaveBeenCalled();
    await expect(success).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("shows disabled take photo button", () => {
    const p = fakeProps();
    p.env = { camera: "NONE" };
    const wrapper = mount(<Photos {...p} />);
    const btn = wrapper.find("button").first();
    expect(btn.text()).toEqual("Take Photo");
    expect(btn.props().title).toEqual(Content.NO_CAMERA_SELECTED);
    btn.simulate("click");
    expect(error).toHaveBeenCalledWith(
      ToolTips.SELECT_A_CAMERA, { title: Content.NO_CAMERA_SELECTED });
    expect(mockDevice.takePhoto).not.toHaveBeenCalled();
  });

  it("fails to take photo", async () => {
    mockDevice.takePhoto = jest.fn(() => Promise.reject());
    const wrapper = mount(<Photos {...fakeProps()} />);
    await clickButton(wrapper, 0, "take photo");
    await expect(mockDevice.takePhoto).toHaveBeenCalled();
    await expect(error).toHaveBeenCalled();
  });

  it("deletes photo", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve());
    const images = fakeImages;
    p.currentImage = images[1];
    const wrapper = mount(<Photos {...p} />);
    const button = wrapper.find("button").at(1);
    expect(button.find("i").hasClass("fa-trash")).toBeTruthy();
    await button.simulate("click");
    expect(destroy).toHaveBeenCalledWith(p.currentImage.uuid);
    await expect(success).toHaveBeenCalled();
  });

  it("fails to delete photo", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.reject("error"));
    const images = fakeImages;
    p.currentImage = images[1];
    const wrapper = mount(<Photos {...p} />);
    const button = wrapper.find("button").at(1);
    expect(button.find("i").hasClass("fa-trash")).toBeTruthy();
    await button.simulate("click");
    await expect(destroy).toHaveBeenCalledWith(p.currentImage.uuid);
    await expect(error).toHaveBeenCalled();
  });

  it("no photos to delete", () => {
    const wrapper = mount(<Photos {...fakeProps()} />);
    const button = wrapper.find("button").at(1);
    expect(button.find("i").hasClass("fa-trash")).toBeTruthy();
    button.simulate("click");
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
    expect(wrapper.text()).toContain("X:---");
  });

  it("toggles state", () => {
    const wrapper = shallow<Photos>(<Photos {...fakeProps()} />);
    expect(wrapper.state().crop).toEqual(true);
    expect(wrapper.state().rotate).toEqual(true);
    expect(wrapper.state().fullscreen).toEqual(false);
    wrapper.instance().toggleCrop();
    wrapper.instance().toggleRotation();
    wrapper.instance().toggleFullscreen();
    expect(wrapper.state().crop).toEqual(false);
    expect(wrapper.state().rotate).toEqual(false);
    expect(wrapper.state().fullscreen).toEqual(true);
  });

  it("unselects photos upon exit", () => {
    const p = fakeProps();
    const wrapper = mount(<Photos {...p} />);
    wrapper.unmount();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SHOWN_MAP_IMAGES, payload: [],
    });
  });

  it("returns slider label", () => {
    const p = fakeProps();
    p.images = [fakeImage(), fakeImage(), fakeImage()];
    const wrapper = shallow<Photos>(<Photos {...p} />);
    expect(wrapper.instance().renderLabel(0)).toEqual("oldest");
    expect(wrapper.instance().renderLabel(1)).toEqual("");
    expect(wrapper.instance().renderLabel(2)).toEqual("newest");
  });

  it("returns image index", () => {
    const p = fakeProps();
    const image1 = fakeImage();
    image1.uuid = "Image 1 UUID";
    p.images = [fakeImage(), image1, fakeImage()];
    const wrapper = shallow<Photos>(<Photos {...p} />);
    expect(wrapper.instance().getImageIndex(image1)).toEqual(1);
    expect(wrapper.instance().getImageIndex(undefined)).toEqual(2);
  });

  it("selects next image", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const image = fakeImage();
    image.uuid = "Image UUID";
    p.images = [image, fakeImage(), fakeImage()];
    const wrapper = shallow<Photos>(<Photos {...p} />);
    wrapper.instance().onSliderChange(99);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_IMAGE, payload: image.uuid,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SHOWN_MAP_IMAGES, payload: [undefined],
    });
  });
});

describe("<PhotoFooter />", () => {
  const fakeProps = (): PhotoFooterProps => ({
    image: undefined,
    dispatch: jest.fn(),
    timeSettings: fakeTimeSettings(),
    flags: fakeImageShowFlags(),
    size: { width: 0, height: 0 },
    botOnline: true,
  });

  it("highlights map image", () => {
    const p = fakeProps();
    p.image = fakeImage();
    p.image.body.id = 1;
    const wrapper = mount(<PhotoFooter {...p} />);
    wrapper.find("i").first().simulate("mouseEnter");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HIGHLIGHT_MAP_IMAGE, payload: 1,
    });
    wrapper.find("i").first().simulate("mouseLeave");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HIGHLIGHT_MAP_IMAGE, payload: undefined,
    });
  });
});

describe("<MoveToLocation />", () => {
  const fakeProps = (): MoveToLocationProps => ({
    imageLocation: { x: 0, y: 0, z: 0 },
    botOnline: true,
  });

  it("moves to location", () => {
    const wrapper = mount(<MoveToLocation {...fakeProps()} />);
    clickButton(wrapper, 0, "move farmbot to location");
    expect(push).toHaveBeenCalledWith(locationUrl({ x: 0, y: 0, z: 0 }));
  });
});
