import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  fakeImage,
  fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";
const mockConfig = fakeWebAppConfig();

import { StringConfigKey } from "farmbot/dist/resources/configs/web_app";
import {
  fakeTimeSettings,
} from "../../../__test_support__/fake_time_settings";
import * as crud from "../../../api/crud";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { ImageFilterMenuProps, ImageFilterMenuState } from "../interfaces";
import { StringSetting } from "../../../session_keys";
import { ImageFilterMenu } from "../image_filter_menu";
import * as ui from "../../../ui";

let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let markedSliderSpy: jest.SpyInstance;

beforeEach(() => {
  mockConfig.body.photo_filter_begin = "";
  mockConfig.body.photo_filter_end = "";
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  markedSliderSpy = jest.spyOn(ui, "MarkedSlider")
    .mockImplementation((props: {
      min: number;
      max: number;
      value: number;
      onChange: (value: number) => void;
      onRelease: (value: number) => void;
      labelRenderer: (value: number) => string;
    }) => <div data-testid={"marked-slider"}>
      <button onClick={() => props.onChange(1)}>
        change slider
      </button>
      <button onClick={() => props.onRelease(1)}>
        release slider
      </button>
      <span data-testid={"slider-value"}>{props.value}</span>
      {Array.from(
        { length: props.max - props.min + 1 },
        (_, index) => props.min + index,
      ).map(day => <span key={day}>{props.labelRenderer(day)}</span>)}
    </div>);
});

afterEach(() => {
  markedSliderSpy.mockRestore();
  editSpy.mockRestore();
  saveSpy.mockRestore();
});

describe("<ImageFilterMenu />", () => {
  const fakeProps = (): ImageFilterMenuProps => ({
    timeSettings: fakeTimeSettings(),
    dispatch: jest.fn(),
    getConfigValue: jest.fn(x => mockConfig.body[x as StringConfigKey]),
    imageAgeInfo: { newestDate: "", toOldest: 1 },
  });

  const setStateSync = (instance: ImageFilterMenu) => {
    instance.setState = (((update: Partial<ImageFilterMenuState>) => {
      instance.state = { ...instance.state, ...update };
    }) as unknown) as typeof instance.setState;
  };

  const setConfigDispatch = (
    p: ImageFilterMenuProps,
    configs: ReturnType<typeof fakeWebAppConfig>[],
  ) => {
    const state = fakeState();
    state.resources = buildResourceIndex(configs);
    p.dispatch = jest.fn(action => action(jest.fn(), () => state));
  };

  const inputEvent = (value: string) =>
    ({ currentTarget: { value } } as React.SyntheticEvent<HTMLInputElement>);

  it("renders", () => {
    render(<ImageFilterMenu {...fakeProps()} />);
    ["Date", "Time", "Newer than", "Older than"].map(text =>
      expect(screen.getByText(text)).toBeInTheDocument());
  });

  it.each<[
    "beginDate" | "endDate", StringConfigKey
  ]>([
    ["beginDate", StringSetting.photo_filter_begin],
    ["endDate", StringSetting.photo_filter_end],
  ])("sets date filter: %s", (filter, key) => {
    const p = fakeProps();
    const config = fakeWebAppConfig();
    setConfigDispatch(p, [config]);
    const instance = new ImageFilterMenu(p);
    setStateSync(instance);
    instance.setDatetime(filter)(inputEvent("2001-01-03"));
    expect(instance.state[filter]).toEqual("2001-01-03");
    expect(editSpy).toHaveBeenCalledWith(config, {
      [key]: "2001-01-03T00:00:00.000Z",
    });
    expect(saveSpy).toHaveBeenCalledWith(config.uuid);
  });

  it.each<[
    "beginTime" | "endTime", StringConfigKey
  ]>([
    ["beginTime", StringSetting.photo_filter_begin],
    ["endTime", StringSetting.photo_filter_end],
  ])("sets time filter: %s", (filter, key) => {
    const p = fakeProps();
    const config = fakeWebAppConfig();
    setConfigDispatch(p, [config]);
    const instance = new ImageFilterMenu(p);
    setStateSync(instance);
    instance.state = { ...instance.state, beginDate: "2001-01-03", endDate: "2001-01-03" };
    instance.setDatetime(filter)(inputEvent("05:00"));
    expect(instance.state[filter]).toEqual("05:00");
    expect(editSpy).toHaveBeenCalledWith(config, {
      [key]: "2001-01-03T05:00:00.000Z",
    });
    expect(saveSpy).toHaveBeenCalledWith(config.uuid);
  });

  it.each<[
    "beginDate" | "endDate", StringConfigKey
  ]>([
    ["beginDate", StringSetting.photo_filter_begin],
    ["endDate", StringSetting.photo_filter_end],
  ])("unsets filter: %s", (filter, key) => {
    const p = fakeProps();
    const config = fakeWebAppConfig();
    setConfigDispatch(p, [config]);
    const instance = new ImageFilterMenu(p);
    setStateSync(instance);
    instance.state = { ...instance.state, beginDate: "2001-01-03", endDate: "2001-01-03" };
    instance.setDatetime(filter)(inputEvent(""));
    expect(instance.state[filter]).toEqual(undefined);
    expect(editSpy).toHaveBeenCalledWith(config, { [key]: undefined });
    expect(saveSpy).toHaveBeenCalledWith(config.uuid);
  });

  it.each<[
    "beginTime" | "endTime"
  ]>([
    ["beginTime"],
    ["endTime"],
  ])("doesn't set filter: %s", filter => {
    const p = fakeProps();
    const config = fakeWebAppConfig();
    setConfigDispatch(p, [config]);
    const instance = new ImageFilterMenu(p);
    setStateSync(instance);
    instance.setDatetime(filter)(inputEvent("05:00"));
    expect(instance.state[filter]).toEqual("05:00");
    expect(editSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("loads values from config", () => {
    mockConfig.body.photo_filter_begin = "2001-01-03T05:00:00.000Z";
    mockConfig.body.photo_filter_end = "2001-01-03T06:00:00.000Z";
    const instance = new ImageFilterMenu(fakeProps());
    setStateSync(instance);
    instance.updateState();
    expect(instance.state).toEqual({
      beginDate: "2001-01-03", beginTime: "05:00",
      endDate: "2001-01-03", endTime: "06:00",
    });
  });

  it("commits slider change", () => {
    const p = fakeProps();
    const config = fakeWebAppConfig();
    setConfigDispatch(p, [config]);
    p.getConfigValue = () => undefined;
    p.imageAgeInfo.newestDate = "2001-01-03T05:00:00.000Z";
    const instance = new ImageFilterMenu(p);
    setStateSync(instance);
    instance.sliderChange(1);
    expect(instance.state.slider).toEqual(undefined);
    expect(editSpy).toHaveBeenCalledWith(config, {
      photo_filter_begin: "2001-01-03T00:00:00.000Z",
      photo_filter_end: "2001-01-04T00:00:00.000Z",
    });
    expect(saveSpy).toHaveBeenCalledWith(config.uuid);
  });

  it("doesn't update config", () => {
    const p = fakeProps();
    setConfigDispatch(p, []);
    p.getConfigValue = () => 1;
    p.imageAgeInfo.newestDate = "2001-01-03T05:00:00.000Z";
    const instance = new ImageFilterMenu(p);
    setStateSync(instance);
    instance.sliderChange(1);
    expect(instance.state.slider).toEqual(undefined);
    expect(editSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("expands date range into past", () => {
    mockConfig.body.photo_filter_begin = "2001-01-01T05:00:00.000Z";
    mockConfig.body.photo_filter_end = "";
    const p = fakeProps();
    p.imageAgeInfo = { newestDate: "2001-01-10T00:00:00.000Z", toOldest: 1 };
    const instance = new ImageFilterMenu(p);
    setStateSync(instance);
    instance.updateState();
    expect(instance.imageAgeInfo).toEqual({
      newestDate: "2001-01-10T00:00:00.000Z", toOldest: 9,
    });
  });

  it("expands date range into future", () => {
    mockConfig.body.photo_filter_begin = "2001-01-20T05:00:00.000Z";
    mockConfig.body.photo_filter_end = "";
    const p = fakeProps();
    p.imageAgeInfo = { newestDate: "2001-01-10T00:00:00.000Z", toOldest: 1 };
    const instance = new ImageFilterMenu(p);
    setStateSync(instance);
    instance.updateState();
    expect(instance.imageAgeInfo).toEqual({
      newestDate: "2001-01-21T00:00:00.000Z", toOldest: 13,
    });
  });

  it("steps date", () => {
    mockConfig.body.photo_filter_begin = "2001-01-03T05:00:00.000Z";
    const p = fakeProps();
    const config = fakeWebAppConfig();
    setConfigDispatch(p, [config]);
    const instance = new ImageFilterMenu(p);
    setStateSync(instance);
    instance.updateState();
    instance.dateStep(1)();
    expect(editSpy).toHaveBeenCalledWith(config, {
      photo_filter_begin: "2001-01-04T00:00:00.000Z",
      photo_filter_end: "2001-01-05T00:00:00.000Z",
    });
    expect(saveSpy).toHaveBeenCalledWith(config.uuid);
  });

  it("choses newest date", () => {
    mockConfig.body.photo_filter_begin = "";
    const p = fakeProps();
    p.imageAgeInfo = { newestDate: "2001-01-10T00:00:00.000Z", toOldest: 1 };
    const config = fakeWebAppConfig();
    setConfigDispatch(p, [config]);
    const instance = new ImageFilterMenu(p);
    setStateSync(instance);
    instance.newest();
    expect(editSpy).toHaveBeenCalledWith(config, {
      photo_filter_begin: "2001-01-10T00:00:00.000Z",
      photo_filter_end: "2001-01-11T00:00:00.000Z",
    });
    expect(saveSpy).toHaveBeenCalledWith(config.uuid);
  });

  it("choses oldest date", () => {
    mockConfig.body.photo_filter_begin = "";
    const p = fakeProps();
    p.imageAgeInfo = { newestDate: "2001-01-10T00:00:00.000Z", toOldest: 3 };
    const config = fakeWebAppConfig();
    setConfigDispatch(p, [config]);
    const instance = new ImageFilterMenu(p);
    setStateSync(instance);
    instance.oldest();
    expect(editSpy).toHaveBeenCalledWith(config, {
      photo_filter_begin: "2001-01-06T00:00:00.000Z",
      photo_filter_end: "2001-01-07T00:00:00.000Z",
    });
    expect(saveSpy).toHaveBeenCalledWith(config.uuid);
  });

  it("gets image index", () => {
    const p = fakeProps();
    p.imageAgeInfo = { newestDate: "2001-01-10T00:00:00.000Z", toOldest: 3 };
    const instance = new ImageFilterMenu(p);
    const image = fakeImage();
    image.body.created_at = "2001-01-08T00:00:00.000Z";
    expect(instance.getImageOffset(image)).toEqual(1);
  });

  it("changes slider", () => {
    const p = fakeProps();
    p.imageAgeInfo = { newestDate: "2001-01-10T00:00:00.000Z", toOldest: 2 };
    render(<ImageFilterMenu {...p} />);
    expect(screen.getByTestId("slider-value")).toHaveTextContent("2");
    fireEvent.click(screen.getByText("change slider"));
    expect(screen.getByTestId("slider-value")).toHaveTextContent("1");
  });

  it("displays slider labels", () => {
    mockConfig.body.photo_filter_begin = "2001-01-03T05:00:00.000Z";
    const p = fakeProps();
    p.imageAgeInfo.newestDate = "2001-01-03T00:00:00.000Z";
    render(<ImageFilterMenu {...p} />);
    ["Jan-1", "Jan-2", "Jan-3"].map(date =>
      expect(screen.getByText(date)).toBeInTheDocument());
  });
});
