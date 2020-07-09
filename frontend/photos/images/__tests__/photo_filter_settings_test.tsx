jest.mock("../image_filter_menu", () => ({
  setWebAppConfigValues: jest.fn(),
  calculateImageAgeInfo: jest.fn(),
  ImageFilterMenu: () => <div />,
}));

jest.mock("../../../config_storage/actions", () => ({
  setWebAppConfigValue: jest.fn(),
}));

jest.mock("../actions", () => ({
  toggleAlwaysHighlightImage: jest.fn(),
  toggleSingleImageMode: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  parseFilterSetting, PhotoFilterSettingsProps, PhotoFilterSettings,
  FilterAroundThisImage,
} from "../photo_filter_settings";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { fakeImageShowFlags } from "../../../__test_support__/fake_camera_data";
import { setWebAppConfigValues } from "../image_filter_menu";
import { fakeImage } from "../../../__test_support__/fake_state/resources";
import { setWebAppConfigValue } from "../../../config_storage/actions";
import { BooleanSetting } from "../../../session_keys";
import { toggleAlwaysHighlightImage, toggleSingleImageMode } from "../actions";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import { ExpandableHeader } from "../../../ui";
import { ImageFilterProps } from "../shown_in_map";

describe("parseFilterSetting()", () => {
  it("returns set image filter setting", () => {
    const setting = "2017-09-03T20:01:40.336Z";
    expect(parseFilterSetting(() => setting)("photo_filter_begin"))
      .toEqual(setting);
  });

  it("returns unset image filter setting", () => {
    const setting = "";
    expect(parseFilterSetting(() => setting)("photo_filter_begin"))
      .toEqual(undefined);
  });
});

describe("<PhotoFilterSettings />", () => {
  const fakeProps = (): PhotoFilterSettingsProps => ({
    dispatch: mockDispatch(),
    images: [],
    image: fakeImage(),
    timeSettings: fakeTimeSettings(),
    flags: fakeImageShowFlags(),
    hideUnShownImages: false,
    alwaysHighlightImage: false,
    getConfigValue: jest.fn(),
  });

  it("opens section", () => {
    const wrapper = mount<PhotoFilterSettings>(
      <PhotoFilterSettings {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("filter map photos");
    expect(wrapper.state().open).toEqual(false);
    wrapper.find(ExpandableHeader).simulate("click");
    expect(wrapper.state().open).toEqual(true);
  });

  it("sets resets filter settings", () => {
    const wrapper = mount(<PhotoFilterSettings {...fakeProps()} />);
    wrapper.setState({ open: true });
    wrapper.find(".fb-button.red").first().simulate("click");
    expect(setWebAppConfigValues).toHaveBeenCalledWith({
      photo_filter_begin: "",
      photo_filter_end: "",
    });
  });

  it("toggles photos", () => {
    const wrapper = mount(<PhotoFilterSettings {...fakeProps()} />);
    wrapper.setState({ open: true });
    wrapper.find("ToggleButton").at(0).simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      BooleanSetting.show_images, false);
  });

  it("toggles always highlight mode", () => {
    const p = fakeProps();
    const wrapper = mount(<PhotoFilterSettings {...p} />);
    wrapper.setState({ open: true });
    wrapper.find("ToggleButton").at(1).simulate("click");
    expect(toggleAlwaysHighlightImage).toHaveBeenCalledWith(
      false, p.image);
  });

  it("displays single image mode", () => {
    const p = fakeProps();
    p.hideUnShownImages = true;
    const wrapper = mount(<PhotoFilterSettings {...p} />);
    wrapper.setState({ open: true });
    expect(wrapper.find(".filter-controls").hasClass("single-image-mode"))
      .toBeTruthy();
  });

  it("toggles single image mode", () => {
    const p = fakeProps();
    const wrapper = mount(<PhotoFilterSettings {...p} />);
    wrapper.setState({ open: true });
    wrapper.find("ToggleButton").at(2).simulate("click");
    expect(toggleSingleImageMode).toHaveBeenCalledWith(p.image);
  });

  it("displays image layer off mode", () => {
    const p = fakeProps();
    p.flags.layerOn = false;
    const wrapper = mount(<PhotoFilterSettings {...p} />);
    wrapper.setState({ open: true });
    expect(wrapper.find(".filter-controls").hasClass("image-layer-disabled"))
      .toBeTruthy();
  });

  it("sets filter settings to current image and earlier", () => {
    const p = fakeProps();
    p.image && (p.image.body.created_at = "2001-01-03T05:00:01.000Z");
    const wrapper = mount(<PhotoFilterSettings {...p} />);
    wrapper.setState({ open: true });
    wrapper.find(".newer-older-images-section").find("button").first()
      .simulate("click");
    expect(setWebAppConfigValues).toHaveBeenCalledWith({
      photo_filter_begin: "",
      photo_filter_end: "2001-01-03T05:00:02.000Z",
    });
  });

  it("sets filter settings to current image and later", () => {
    const p = fakeProps();
    p.image && (p.image.body.created_at = "2001-01-03T05:00:01.000Z");
    const wrapper = mount(<PhotoFilterSettings {...p} />);
    wrapper.setState({ open: true });
    wrapper.find(".newer-older-images-section").find("button").last()
      .simulate("click");
    expect(setWebAppConfigValues).toHaveBeenCalledWith({
      photo_filter_begin: "2001-01-03T05:00:00.000Z",
      photo_filter_end: "",
    });
  });
});

describe("<FilterAroundThisImage />", () => {
  const fakeProps = (): ImageFilterProps => ({
    image: fakeImage(),
    dispatch: jest.fn(),
    flags: fakeImageShowFlags(),
  });

  it("changes value", () => {
    const p = fakeProps();
    const wrapper = shallow<FilterAroundThisImage>(
      <FilterAroundThisImage {...p} />);
    expect(wrapper.state().seconds).toEqual(60);
    wrapper.find("input").simulate("change", { currentTarget: { value: "2" } });
    expect(wrapper.state().seconds).toEqual(120);
  });

  it("sets filter settings for around image", () => {
    const p = fakeProps();
    p.image && (p.image.body.created_at = "2001-01-03T05:00:01.000Z");
    const wrapper = mount<FilterAroundThisImage>(
      <FilterAroundThisImage {...p} />);
    wrapper.setState({ seconds: 120 });
    wrapper.find(".this-image-section").find("button").simulate("click");
    expect(setWebAppConfigValues).toHaveBeenCalledWith({
      photo_filter_begin: "2001-01-03T04:58:01.000Z",
      photo_filter_end: "2001-01-03T05:02:01.000Z",
    });
  });
});
