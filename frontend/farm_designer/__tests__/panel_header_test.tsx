let mockDev = false;
jest.mock("../../settings/dev/dev_support", () => ({
  DevSettings: {
    futureFeaturesEnabled: () => mockDev,
  }
}));

import { fakeState } from "../../__test_support__/fake_state";
const mockState = fakeState();
jest.mock("../../redux/store", () => ({ store: { getState: () => mockState } }));

import React from "react";
import { shallow, mount, ReactWrapper } from "enzyme";
import { DesignerNavTabs, DesignerNavTabsProps } from "../panel_header";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import {
  fakeFarmwareInstallation, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { Path } from "../../internal_urls";
import { fakeDesignerState } from "../../__test_support__/fake_designer_state";
import { Actions } from "../../constants";
import { mockDispatch } from "../../__test_support__/fake_dispatch";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expectOnlyOneActiveIcon = (wrapper: ReactWrapper<any>) =>
  expect(wrapper.html().match(/active/)?.length).toEqual(1);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expectActive = (wrapper: ReactWrapper<any>, slug: string) =>
  expect(wrapper.find(`#${slug}`).first().hasClass("active")).toBeTruthy();

describe("<DesignerNavTabs />", () => {
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
    const wrapper = mount(<DesignerNavTabs {...p} />);
    expectOnlyOneActiveIcon(wrapper);
    expectActive(wrapper, slug);
    wrapper.find("#" + slug).first().simulate("click");
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
    const wrapper = mount(<DesignerNavTabs {...p} />);
    expectActive(wrapper, "weeds");
    wrapper.find("#plants").first().simulate("click");
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
    const wrapper = mount(<DesignerNavTabs {...p} />);
    expectOnlyOneActiveIcon(wrapper);
    expectActive(wrapper, "plants");
    wrapper.find("a").first().simulate("click");
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: false,
    });
    p.designer.panelOpen = false;
    wrapper.setProps(p);
    expectOnlyOneActiveIcon(wrapper);
    expect(wrapper.find("a").first().hasClass("active")).toBeTruthy();
  });

  it("shows inactive icons for logs page", () => {
    location.pathname = Path.mock(Path.logs());
    const wrapper = mount(<DesignerNavTabs {...fakeProps()} />);
    expect(wrapper.find(".active").length).toEqual(0);
  });

  it("shows active zones icon", () => {
    location.pathname = Path.mock(Path.zones());
    mockDev = true;
    const wrapper = mount(<DesignerNavTabs {...fakeProps()} />);
    expectOnlyOneActiveIcon(wrapper);
    expectActive(wrapper, "zones");
  });

  it("shows sensors tab", () => {
    const config = fakeWebAppConfig();
    config.body.hide_sensors = false;
    mockState.resources = buildResourceIndex([config]);
    const wrapper = mount(<DesignerNavTabs {...fakeProps()} />);
    expect(wrapper.html()).toContain("sensors");
  });

  it("doesn't show sensors tab", () => {
    const config = fakeWebAppConfig();
    config.body.hide_sensors = true;
    mockState.resources = buildResourceIndex([config]);
    const wrapper = mount(<DesignerNavTabs {...fakeProps()} />);
    expect(wrapper.html()).not.toContain("sensors");
  });

  it("renders scroll indicator", () => {
    Object.defineProperty(document, "getElementsByClassName", {
      value: () => [{}, { scrollWidth: 100, scrollLeft: 0, clientWidth: 75 }],
      configurable: true
    });
    const wrapper = shallow(<DesignerNavTabs {...fakeProps()} />);
    expect(wrapper.html()).toContain("scroll-indicator");
  });

  it("doesn't render scroll indicator when wide", () => {
    Object.defineProperty(document, "getElementsByClassName", {
      value: () => [{}, { scrollWidth: 500, scrollLeft: 0, clientWidth: 750 }],
      configurable: true
    });
    const wrapper = shallow(<DesignerNavTabs {...fakeProps()} />);
    expect(wrapper.html()).not.toContain("scroll-indicator");
  });

  it("doesn't render scroll indicator when at end", () => {
    Object.defineProperty(document, "getElementsByClassName", {
      value: () => [{}, { scrollWidth: 100, scrollLeft: 25, clientWidth: 75 }],
      configurable: true
    });
    const wrapper = shallow(<DesignerNavTabs {...fakeProps()} />);
    expect(wrapper.html()).not.toContain("scroll-indicator");
  });

  it("calls onScroll", () => {
    const wrapper = shallow<DesignerNavTabs>(<DesignerNavTabs {...fakeProps()} />);
    wrapper.setState({ atEnd: false });
    wrapper.find(".panel-tabs").simulate("scroll");
    expect(wrapper.state().atEnd).toEqual(true);
  });

  it("shows farmware tab", () => {
    mockState.resources = buildResourceIndex([fakeFarmwareInstallation()]);
    const wrapper = mount(<DesignerNavTabs {...fakeProps()} />);
    expect(wrapper.html()).toContain("farmware");
  });
});
