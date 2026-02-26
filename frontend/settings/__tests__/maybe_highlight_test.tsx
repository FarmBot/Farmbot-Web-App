import { fakeState } from "../../__test_support__/fake_state";
let mockState = fakeState();

import React from "react";
import { act, fireEvent, render } from "@testing-library/react";
import {
  Highlight, HighlightProps, maybeOpenPanel,
} from "../maybe_highlight";
import { Actions, DeviceSetting } from "../../constants";
import * as toggleSection from "../toggle_section";
import { Path } from "../../internal_urls";
import { store } from "../../redux/store";

const settingNode = (container: HTMLElement) =>
  container.querySelector(".setting") as HTMLElement;

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
    const { container } = render(<Highlight {...p} />);
    act(() => jest.runAllTimers());
    expect(settingNode(container).classList.contains("unhighlight")).toBeTruthy();
    jest.useRealTimers();
  });

  it("doesn't hide: no search term", () => {
    mockState.app.settingsSearchTerm = "";
    const { container } = render(<Highlight {...fakeProps()} />);
    expect(settingNode(container).hidden).toEqual(false);
  });

  it("doesn't hide: no search term, highlight doesn't match", () => {
    location.search = "?highlight=encoders";
    mockState.app.settingsSearchTerm = "";
    const { container } = render(<Highlight {...fakeProps()} />);
    expect(settingNode(container).hidden).toEqual(false);
  });

  it("doesn't hide: matches search term", () => {
    mockState.app.settingsSearchTerm = "motor";
    const { container } = render(<Highlight {...fakeProps()} />);
    expect(settingNode(container).hidden).toEqual(false);
  });

  it("doesn't hide: content matches search term", () => {
    mockState.app.settingsSearchTerm = "speed";
    const { container } = render(<Highlight {...fakeProps()} />);
    expect(settingNode(container).hidden).toEqual(false);
  });

  it("doesn't hide: content matches highlight", () => {
    location.search = "?highlight=show_pins";
    mockState.app.settingsSearchTerm = "";
    const p = fakeProps();
    p.hidden = true;
    p.settingName = DeviceSetting.otherSettings;
    const { container } = render(<Highlight {...p} />);
    expect(settingNode(container).hidden).toEqual(false);
  });

  it("doesn't hide: matches highlight", () => {
    location.search = "?highlight=show_pins";
    mockState.app.settingsSearchTerm = "";
    const p = fakeProps();
    p.className = undefined;
    p.settingName = DeviceSetting.showPins;
    const { container } = render(<Highlight {...p} />);
    expect(settingNode(container).hidden).toEqual(false);
  });

  it("hides: not section header", () => {
    mockState.app.settingsSearchTerm = "speed";
    const p = fakeProps();
    p.className = undefined;
    const { container } = render(<Highlight {...p} />);
    expect(settingNode(container).hidden).toEqual(true);
  });

  it("hides: doesn't match search term", () => {
    mockState.app.settingsSearchTerm = "encoder";
    const { container } = render(<Highlight {...fakeProps()} />);
    expect(settingNode(container).hidden).toEqual(true);
  });

  it("hides: no match", () => {
    location.search = "?highlight=motors";
    mockState.app.settingsSearchTerm = "";
    const p = fakeProps();
    p.settingName = DeviceSetting.showPins;
    const { container } = render(<Highlight {...p} />);
    expect(settingNode(container).hidden).toEqual(true);
  });

  it("shows anchor link icon on hover", () => {
    const { container } = render(<Highlight {...fakeProps()} />);
    const setting = settingNode(container);
    const icon = setting.querySelector(".fa-anchor") as HTMLElement;
    expect(icon.classList.contains("hovered")).toEqual(false);
    fireEvent.mouseEnter(setting);
    expect(icon.classList.contains("hovered")).toEqual(true);
    fireEvent.mouseLeave(setting);
    expect(icon.classList.contains("hovered")).toEqual(false);
  });

  it("adds anchor link to url bar", () => {
    const { container } = render(<Highlight {...fakeProps()} />);
    const setting = settingNode(container);
    const icon = setting.querySelector(".fa-anchor");
    if (!icon) { throw new Error("Expected anchor icon"); }
    fireEvent.click(icon);
    expect(mockNavigate).toHaveBeenCalledWith(Path.settings("motors"));
  });

  it("doesn't show anchor for non-setting sections", () => {
    const p = fakeProps();
    p.settingName = DeviceSetting.axisHeadingLabels;
    const { container } = render(<Highlight {...p} />);
    expect(container.innerHTML).not.toContain("anchor");
  });

  it("isolates setting", () => {
    location.search = "?only=show_pins";
    mockState.app.settingsSearchTerm = "";
    const p = fakeProps();
    p.settingName = DeviceSetting.showPins;
    const { container } = render(<Highlight {...p} />);
    expect(settingNode(container).hidden).toEqual(false);
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
