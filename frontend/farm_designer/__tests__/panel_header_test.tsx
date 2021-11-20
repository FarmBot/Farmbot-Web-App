import { Path } from "../../internal_urls";
let mockPath = Path.mock(Path.plants());
jest.mock("../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
}));

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
import { DesignerNavTabs } from "../panel_header";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import {
  fakeFarmwareInstallation,
} from "../../__test_support__/fake_state/resources";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expectOnlyOneActiveIcon = (wrapper: ReactWrapper<any>) =>
  expect(wrapper.html().match(/active/)?.length).toEqual(1);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expectColor = (wrapper: ReactWrapper<any>, color: string) =>
  expect(wrapper.find(".panel-nav").hasClass(`${color}-panel`)).toBeTruthy();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expectActive = (wrapper: ReactWrapper<any>, slug: string) =>
  expect(wrapper.find(`#${slug}`).first().hasClass("active")).toBeTruthy();

describe("<DesignerNavTabs />", () => {
  it.each<[string, string, string]>([
    ["map", Path.designer(), "gray"],
    ["plants", Path.plants(), "green"],
    ["plants", Path.plantTemplates(1), "green"],
    ["tools", Path.toolSlots(), "gray"],
  ])("shows active %s icon", (slug, path, color) => {
    mockPath = Path.mock(path);
    const wrapper = mount(<DesignerNavTabs />);
    expectOnlyOneActiveIcon(wrapper);
    expectColor(wrapper, color);
    expectActive(wrapper, slug);
  });

  it("shows inactive icons for sequences page", () => {
    mockPath = Path.mock(Path.sequencePage());
    const wrapper = mount(<DesignerNavTabs />);
    expect(wrapper.find(".active").length).toEqual(0);
  });

  it("shows inactive icons for logs page", () => {
    mockPath = Path.mock(Path.logs());
    const wrapper = mount(<DesignerNavTabs />);
    expect(wrapper.find(".active").length).toEqual(0);
  });

  it("shows active zones icon", () => {
    mockPath = Path.mock(Path.zones());
    mockDev = true;
    const wrapper = mount(<DesignerNavTabs />);
    expectOnlyOneActiveIcon(wrapper);
    expectColor(wrapper, "brown");
    expectActive(wrapper, "zones");
  });

  it("renders scroll indicator", () => {
    Object.defineProperty(document, "getElementsByClassName", {
      value: () => [{}, { scrollWidth: 100, scrollLeft: 0, clientWidth: 75 }],
      configurable: true
    });
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.html()).toContain("scroll-indicator");
  });

  it("doesn't render scroll indicator when wide", () => {
    Object.defineProperty(document, "getElementsByClassName", {
      value: () => [{}, { scrollWidth: 500, scrollLeft: 0, clientWidth: 750 }],
      configurable: true
    });
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.html()).not.toContain("scroll-indicator");
  });

  it("doesn't render scroll indicator when at end", () => {
    Object.defineProperty(document, "getElementsByClassName", {
      value: () => [{}, { scrollWidth: 100, scrollLeft: 25, clientWidth: 75 }],
      configurable: true
    });
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.html()).not.toContain("scroll-indicator");
  });

  it("calls onScroll", () => {
    const wrapper = shallow<DesignerNavTabs>(<DesignerNavTabs />);
    wrapper.setState({ atEnd: false });
    wrapper.find(".panel-tabs").simulate("scroll");
    expect(wrapper.state().atEnd).toEqual(true);
  });

  it("shows farmware tab", () => {
    mockState.resources = buildResourceIndex([fakeFarmwareInstallation()]);
    const wrapper = mount(<DesignerNavTabs />);
    expect(wrapper.html()).toContain("farmware");
  });
});
