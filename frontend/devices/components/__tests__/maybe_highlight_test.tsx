jest.mock("../../actions", () => ({
  toggleControlPanel: jest.fn(),
  bulkToggleControlPanel: jest.fn(),
}));

import { fakeState } from "../../../__test_support__/fake_state";
const mockState = fakeState();
jest.mock("../../../redux/store", () => ({
  store: { getState: () => mockState },
}));

import * as React from "react";
import { mount } from "enzyme";
import {
  Highlight, HighlightProps, maybeHighlight, maybeOpenPanel, highlight,
} from "../maybe_highlight";
import { DeviceSetting } from "../../../constants";
import { panelState } from "../../../__test_support__/control_panel_state";
import { toggleControlPanel, bulkToggleControlPanel } from "../../actions";

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

  it("doesn't hide: matches search term", () => {
    mockState.resources.consumers.farm_designer.settingsSearchTerm = "motor";
    const wrapper = mount(<Highlight {...fakeProps()} />);
    expect(wrapper.find("div").first().props().hidden).toEqual(false);
  });

  it("hides", () => {
    mockState.resources.consumers.farm_designer.settingsSearchTerm = "encoder";
    const wrapper = mount(<Highlight {...fakeProps()} />);
    expect(wrapper.find("div").first().props().hidden).toEqual(true);
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
    maybeOpenPanel(panelState())(jest.fn());
    expect(toggleControlPanel).toHaveBeenCalledWith("motors");
    jest.resetAllMocks();
    maybeOpenPanel(panelState())(jest.fn());
    expect(toggleControlPanel).not.toHaveBeenCalled();
  });

  it("doesn't open panel: already open", () => {
    location.search = "?highlight=motors";
    const panels = panelState();
    panels.motors = true;
    maybeOpenPanel(panels)(jest.fn());
    expect(toggleControlPanel).not.toHaveBeenCalled();
  });

  it("doesn't open panel: no search term", () => {
    location.search = "";
    maybeOpenPanel(panelState())(jest.fn());
    expect(toggleControlPanel).not.toHaveBeenCalled();
  });

  it("closes other panels", () => {
    location.search = "?highlight=motors";
    maybeOpenPanel(panelState(), true)(jest.fn());
    expect(toggleControlPanel).toHaveBeenCalledWith("motors");
    expect(bulkToggleControlPanel).toHaveBeenCalledWith(false, true);
  });
});
