jest.mock("../toggle_section", () => ({
  toggleControlPanel: jest.fn(),
  bulkToggleControlPanel: jest.fn(),
}));

import { fakeState } from "../../__test_support__/fake_state";
const mockState = fakeState();
jest.mock("../../redux/store", () => ({
  store: { getState: () => mockState },
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  Highlight, HighlightProps, maybeOpenPanel,
} from "../maybe_highlight";
import { Actions, DeviceSetting } from "../../constants";
import { toggleControlPanel, bulkToggleControlPanel } from "../toggle_section";
import { Path } from "../../internal_urls";
import { mountWithContext } from "../../__test_support__/mount_with_context";

describe("<Highlight />", () => {
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
    expect(wrapper.find("div").first().hasClass("unhighlight")).toBeTruthy();
  });

  it("doesn't hide: no search term", () => {
    mockState.app.settingsSearchTerm = "";
    const wrapper = mount(<Highlight {...fakeProps()} />);
    expect(wrapper.find("div").first().props().hidden).toEqual(false);
  });

  it("doesn't hide: no search term, highlight doesn't match", () => {
    location.search = "?highlight=encoders";
    mockState.app.settingsSearchTerm = "";
    const wrapper = mount(<Highlight {...fakeProps()} />);
    expect(wrapper.find("div").first().props().hidden).toEqual(false);
  });

  it("doesn't hide: matches search term", () => {
    mockState.app.settingsSearchTerm = "motor";
    const wrapper = mount(<Highlight {...fakeProps()} />);
    expect(wrapper.find("div").first().props().hidden).toEqual(false);
  });

  it("doesn't hide: content matches search term", () => {
    mockState.app.settingsSearchTerm = "speed";
    const wrapper = mount(<Highlight {...fakeProps()} />);
    expect(wrapper.find("div").first().props().hidden).toEqual(false);
  });

  it("doesn't hide: content matches highlight", () => {
    location.search = "?highlight=show_pins";
    mockState.app.settingsSearchTerm = "";
    const p = fakeProps();
    p.hidden = true;
    p.settingName = DeviceSetting.otherSettings;
    const wrapper = mount(<Highlight {...p} />);
    expect(wrapper.find("div").first().props().hidden).toEqual(false);
  });

  it("doesn't hide: matches highlight", () => {
    location.search = "?highlight=show_pins";
    mockState.app.settingsSearchTerm = "";
    const p = fakeProps();
    p.className = undefined;
    p.settingName = DeviceSetting.showPins;
    const wrapper = mount(<Highlight {...p} />);
    expect(wrapper.find("div").first().props().hidden).toEqual(false);
  });

  it("hides: not section header", () => {
    mockState.app.settingsSearchTerm = "speed";
    const p = fakeProps();
    p.className = undefined;
    const wrapper = mount(<Highlight {...p} />);
    expect(wrapper.find("div").first().props().hidden).toEqual(true);
  });

  it("hides: doesn't match search term", () => {
    mockState.app.settingsSearchTerm = "encoder";
    const wrapper = mount(<Highlight {...fakeProps()} />);
    expect(wrapper.find("div").first().props().hidden).toEqual(true);
  });

  it("hides: no match", () => {
    location.search = "?highlight=motors";
    mockState.app.settingsSearchTerm = "";
    const p = fakeProps();
    p.settingName = DeviceSetting.showPins;
    const wrapper = mount(<Highlight {...p} />);
    expect(wrapper.find("div").first().props().hidden).toEqual(true);
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
    expect(wrapper.find("div").first().props().hidden).toEqual(false);
  });
});

describe("maybeOpenPanel()", () => {
  it("doesn't open panel: no search term", () => {
    location.search = "";
    maybeOpenPanel()(jest.fn());
    expect(toggleControlPanel).not.toHaveBeenCalled();
  });

  it("closes other panels", () => {
    location.search = "?highlight=motors";
    maybeOpenPanel()(jest.fn());
    expect(toggleControlPanel).toHaveBeenCalledWith("motors");
    expect(bulkToggleControlPanel).toHaveBeenCalledWith(false);
  });

  it("opens all panels", () => {
    location.search = "?search=motors";
    maybeOpenPanel()(jest.fn());
    expect(toggleControlPanel).not.toHaveBeenCalled();
    expect(bulkToggleControlPanel).toHaveBeenCalledWith(true);
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
