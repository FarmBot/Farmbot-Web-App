const mockDevice = { takePhoto: jest.fn(() => Promise.resolve({})) };
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

jest.mock("../../../api/crud", () => ({ destroy: jest.fn() }));

jest.mock("../actions", () => ({ selectImage: jest.fn() }));

jest.mock("../../../farm_designer/map/layers/images/image_filter_menu", () => ({
  setWebAppConfigValues: jest.fn(),
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { Photos, ImageMetaFilterMenu, ImageFilterProps } from "../photos";
import { JobProgress } from "farmbot";
import { fakeImages } from "../../../__test_support__/fake_state/images";
import { destroy } from "../../../api/crud";
import { clickButton } from "../../../__test_support__/helpers";
import { PhotosProps } from "../interfaces";
import { selectImage } from "../actions";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { success, error } from "../../../toast/toast";
import { Content, ToolTips, Actions } from "../../../constants";
import { fakeImage } from "../../../__test_support__/fake_state/resources";
import {
  setWebAppConfigValues,
} from "../../../farm_designer/map/layers/images/image_filter_menu";

describe("<Photos/>", () => {
  const fakeProps = (): PhotosProps => ({
    images: [],
    currentImage: undefined,
    dispatch: jest.fn(),
    timeSettings: fakeTimeSettings(),
    imageJobs: [],
    botToMqttStatus: "up",
    syncStatus: "synced",
    env: {},
    imageFilterBegin: undefined,
    imageFilterEnd: undefined,
    hiddenImages: [],
  });

  it("shows photo", () => {
    const p = fakeProps();
    const images = fakeImages;
    p.currentImage = images[1];
    const wrapper = mount(<Photos {...p} />);
    expect(wrapper.text()).toContain("Created At:June 1st, 2017");
    expect(wrapper.text()).toContain("X:632Y:347Z:164");
    expect(wrapper.find(".fa-check-circle.green").length).toEqual(1);
  });

  it("shows photo not in map", () => {
    const p = fakeProps();
    const images = fakeImages;
    p.currentImage = images[1];
    p.currentImage.body.meta.z = 100;
    p.env["CAMERA_CALIBRATION_camera_z"] = "0";
    const wrapper = mount(<Photos {...p} />);
    expect(wrapper.text()).toContain("Created At:June 1st, 2017");
    expect(wrapper.text()).toContain("X:632Y:347Z:100");
    expect(wrapper.find(".fa-times-circle.gray").length).toEqual(1);
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
      ToolTips.SELECT_A_CAMERA, Content.NO_CAMERA_SELECTED);
    expect(mockDevice.takePhoto).not.toHaveBeenCalled();
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

  it("updates photo size", () => {
    const p = fakeProps();
    p.images = fakeImages;
    const wrapper = shallow<Photos>(<Photos {...p} />);
    expect(wrapper.state()).toEqual({ imageWidth: 0, imageHeight: 0 });
    const img = new Image();
    Object.defineProperty(img, "naturalWidth", {
      value: 10, configurable: true,
    });
    Object.defineProperty(img, "naturalHeight", {
      value: 20, configurable: true,
    });
    wrapper.instance().imageLoadCallback(img);
    expect(wrapper.state()).toEqual({ imageWidth: 10, imageHeight: 20 });
  });
});

describe("<ImageMetaFilterMenu />", () => {
  const fakeProps = (): ImageFilterProps => ({
    image: fakeImage(),
    dispatch: jest.fn(),
    flags: { inRange: true, notHidden: true, zMatch: true, sizeMatch: true },
  });

  it("renders as shown in map", () => {
    const wrapper = mount(<ImageMetaFilterMenu {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).not.toContain("not shown in map");
  });

  it("renders as not shown in map", () => {
    const p = fakeProps();
    p.flags.inRange = false;
    const wrapper = mount(<ImageMetaFilterMenu {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("not shown in map");
  });

  it("sets map image highlight", () => {
    const p = fakeProps();
    p.image.body.id = 1;
    const wrapper = mount(<ImageMetaFilterMenu {...p} />);
    wrapper.find(".shown-in-map-details").simulate("mouseEnter");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HIGHLIGHT_MAP_IMAGE, payload: 1,
    });
    wrapper.find(".shown-in-map-details").simulate("mouseLeave");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HIGHLIGHT_MAP_IMAGE, payload: undefined,
    });
  });

  it("sets filter settings for single image viewing", () => {
    const p = fakeProps();
    p.image.body.created_at = "2001-01-03T05:00:01.000Z";
    const wrapper = mount(<ImageMetaFilterMenu {...p} />);
    wrapper.find(".this-image-section").find("button").simulate("click");
    expect(setWebAppConfigValues).toHaveBeenCalledWith({
      photo_filter_begin: "2001-01-03T05:00:00.000Z",
      photo_filter_end: "2001-01-03T05:00:02.000Z",
    });
  });

  it("sets filter settings to current image and earlier", () => {
    const p = fakeProps();
    p.image.body.created_at = "2001-01-03T05:00:01.000Z";
    const wrapper = mount(<ImageMetaFilterMenu {...p} />);
    wrapper.find(".newer-older-images-section").find("button").first()
      .simulate("click");
    expect(setWebAppConfigValues).toHaveBeenCalledWith({
      photo_filter_begin: "",
      photo_filter_end: "2001-01-03T05:00:02.000Z",
    });
  });

  it("sets filter settings to current image and later", () => {
    const p = fakeProps();
    p.image.body.created_at = "2001-01-03T05:00:01.000Z";
    const wrapper = mount(<ImageMetaFilterMenu {...p} />);
    wrapper.find(".newer-older-images-section").find("button").last()
      .simulate("click");
    expect(setWebAppConfigValues).toHaveBeenCalledWith({
      photo_filter_begin: "2001-01-03T05:00:00.000Z",
      photo_filter_end: "",
    });
  });

  it("hides map image", () => {
    const p = fakeProps();
    p.image.body.id = 1;
    const wrapper = mount(<ImageMetaFilterMenu {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("hide");
    wrapper.find(".hide-single-image-section").find("button").simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HIDE_MAP_IMAGE, payload: 1,
    });
  });

  it("shows map image", () => {
    const p = fakeProps();
    p.image.body.id = 1;
    p.flags.notHidden = false;
    const wrapper = mount(<ImageMetaFilterMenu {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("show");
    wrapper.find(".hide-single-image-section").find("button").simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SHOW_MAP_IMAGE, payload: 1,
    });
  });
});
