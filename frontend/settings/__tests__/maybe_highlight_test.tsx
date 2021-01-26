jest.mock("../toggle_section", () => ({
  toggleControlPanel: jest.fn(),
  bulkToggleControlPanel: jest.fn(),
}));

import { fakeState } from "../../__test_support__/fake_state";
const mockState = fakeState();
jest.mock("../../redux/store", () => ({
  store: { getState: () => mockState },
}));

jest.mock("../../history", () => ({ push: jest.fn() }));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  Highlight, HighlightProps, maybeHighlight, maybeOpenPanel, highlight,
  goToFbosSettings,
} from "../maybe_highlight";
import { DeviceSetting } from "../../constants";
import { toggleControlPanel, bulkToggleControlPanel } from "../toggle_section";
import { push } from "../../history";

describe("<Highlight />", () => {
  const fakeProps = (): HighlightProps => ({
    settingName: DeviceSetting.motors,
    children: <div />,
    className: "section",
  });

  it("fades highlight", () => {
    const p = fakeProps();
    const wrapper = mount<Highlight>(<Highlight {...p} />);
    wrapper.setState({ className: "highlight" });
    wrapper.instance().componentDidMount();
    expect(wrapper.state().className).toEqual("unhighlight");
  });

  it("doesn't hide: no search term", () => {
    mockState.resources.consumers.farm_designer.settingsSearchTerm = "";
    const wrapper = mount(<Highlight {...fakeProps()} />);
    expect(wrapper.find("div").first().props().hidden).toEqual(false);
  });

  it("doesn't hide: no search term, highlight doesn't match", () => {
    location.search = "?highlight=encoders";
    mockState.resources.consumers.farm_designer.settingsSearchTerm = "";
    const wrapper = mount(<Highlight {...fakeProps()} />);
    expect(wrapper.find("div").first().props().hidden).toEqual(false);
  });

  it("doesn't hide: matches search term", () => {
    mockState.resources.consumers.farm_designer.settingsSearchTerm = "motor";
    const wrapper = mount(<Highlight {...fakeProps()} />);
    expect(wrapper.find("div").first().props().hidden).toEqual(false);
  });

  it("doesn't hide: content matches search term", () => {
    mockState.resources.consumers.farm_designer.settingsSearchTerm = "speed";
    const wrapper = mount(<Highlight {...fakeProps()} />);
    expect(wrapper.find("div").first().props().hidden).toEqual(false);
  });

  it("doesn't hide: content matches highlight", () => {
    location.search = "?highlight=show_pins";
    mockState.resources.consumers.farm_designer.settingsSearchTerm = "";
    const p = fakeProps();
    p.hidden = true;
    p.settingName = DeviceSetting.otherSettings;
    const wrapper = mount(<Highlight {...p} />);
    expect(wrapper.find("div").first().props().hidden).toEqual(false);
  });

  it("doesn't hide: matches highlight", () => {
    location.search = "?highlight=show_pins";
    mockState.resources.consumers.farm_designer.settingsSearchTerm = "";
    const p = fakeProps();
    p.className = undefined;
    p.settingName = DeviceSetting.showPins;
    const wrapper = mount(<Highlight {...p} />);
    expect(wrapper.find("div").first().props().hidden).toEqual(false);
  });

  it("hides: not section header", () => {
    mockState.resources.consumers.farm_designer.settingsSearchTerm = "speed";
    const p = fakeProps();
    p.className = undefined;
    const wrapper = mount(<Highlight {...p} />);
    expect(wrapper.find("div").first().props().hidden).toEqual(true);
  });

  it("hides: doesn't match search term", () => {
    mockState.resources.consumers.farm_designer.settingsSearchTerm = "encoder";
    const wrapper = mount(<Highlight {...fakeProps()} />);
    expect(wrapper.find("div").first().props().hidden).toEqual(true);
  });

  it("hides: no match", () => {
    location.search = "?highlight=motors";
    mockState.resources.consumers.farm_designer.settingsSearchTerm = "";
    const p = fakeProps();
    p.settingName = DeviceSetting.showPins;
    const wrapper = mount(<Highlight {...p} />);
    expect(wrapper.find("div").first().props().hidden).toEqual(true);
  });

  it("shows anchor link icon on hover", () => {
    const wrapper = shallow<Highlight>(<Highlight {...fakeProps()} />);
    expect(wrapper.state().hovered).toEqual(false);
    expect(wrapper.find("i").last().hasClass("hovered")).toEqual(false);
    wrapper.simulate("mouseEnter");
    expect(wrapper.state().hovered).toEqual(true);
    expect(wrapper.find("i").last().hasClass("hovered")).toEqual(true);
  });

  it("hides anchor link icon on unhover", () => {
    const wrapper = shallow<Highlight>(<Highlight {...fakeProps()} />);
    wrapper.setState({ hovered: true });
    expect(wrapper.find("i").last().hasClass("hovered")).toEqual(true);
    wrapper.simulate("mouseLeave");
    expect(wrapper.state().hovered).toEqual(false);
    expect(wrapper.find("i").last().hasClass("hovered")).toEqual(false);
  });

  it("adds anchor link to url bar", () => {
    const wrapper = mount(<Highlight {...fakeProps()} />);
    wrapper.find("i").last().simulate("click");
    expect(push).toHaveBeenCalledWith("/app/designer/settings?highlight=motors");
  });

  it("doesn't show anchor for non-setting sections", () => {
    const p = fakeProps();
    p.settingName = DeviceSetting.axisHeadingLabels;
    const wrapper = mount(<Highlight {...p} />);
    expect(wrapper.html()).not.toContain("anchor");
  });
});

describe("maybeHighlight()", () => {
  beforeEach(() => {
    highlight.opened = false;
    highlight.highlighted = false;
  });

  it("highlights only once", () => {
    location.search = "?highlight=motors";
    expect(maybeHighlight(DeviceSetting.motors)).toEqual("highlight");
    expect(maybeHighlight(DeviceSetting.motors)).toEqual("");
  });

  it("doesn't highlight: different setting", () => {
    location.search = "?highlight=name";
    expect(maybeHighlight(DeviceSetting.motors)).toEqual("");
  });

  it("doesn't highlight: no matches", () => {
    location.search = "?highlight=na";
    expect(maybeHighlight(DeviceSetting.motors)).toEqual("");
  });
});

describe("maybeOpenPanel()", () => {
  beforeEach(() => {
    highlight.opened = false;
    highlight.highlighted = false;
  });

  it("opens panel only once", () => {
    location.search = "?highlight=motors";
    maybeOpenPanel()(jest.fn());
    expect(toggleControlPanel).toHaveBeenCalledWith("motors");
    jest.resetAllMocks();
    maybeOpenPanel()(jest.fn());
    expect(toggleControlPanel).not.toHaveBeenCalled();
  });

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
});

describe("goToFbosSettings()", () => {
  it("renders correct path", () => {
    goToFbosSettings();
    expect(push).toHaveBeenCalledWith(
      "/app/designer/settings?highlight=farmbot_os");
  });
});
