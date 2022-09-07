jest.mock("../../../config_storage/actions", () => ({
  setWebAppConfigValue: jest.fn(),
  getWebAppConfigValue: jest.fn(() => jest.fn()),
}));

jest.mock("../actions", () => ({
  setWebAppConfigValues: jest.fn(),
  toggleAlwaysHighlightImage: jest.fn(() => jest.fn(() => jest.fn())),
  toggleSingleImageMode: jest.fn(() => jest.fn(() => jest.fn())),
  toggleShowPhotoImages: jest.fn(() => jest.fn()),
  toggleShowCalibrationImages: jest.fn(() => jest.fn()),
  toggleShowDetectionImages: jest.fn(() => jest.fn()),
  toggleShowHeightImages: jest.fn(() => jest.fn()),
}));

import React from "react";
import { mount } from "enzyme";
import { PhotoFilterSettings, FiltersEnabledWarning } from "../index";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { fakeImageShowFlags } from "../../../__test_support__/fake_camera_data";
import {
  fakeImage, fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";
import { setWebAppConfigValue } from "../../../config_storage/actions";
import { BooleanSetting } from "../../../session_keys";
import {
  toggleAlwaysHighlightImage, toggleSingleImageMode, setWebAppConfigValues,
} from "../actions";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import {
  PhotoFilterSettingsProps, FiltersEnabledWarningProps,
} from "../interfaces";
import { fakeDesignerState } from "../../../__test_support__/fake_designer_state";

describe("<PhotoFilterSettings />", () => {
  const fakeProps = (): PhotoFilterSettingsProps => ({
    dispatch: mockDispatch(),
    images: [],
    currentImage: fakeImage(),
    timeSettings: fakeTimeSettings(),
    flags: fakeImageShowFlags(),
    designer: fakeDesignerState(),
    getConfigValue: jest.fn(),
  });

  it("sets resets filter settings", () => {
    const wrapper = mount(<PhotoFilterSettings {...fakeProps()} />);
    wrapper.find(".fb-button.red").first().simulate("click");
    expect(setWebAppConfigValues).toHaveBeenCalledWith({
      photo_filter_begin: "",
      photo_filter_end: "",
    });
  });

  it("toggles photos", () => {
    const wrapper = mount(<PhotoFilterSettings {...fakeProps()} />);
    wrapper.find("ToggleButton").at(0).simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      BooleanSetting.show_images, false);
  });

  it("toggles always highlight mode", () => {
    const p = fakeProps();
    const wrapper = mount(<PhotoFilterSettings {...p} />);
    wrapper.find("ToggleButton").at(1).simulate("click");
    expect(toggleAlwaysHighlightImage).toHaveBeenCalledWith(
      false, p.currentImage);
  });

  it("displays single image mode", () => {
    const p = fakeProps();
    p.designer.hideUnShownImages = true;
    const wrapper = mount(<PhotoFilterSettings {...p} />);
    expect(wrapper.find(".filter-controls").hasClass("single-image-mode"))
      .toBeTruthy();
  });

  it("toggles single image mode", () => {
    const p = fakeProps();
    const wrapper = mount(<PhotoFilterSettings {...p} />);
    wrapper.find("ToggleButton").at(2).simulate("click");
    expect(toggleSingleImageMode).toHaveBeenCalledWith(p.currentImage);
  });

  it("displays image layer off mode", () => {
    const p = fakeProps();
    p.flags.layerOn = false;
    const wrapper = mount(<PhotoFilterSettings {...p} />);
    expect(wrapper.find(".filter-controls").hasClass("image-layer-disabled"))
      .toBeTruthy();
  });

  it("sets filter settings to current image and earlier", () => {
    const p = fakeProps();
    p.currentImage
      && (p.currentImage.body.created_at = "2001-01-03T05:00:01.000Z");
    const wrapper = mount(<PhotoFilterSettings {...p} />);
    wrapper.find(".newer-older-images-section").find("button").first()
      .simulate("click");
    expect(setWebAppConfigValues).toHaveBeenCalledWith({
      photo_filter_begin: "",
      photo_filter_end: "2001-01-03T05:00:02.000Z",
    });
  });

  it("sets filter settings to current image and later", () => {
    const p = fakeProps();
    p.currentImage
      && (p.currentImage.body.created_at = "2001-01-03T05:00:01.000Z");
    const wrapper = mount(<PhotoFilterSettings {...p} />);
    wrapper.find(".newer-older-images-section").find("button").last()
      .simulate("click");
    expect(setWebAppConfigValues).toHaveBeenCalledWith({
      photo_filter_begin: "2001-01-03T05:00:00.000Z",
      photo_filter_end: "",
    });
  });
});

describe("<FiltersEnabledWarning />", () => {
  const config = fakeWebAppConfig();
  config.body.photo_filter_begin = "";
  config.body.photo_filter_end = "";
  config.body.show_images = true;

  const fakeProps = (): FiltersEnabledWarningProps => ({
    designer: fakeDesignerState(),
    getConfigValue: jest.fn(x => config.body[x]),
  });

  it("renders when no filters are enabled", () => {
    const wrapper = mount(<FiltersEnabledWarning {...fakeProps()} />);
    expect(wrapper.html()).not.toContain("fa-exclamation-triangle");
  });

  it("renders when filters are enabled", () => {
    const p = fakeProps();
    p.designer.hideUnShownImages = true;
    const wrapper = mount(<FiltersEnabledWarning {...p} />);
    expect(wrapper.html()).toContain("fa-exclamation-triangle");
    const e = { stopPropagation: jest.fn() };
    wrapper.find(".fa-exclamation-triangle").simulate("click", e);
    expect(e.stopPropagation).toHaveBeenCalled();
  });
});
