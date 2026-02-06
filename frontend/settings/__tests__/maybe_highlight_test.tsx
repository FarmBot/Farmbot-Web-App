jest.unmock("../maybe_highlight");

import { fakeState } from "../../__test_support__/fake_state";
let mockState = fakeState();

import React from "react";
import { mount, shallow } from "enzyme";
import {
  Highlight, HighlightProps, maybeOpenPanel,
} from "../maybe_highlight";
import { Actions, DeviceSetting } from "../../constants";
import * as toggleSection from "../toggle_section";
import { Path } from "../../internal_urls";
import { mountWithContext } from "../../__test_support__/mount_with_context";
import { store } from "../../redux/store";

const settingNode = (wrapper: ReturnType<typeof mount>) =>
  wrapper.find(".setting").first();

let toggleControlPanelSpy: jest.SpyInstance;
let bulkToggleControlPanelSpy: jest.SpyInstance;
let originalGetState: typeof store.getState;

beforeEach(() => {
  jest.clearAllMocks();
  mockState = fakeState();
  originalGetState = store.getState;
  (store as unknown as { getState: () => typeof mockState }).getState = () => mockState;
  toggleControlPanelSpy = jest.spyOn(toggleSection, "toggleControlPanel")
    .mockImplementation(jest.fn());
  bulkToggleControlPanelSpy = jest.spyOn(toggleSection, "bulkToggleControlPanel")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  (store as unknown as { getState: typeof store.getState }).getState = originalGetState;
  toggleControlPanelSpy.mockRestore();
  bulkToggleControlPanelSpy.mockRestore();
});

describe("<Highlight />", () => {
  beforeEach(() => {
    jest.useRealTimers();
    location.search = "";
    mockState.app.settingsSearchTerm = "";
  });

  const fakeProps = (): HighlightProps => ({
    settingName: DeviceSetting.motors,
    children: <div />,
    className: "section",
  });

  it("fades highlight", () => {
    location.search = "?highlight=motors";
    jest.useFakeTimers();
    const p = fakeProps();
    const wrapper = mount(<Highlight {...p} />);
    jest.runAllTimers();
    wrapper.update();
    expect(settingNode(wrapper).hasClass("unhighlight")).toBeTruthy();
    jest.useRealTimers();
  });

  it("doesn't hide: no search term", () => {
    mockState.app.settingsSearchTerm = "";
    const wrapper = mount(<Highlight {...fakeProps()} />);
    expect(settingNode(wrapper).props().hidden).toEqual(false);
  });

  it("doesn't hide: no search term, highlight doesn't match", () => {
    location.search = "?highlight=encoders";
    mockState.app.settingsSearchTerm = "";
    const wrapper = mount(<Highlight {...fakeProps()} />);
    expect(settingNode(wrapper).props().hidden).toEqual(false);
  });

  it("doesn't hide: matches search term", () => {
    mockState.app.settingsSearchTerm = "motor";
    const wrapper = mount(<Highlight {...fakeProps()} />);
    expect(settingNode(wrapper).props().hidden).toEqual(false);
  });

  it("doesn't hide: content matches search term", () => {
    mockState.app.settingsSearchTerm = "speed";
    const wrapper = mount(<Highlight {...fakeProps()} />);
    expect(settingNode(wrapper).props().hidden).toEqual(false);
  });

  it("doesn't hide: content matches highlight", () => {
    location.search = "?highlight=show_pins";
    mockState.app.settingsSearchTerm = "";
    const p = fakeProps();
    p.hidden = true;
    p.settingName = DeviceSetting.otherSettings;
    const wrapper = mount(<Highlight {...p} />);
    expect(settingNode(wrapper).props().hidden).toEqual(false);
  });

  it("doesn't hide: matches highlight", () => {
    location.search = "?highlight=show_pins";
    mockState.app.settingsSearchTerm = "";
    const p = fakeProps();
    p.className = undefined;
    p.settingName = DeviceSetting.showPins;
    const wrapper = mount(<Highlight {...p} />);
    expect(settingNode(wrapper).props().hidden).toEqual(false);
  });

  it("hides: not section header", () => {
    mockState.app.settingsSearchTerm = "speed";
    const p = fakeProps();
    p.className = undefined;
    const wrapper = mount(<Highlight {...p} />);
    expect(settingNode(wrapper).props().hidden).toEqual(true);
  });

  it("hides: doesn't match search term", () => {
    mockState.app.settingsSearchTerm = "encoder";
    const wrapper = mount(<Highlight {...fakeProps()} />);
    expect(settingNode(wrapper).props().hidden).toEqual(true);
  });

  it("hides: no match", () => {
    location.search = "?highlight=motors";
    mockState.app.settingsSearchTerm = "";
    const p = fakeProps();
    p.settingName = DeviceSetting.showPins;
    const wrapper = mount(<Highlight {...p} />);
    expect(settingNode(wrapper).props().hidden).toEqual(true);
  });

  it("shows anchor link icon on hover", () => {
    const wrapper = shallow<Highlight>(<Highlight {...fakeProps()} />);
    expect(wrapper.find("i").last().hasClass("hovered")).toEqual(false);
    wrapper.simulate("mouseEnter");
    expect(wrapper.find("i").last().hasClass("hovered")).toEqual(true);
    wrapper.simulate("mouseLeave");
    expect(wrapper.find("i").last().hasClass("hovered")).toEqual(false);
  });

  it("adds anchor link to url bar", () => {
    const wrapper = mountWithContext(<Highlight {...fakeProps()} />);
    wrapper.find("i").last().simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.settings("motors"));
  });

  it("doesn't show anchor for non-setting sections", () => {
    const p = fakeProps();
    p.settingName = DeviceSetting.axisHeadingLabels;
    const wrapper = mount(<Highlight {...p} />);
    expect(wrapper.html()).not.toContain("anchor");
  });

  it("isolates setting", () => {
    location.search = "?only=show_pins";
    mockState.app.settingsSearchTerm = "";
    const p = fakeProps();
    p.settingName = DeviceSetting.showPins;
    const wrapper = mount(<Highlight {...p} />);
    expect(settingNode(wrapper).props().hidden).toEqual(false);
  });
});

describe("maybeOpenPanel()", () => {
  beforeEach(() => {
    location.search = "";
  });

  it("doesn't open panel: no search term", () => {
    location.search = "";
    maybeOpenPanel()(jest.fn());
    expect(toggleControlPanelSpy).not.toHaveBeenCalled();
  });

  it("closes other panels", () => {
    location.search = "?highlight=motors";
    maybeOpenPanel()(jest.fn());
    expect(toggleControlPanelSpy).toHaveBeenCalledWith("motors");
    expect(bulkToggleControlPanelSpy).toHaveBeenCalledWith(false);
  });

  it("opens all panels", () => {
    location.search = "?search=motors";
    maybeOpenPanel()(jest.fn());
    expect(toggleControlPanelSpy).not.toHaveBeenCalled();
    expect(bulkToggleControlPanelSpy).toHaveBeenCalledWith(true);
  });

  it("opens photos panels", () => {
    location.search = "?highlight=detection_blur";
    const dispatch = jest.fn();
    maybeOpenPanel("photos")(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.BULK_TOGGLE_PHOTOS_PANEL, payload: false,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_PHOTOS_PANEL_OPTION, payload: "detection",
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_PHOTOS_PANEL_OPTION, payload: "detectionPP",
    });
  });
});
