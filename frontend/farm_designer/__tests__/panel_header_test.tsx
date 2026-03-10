import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { DesignerNavTabs, DesignerNavTabsProps } from "../panel_header";
import { fakeState } from "../../__test_support__/fake_state";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import {
  fakeFarmwareInstallation, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { Path } from "../../internal_urls";
import { fakeDesignerState } from "../../__test_support__/fake_designer_state";
import { Actions } from "../../constants";
import { mockDispatch } from "../../__test_support__/fake_dispatch";
import { store } from "../../redux/store";
import { DevSettings } from "../../settings/dev/dev_support";

let mockDev = false;
let mockState = fakeState();

let futureFeaturesEnabledSpy: jest.SpyInstance;
let originalGetState: typeof store.getState;

const expectOnlyOneActiveIcon = (container: HTMLElement) =>
  expect(container.querySelectorAll(".active").length).toEqual(1);

const expectActive = (container: HTMLElement, slug: string) =>
  expect(container.querySelector(`#${slug}`)?.classList.contains("active"))
    .toBeTruthy();

describe("<DesignerNavTabs />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDev = false;
    mockState = fakeState();
    futureFeaturesEnabledSpy =
      jest.spyOn(DevSettings, "futureFeaturesEnabled")
        .mockImplementation(() => mockDev);
    originalGetState = store.getState;
    (store as unknown as { getState: () => typeof mockState }).getState =
      () => mockState;
  });

  afterEach(() => {
    cleanup();
    futureFeaturesEnabledSpy.mockRestore();
    (store as unknown as { getState: typeof store.getState }).getState =
      originalGetState;
  });

  const fakeProps = (): DesignerNavTabsProps => ({
    dispatch: jest.fn(),
    designer: fakeDesignerState(),
    hidden: false,
  });

  it.each<[string, string]>([
    ["sequences", Path.sequencePage()],
    ["plants", Path.plants()],
    ["plants", Path.plantTemplates(1)],
    ["tools", Path.toolSlots()],
  ])("closes panel when active %s icon is clicked", (slug, path) => {
    location.pathname = Path.mock(path);
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const { container } = render(<DesignerNavTabs {...p} />);
    expectOnlyOneActiveIcon(container);
    expectActive(container, slug);
    const tab = container.querySelector(`#${slug}`);
    if (!tab) { throw new Error("Expected tab"); }
    fireEvent.click(tab);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: false,
    });
  });

  it("opens panel when inactive tab is clicked", () => {
    location.pathname = Path.mock(Path.weeds());
    const p = fakeProps();
    p.designer.panelOpen = true;
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const { container } = render(<DesignerNavTabs {...p} />);
    expectActive(container, "weeds");
    const tab = container.querySelector("#plants");
    if (!tab) { throw new Error("Expected plants tab"); }
    fireEvent.click(tab);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: true,
    });
  });

  it("closes panel when map icon is clicked", () => {
    location.pathname = Path.mock(Path.plants());
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    p.designer.panelOpen = true;
    const { container, rerender } = render(<DesignerNavTabs {...p} />);
    expectOnlyOneActiveIcon(container);
    expectActive(container, "plants");
    const map = container.querySelector("a#Map");
    if (!map) { throw new Error("Expected map tab"); }
    fireEvent.click(map);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: false,
    });
    p.designer.panelOpen = false;
    rerender(<DesignerNavTabs {...p} />);
    expectOnlyOneActiveIcon(container);
    expect(container.querySelector("a#Map")?.classList.contains("active"))
      .toBeTruthy();
  });

  it("shows inactive icons for logs page", () => {
    location.pathname = Path.mock(Path.logs());
    const { container } = render(<DesignerNavTabs {...fakeProps()} />);
    expect(container.querySelectorAll(".active").length).toEqual(0);
  });

  it("shows active zones icon", () => {
    location.pathname = Path.mock(Path.zones());
    mockDev = true;
    const { container } = render(<DesignerNavTabs {...fakeProps()} />);
    expectOnlyOneActiveIcon(container);
    expectActive(container, "zones");
  });

  it("shows sensors tab", () => {
    const config = fakeWebAppConfig();
    config.body.hide_sensors = false;
    mockState.resources = buildResourceIndex([config]);
    const { container } = render(<DesignerNavTabs {...fakeProps()} />);
    expect(container.querySelector("#sensors")).toBeTruthy();
  });

  it("doesn't show sensors tab", () => {
    const config = fakeWebAppConfig();
    config.body.hide_sensors = true;
    mockState.resources = buildResourceIndex([config]);
    const { container } = render(<DesignerNavTabs {...fakeProps()} />);
    expect(container.querySelector("#sensors")).toBeFalsy();
  });

  it("renders scroll indicator", () => {
    Object.defineProperty(document, "getElementsByClassName", {
      value: () => [{}, { scrollWidth: 100, scrollLeft: 0, clientWidth: 75 }],
      configurable: true
    });
    const { container } = render(<DesignerNavTabs {...fakeProps()} />);
    expect(container.querySelector(".scroll-indicator")).toBeTruthy();
  });

  it("doesn't render scroll indicator when wide", () => {
    Object.defineProperty(document, "getElementsByClassName", {
      value: () => [{}, { scrollWidth: 500, scrollLeft: 0, clientWidth: 750 }],
      configurable: true
    });
    const { container } = render(<DesignerNavTabs {...fakeProps()} />);
    expect(container.querySelector(".scroll-indicator")).toBeFalsy();
  });

  it("doesn't render scroll indicator when at end", () => {
    Object.defineProperty(document, "getElementsByClassName", {
      value: () => [{}, { scrollWidth: 100, scrollLeft: 25, clientWidth: 75 }],
      configurable: true
    });
    const { container } = render(<DesignerNavTabs {...fakeProps()} />);
    expect(container.querySelector(".scroll-indicator")).toBeFalsy();
  });

  it("calls onScroll", () => {
    Object.defineProperty(document, "getElementsByClassName", {
      value: () => [{}, { scrollWidth: 100, scrollLeft: 25, clientWidth: 75 }],
      configurable: true
    });
    const ref = React.createRef<DesignerNavTabs>();
    const { container } = render(<DesignerNavTabs {...fakeProps()} ref={ref} />);
    act(() => ref.current?.setState({ atEnd: false }));
    const tabs = container.querySelector(".panel-tabs");
    if (!tabs) { throw new Error("Expected panel tabs"); }
    fireEvent.scroll(tabs);
    expect(ref.current?.state.atEnd).toEqual(true);
  });

  it("shows farmware tab", () => {
    mockState.resources = buildResourceIndex([fakeFarmwareInstallation()]);
    const { container } = render(<DesignerNavTabs {...fakeProps()} />);
    expect(container.querySelector("#farmware")).toBeTruthy();
  });
});
