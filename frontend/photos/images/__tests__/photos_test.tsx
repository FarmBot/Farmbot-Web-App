jest.mock("../../../devices/actions", () => ({
  move: jest.fn(),
}));

jest.mock("../../../api/crud", () => ({ destroy: jest.fn() }));

import React from "react";
import { mount, shallow } from "enzyme";
import { Photos, MoveToLocation, PhotoButtons } from "../photos";
import { fakeImages } from "../../../__test_support__/fake_state/images";
import { destroy } from "../../../api/crud";
import { clickButton } from "../../../__test_support__/helpers";
import {
  PhotosProps, MoveToLocationProps, PhotoButtonsProps,
} from "../interfaces";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { success, error } from "../../../toast/toast";
import { Actions } from "../../../constants";
import {
  fakeImage, fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";
import { fakeImageShowFlags } from "../../../__test_support__/fake_camera_data";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import { fakeDesignerState } from "../../../__test_support__/fake_designer_state";
import {
  fakeMovementState, fakePercentJob,
} from "../../../__test_support__/fake_bot_data";
import { move } from "../../../devices/actions";

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
    arduinoBusy: false,
    currentBotLocation: { x: 0, y: 0, z: 0 },
    movementState: fakeMovementState(),
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
    expect(wrapper.text()).toContain("(632, 347, 164)");
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
    expect(wrapper.text()).toContain("(632, 347, 100)");
    expect(wrapper.find(".fa-eye-slash.gray").length).toEqual(1);
  });

  it("no photos", () => {
    const wrapper = mount(<Photos {...fakeProps()} />);
    expect(wrapper.text()).toContain("yet taken any photos");
  });

  it("deletes photo", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve());
    const images = fakeImages;
    p.currentImage = images[1];
    const wrapper = mount(<Photos {...p} />);
    const button = wrapper.find("i").at(1);
    expect(button.hasClass("fa-trash")).toBeTruthy();
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
    const button = wrapper.find("i").at(1);
    expect(button.hasClass("fa-trash")).toBeTruthy();
    await button.simulate("click");
    await expect(destroy).toHaveBeenCalledWith(p.currentImage.uuid);
    await expect(error).toHaveBeenCalled();
  });

  it("no photos to delete", () => {
    const wrapper = mount<Photos>(<Photos {...fakeProps()} />);
    expect(wrapper.html()).not.toContain("fa-trash");
    wrapper.instance().deletePhoto();
    expect(destroy).not.toHaveBeenCalled();
  });

  it("doesn't show image download progress", () => {
    const p = fakeProps();
    p.imageJobs = [fakePercentJob({ status: "complete" })];
    const wrapper = mount(<Photos {...p} />);
    expect(wrapper.text()).not.toContain("uploading");
  });

  it("can't find meta field data", () => {
    const p = fakeProps();
    p.images = fakeImages;
    p.images[0].body.meta.x = undefined;
    p.currentImage = p.images[0];
    const wrapper = mount(<Photos {...p} />);
    expect(wrapper.text()).toContain("(---");
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

describe("<PhotoButtons />", () => {
  const fakeProps = (): PhotoButtonsProps => ({
    image: undefined,
    dispatch: jest.fn(),
    flags: fakeImageShowFlags(),
    size: { width: 0, height: 0 },
    deletePhoto: jest.fn(),
    toggleCrop: jest.fn(),
    toggleRotation: jest.fn(),
    toggleFullscreen: jest.fn(),
    canCrop: true,
    canTransform: true,
    imageUrl: undefined,
  });

  it("highlights map image", () => {
    const p = fakeProps();
    p.image = fakeImage();
    p.image.body.id = 1;
    const wrapper = mount(<PhotoButtons {...p} />);
    wrapper.find("i").first().simulate("mouseEnter");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HIGHLIGHT_MAP_IMAGE, payload: 1,
    });
    wrapper.find("i").first().simulate("mouseLeave");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HIGHLIGHT_MAP_IMAGE, payload: undefined,
    });
  });

  it("toggles rotation", () => {
    const p = fakeProps();
    p.imageUrl = "fake url";
    const wrapper = mount(<PhotoButtons {...p} />);
    wrapper.find(".fa-repeat").simulate("click");
    expect(p.toggleRotation).toHaveBeenCalled();
  });
});

describe("<MoveToLocation />", () => {
  const fakeProps = (): MoveToLocationProps => ({
    imageLocation: { x: 0, y: 0, z: 0 },
    botOnline: true,
    arduinoBusy: false,
    currentBotLocation: { x: 0, y: 0, z: 0 },
    dispatch: jest.fn(),
    defaultAxes: "XY",
    movementState: fakeMovementState(),
  });

  it("moves to location", () => {
    const wrapper = mount(<MoveToLocation {...fakeProps()} />);
    clickButton(wrapper, 0, "go (x, y)");
    expect(move).toHaveBeenCalledWith({ x: 0, y: 0, z: 0 });
  });

  it("handles missing location", () => {
    const p = fakeProps();
    p.imageLocation.x = undefined;
    const wrapper = mount(<MoveToLocation {...p} />);
    expect(wrapper.html()).toEqual("<div></div>");
  });
});
