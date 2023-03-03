import { Path } from "../../internal_urls";
let mockPath = Path.mock(Path.plants());
jest.mock("../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
}));

let mockHasSensors = false;
jest.mock("../../settings/firmware/firmware_hardware_support", () => ({
  hasSensors: () => mockHasSensors,
  getFwHardwareValue: jest.fn(),
  isExpress: jest.fn(),
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
import { shallow, mount } from "enzyme";
import { NavLinks } from "../nav_links";
import { NavLinksProps } from "../interfaces";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import {
  fakeFarmwareInstallation,
} from "../../__test_support__/fake_state/resources";
import { fakeHelpState } from "../../__test_support__/fake_designer_state";

describe("<NavLinks />", () => {
  const fakeProps = (): NavLinksProps => ({
    close: jest.fn(),
    alertCount: 1,
    helpState: fakeHelpState(),
  });

  it("toggles the mobile nav menu", () => {
    const p = fakeProps();
    const close = jest.fn();
    p.close = x => () => close(x);
    p.alertCount = 0;
    const wrapper = shallow(<NavLinks {...p} />);
    wrapper.find("Link").first().simulate("click");
    expect(close).toHaveBeenCalledWith("mobileMenuOpen");
    expect(wrapper.text()).not.toContain("0");
  });

  it("shows indicator", () => {
    const wrapper = mount(<NavLinks {...fakeProps()} />);
    expect(wrapper.text()).toContain("1");
  });

  it("shows beacon", () => {
    const p = fakeProps();
    p.helpState.currentTour = "gettingStarted";
    p.helpState.currentTourStep = "plants";
    const wrapper = mount(<NavLinks {...p} />);
    expect(wrapper.html()).toContain("beacon soft");
  });

  it("shows active link", () => {
    mockPath = Path.mock(Path.plants());
    const wrapper = shallow(<NavLinks {...fakeProps()} />);
    expect(wrapper.find("Link").at(1).hasClass("active")).toBeTruthy();
    expect(wrapper.html().toLowerCase()).not.toContain("sensors");
  });

  it("shows sensors link", () => {
    mockHasSensors = true;
    const p = fakeProps();
    const wrapper = shallow(<NavLinks {...p} />);
    expect(wrapper.html().toLowerCase()).toContain("sensors");
  });

  it("shows new links", () => {
    mockDev = true;
    const wrapper = shallow(<NavLinks {...fakeProps()} />);
    expect(wrapper.html().toLowerCase()).toContain("curves");
  });

  it("doesn't show farmware link", () => {
    const farmware = fakeFarmwareInstallation();
    farmware.body.package = "included";
    mockState.resources = buildResourceIndex([farmware]);
    mockState.resources.consumers.farmware.firstPartyFarmwareNames = ["included"];
    const wrapper = shallow(<NavLinks {...fakeProps()} />);
    expect(wrapper.html().toLowerCase()).not.toContain("farmware");
  });

  it("shows farmware link", () => {
    const farmware1 = fakeFarmwareInstallation();
    farmware1.body.package = "included";
    const farmware2 = fakeFarmwareInstallation();
    farmware2.body.package = undefined;
    mockState.resources = buildResourceIndex([farmware1, farmware2]);
    mockState.resources.consumers.farmware.firstPartyFarmwareNames = ["included"];
    const wrapper = shallow(<NavLinks {...fakeProps()} />);
    expect(wrapper.html().toLowerCase()).toContain("farmware");
  });
});
