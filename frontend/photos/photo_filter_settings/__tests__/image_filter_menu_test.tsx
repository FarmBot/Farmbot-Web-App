jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import {
  fakeImage,
  fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";
const mockConfig = fakeWebAppConfig();
jest.mock("../../../resources/selectors", () => ({
  getWebAppConfig: () => mockConfig,
  assertUuid: jest.fn(),
  findUuid: jest.fn(),
  selectAllPlantPointers: jest.fn(() => []),
}));

import React from "react";
import { ImageFilterMenu } from "../image_filter_menu";
import { shallow, mount } from "enzyme";
import { StringConfigKey } from "farmbot/dist/resources/configs/web_app";
import {
  fakeTimeSettings,
} from "../../../__test_support__/fake_time_settings";
import { edit, save } from "../../../api/crud";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { ImageFilterMenuProps } from "../interfaces";
import { StringSetting } from "../../../session_keys";
import { MarkedSlider } from "../../../ui";

describe("<ImageFilterMenu />", () => {
  mockConfig.body.photo_filter_begin = "";
  mockConfig.body.photo_filter_end = "";

  const fakeProps = (): ImageFilterMenuProps => ({
    timeSettings: fakeTimeSettings(),
    dispatch: jest.fn(),
    getConfigValue: jest.fn(x => mockConfig.body[x as StringConfigKey]),
    imageAgeInfo: { newestDate: "", toOldest: 1 },
  });

  it("renders", () => {
    const p = fakeProps();
    const wrapper = shallow(<ImageFilterMenu {...p} />);
    ["Date", "Time", "Newer than", "Older than"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it.each<[
    "beginDate" | "endDate", StringConfigKey, number
  ]>([
    ["beginDate", StringSetting.photo_filter_begin, 0],
    ["endDate", StringSetting.photo_filter_end, 2],
  ])("sets date filter: %s", (filter, key, i) => {
    const p = fakeProps();
    const state = fakeState();
    const config = fakeWebAppConfig();
    state.resources = buildResourceIndex([config]);
    p.dispatch = jest.fn(x => x(jest.fn(), () => state));
    const wrapper = shallow<ImageFilterMenu>(<ImageFilterMenu {...p} />);
    wrapper.find("BlurableInput").at(i).simulate("commit", {
      currentTarget: { value: "2001-01-03" }
    });
    expect(wrapper.instance().state[filter]).toEqual("2001-01-03");
    expect(edit).toHaveBeenCalledWith(config, {
      [key]: "2001-01-03T00:00:00.000Z"
    });
    expect(save).toHaveBeenCalledWith(config.uuid);
  });

  it.each<[
    "beginTime" | "endTime", StringConfigKey, number
  ]>([
    ["beginTime", StringSetting.photo_filter_begin, 1],
    ["endTime", StringSetting.photo_filter_end, 3],
  ])("sets time filter: %s", (filter, key, i) => {
    const p = fakeProps();
    const state = fakeState();
    const config = fakeWebAppConfig();
    state.resources = buildResourceIndex([config]);
    p.dispatch = jest.fn(x => x(jest.fn(), () => state));
    const wrapper = shallow<ImageFilterMenu>(<ImageFilterMenu {...p} />);
    wrapper.setState({ beginDate: "2001-01-03", endDate: "2001-01-03" });
    wrapper.find("BlurableInput").at(i).simulate("commit", {
      currentTarget: { value: "05:00" }
    });
    expect(wrapper.instance().state[filter]).toEqual("05:00");
    expect(edit).toHaveBeenCalledWith(config, {
      [key]: "2001-01-03T05:00:00.000Z"
    });
    expect(save).toHaveBeenCalledWith(config.uuid);
  });

  it.each<[
    "beginDate" | "endDate",
    StringConfigKey,
    number
  ]>([
    ["beginDate", StringSetting.photo_filter_begin, 0],
    ["endDate", StringSetting.photo_filter_end, 2],
  ])("unsets filter: %s", (filter, key, i) => {
    const p = fakeProps();
    const state = fakeState();
    const config = fakeWebAppConfig();
    state.resources = buildResourceIndex([config]);
    p.dispatch = jest.fn(x => x(jest.fn(), () => state));
    const wrapper = shallow<ImageFilterMenu>(<ImageFilterMenu {...p} />);
    wrapper.setState({ beginDate: "2001-01-03", endDate: "2001-01-03" });
    wrapper.find("BlurableInput").at(i).simulate("commit", {
      currentTarget: { value: "" }
    });
    expect(wrapper.instance().state[filter]).toEqual(undefined);
    // eslint-disable-next-line no-null/no-null
    expect(edit).toHaveBeenCalledWith(config, { [key]: null });
    expect(save).toHaveBeenCalledWith(config.uuid);
  });

  it.each<[
    "beginTime" | "endTime", number
  ]>([
    ["beginTime", 1],
    ["endTime", 3],
  ])("doesn't set filter: %s", (filter, i) => {
    const p = fakeProps();
    const state = fakeState();
    const config = fakeWebAppConfig();
    state.resources = buildResourceIndex([config]);
    p.dispatch = jest.fn(x => x(jest.fn(), () => state));
    const wrapper = shallow<ImageFilterMenu>(<ImageFilterMenu {...p} />);
    wrapper.find("BlurableInput").at(i).simulate("commit", {
      currentTarget: { value: "05:00" }
    });
    expect(wrapper.instance().state[filter]).toEqual("05:00");
    expect(edit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("loads values from config", () => {
    mockConfig.body.photo_filter_begin = "2001-01-03T05:00:00.000Z";
    mockConfig.body.photo_filter_end = "2001-01-03T06:00:00.000Z";
    const wrapper = shallow(<ImageFilterMenu {...fakeProps()} />);
    expect(wrapper.state()).toEqual({
      beginDate: "2001-01-03", beginTime: "05:00",
      endDate: "2001-01-03", endTime: "06:00",
    });
  });

  it("commits slider change", () => {
    const p = fakeProps();
    const state = fakeState();
    const config = fakeWebAppConfig();
    state.resources = buildResourceIndex([config]);
    p.dispatch = jest.fn(x => x(jest.fn(), () => state));
    p.getConfigValue = () => undefined;
    p.imageAgeInfo.newestDate = "2001-01-03T05:00:00.000Z";
    const wrapper = shallow<ImageFilterMenu>(<ImageFilterMenu {...p} />);
    wrapper.instance().sliderChange(1);
    expect(wrapper.instance().state.slider).toEqual(undefined);
    expect(edit).toHaveBeenCalledWith(config, {
      photo_filter_begin: "2001-01-03T00:00:00.000Z",
      photo_filter_end: "2001-01-04T00:00:00.000Z",
    });
    expect(save).toHaveBeenCalledWith(config.uuid);
  });

  it("doesn't update config", () => {
    const p = fakeProps();
    const state = fakeState();
    state.resources = buildResourceIndex([]);
    p.dispatch = jest.fn(x => x(jest.fn(), () => state));
    p.getConfigValue = () => 1;
    p.imageAgeInfo.newestDate = "2001-01-03T05:00:00.000Z";
    const wrapper = shallow<ImageFilterMenu>(<ImageFilterMenu {...p} />);
    wrapper.instance().sliderChange(1);
    expect(wrapper.instance().state.slider).toEqual(undefined);
    expect(edit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("expands date range into past", () => {
    mockConfig.body.photo_filter_begin = "2001-01-01T05:00:00.000Z";
    mockConfig.body.photo_filter_end = "";
    const p = fakeProps();
    p.imageAgeInfo = { newestDate: "2001-01-10T00:00:00.000Z", toOldest: 1 };
    const wrapper = shallow<ImageFilterMenu>(<ImageFilterMenu {...p} />);
    expect(wrapper.instance().imageAgeInfo).toEqual({
      newestDate: "2001-01-10T00:00:00.000Z", toOldest: 9,
    });
  });

  it("expands date range into future", () => {
    mockConfig.body.photo_filter_begin = "2001-01-20T05:00:00.000Z";
    mockConfig.body.photo_filter_end = "";
    const p = fakeProps();
    p.imageAgeInfo = { newestDate: "2001-01-10T00:00:00.000Z", toOldest: 1 };
    const wrapper = shallow<ImageFilterMenu>(<ImageFilterMenu {...p} />);
    expect(wrapper.instance().imageAgeInfo).toEqual({
      newestDate: "2001-01-21T00:00:00.000Z", toOldest: 13,
    });
  });

  it("steps date", () => {
    mockConfig.body.photo_filter_begin = "2001-01-03T05:00:00.000Z";
    const p = fakeProps();
    const state = fakeState();
    const config = fakeWebAppConfig();
    state.resources = buildResourceIndex([config]);
    p.dispatch = jest.fn(x => x(jest.fn(), () => state));
    const wrapper = shallow<ImageFilterMenu>(<ImageFilterMenu {...p} />);
    wrapper.instance().dateStep(1)();
    expect(edit).toHaveBeenCalledWith(config, {
      photo_filter_begin: "2001-01-04T00:00:00.000Z",
      photo_filter_end: "2001-01-05T00:00:00.000Z",
    });
    expect(save).toHaveBeenCalledWith(config.uuid);
  });

  it("choses newest date", () => {
    mockConfig.body.photo_filter_begin = "";
    const p = fakeProps();
    p.imageAgeInfo = { newestDate: "2001-01-10T00:00:00.000Z", toOldest: 1 };
    const state = fakeState();
    const config = fakeWebAppConfig();
    state.resources = buildResourceIndex([config]);
    p.dispatch = jest.fn(x => x(jest.fn(), () => state));
    const wrapper = shallow<ImageFilterMenu>(<ImageFilterMenu {...p} />);
    wrapper.instance().newest();
    expect(edit).toHaveBeenCalledWith(config, {
      photo_filter_begin: "2001-01-10T00:00:00.000Z",
      photo_filter_end: "2001-01-11T00:00:00.000Z",
    });
    expect(save).toHaveBeenCalledWith(config.uuid);
  });

  it("choses oldest date", () => {
    mockConfig.body.photo_filter_begin = "";
    const p = fakeProps();
    p.imageAgeInfo = { newestDate: "2001-01-10T00:00:00.000Z", toOldest: 3 };
    const state = fakeState();
    const config = fakeWebAppConfig();
    state.resources = buildResourceIndex([config]);
    p.dispatch = jest.fn(x => x(jest.fn(), () => state));
    const wrapper = shallow<ImageFilterMenu>(<ImageFilterMenu {...p} />);
    wrapper.instance().oldest();
    expect(edit).toHaveBeenCalledWith(config, {
      photo_filter_begin: "2001-01-06T00:00:00.000Z",
      photo_filter_end: "2001-01-07T00:00:00.000Z",
    });
    expect(save).toHaveBeenCalledWith(config.uuid);
  });

  it("gets image index", () => {
    const p = fakeProps();
    p.imageAgeInfo = { newestDate: "2001-01-10T00:00:00.000Z", toOldest: 3 };
    const wrapper = shallow<ImageFilterMenu>(<ImageFilterMenu {...p} />);
    const image = fakeImage();
    image.body.created_at = "2001-01-08T00:00:00.000Z";
    const index = wrapper.instance().getImageOffset(image);
    expect(index).toEqual(1);
  });

  it("changes slider", () => {
    const p = fakeProps();
    p.imageAgeInfo = { newestDate: "2001-01-10T00:00:00.000Z", toOldest: 1 };
    const wrapper = shallow<ImageFilterMenu>(<ImageFilterMenu {...p} />);
    expect(wrapper.state().slider).toEqual(undefined);
    wrapper.find(MarkedSlider).simulate("change", 1);
    expect(wrapper.state().slider).toEqual(1);
  });

  it("displays slider labels", () => {
    mockConfig.body.photo_filter_begin = "2001-01-03T05:00:00.000Z";
    const p = fakeProps();
    p.imageAgeInfo.newestDate = "2001-01-03T00:00:00.000Z";
    const wrapper = mount(<ImageFilterMenu {...p} />);
    ["Jan-1", "Jan-2", "Jan-3"].map(date =>
      expect(wrapper.text()).toContain(date));
  });
});
