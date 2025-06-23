import { fakeState } from "../../__test_support__/fake_state";
const mockState = fakeState();
jest.mock("../../redux/store", () => ({ store: { getState: () => mockState } }));

import React from "react";
import { shallow, mount } from "enzyme";
import { NavLinks } from "../nav_links";
import { NavLinksProps } from "../interfaces";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import {
  fakeFarmwareInstallation, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import {
  fakeDesignerState, fakeHelpState,

} from "../../__test_support__/fake_designer_state";
import { Path } from "../../internal_urls";
import { Actions } from "../../constants";
import { mockDispatch } from "../../__test_support__/fake_dispatch";

describe("<NavLinks />", () => {
  const fakeProps = (): NavLinksProps => ({
    close: jest.fn(() => jest.fn()),
    alertCount: 1,
    helpState: fakeHelpState(),
    dispatch: jest.fn(),
    designer: fakeDesignerState(),
  });

  it("toggles the mobile nav menu", () => {
    const p = fakeProps();
    p.alertCount = 0;
    const wrapper = shallow(<NavLinks {...p} />);
    wrapper.find("Link").first().simulate("click");
    expect(p.close).toHaveBeenCalled();
    expect(wrapper.text()).not.toContain("0");
  });

  it("shows indicator", () => {
    const wrapper = mount(<NavLinks {...fakeProps()} />);
    expect(wrapper.text()).toContain("1");
  });

  it("clicks map icon", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const wrapper = mount(<NavLinks {...p} />);
    wrapper.find("a").first().simulate("click");
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: false,
    });
  });

  it("shows beacon", () => {
    const p = fakeProps();
    p.helpState.currentTour = "gettingStarted";
    p.helpState.currentTourStep = "plants";
    const wrapper = mount(<NavLinks {...p} />);
    expect(wrapper.html()).toContain("beacon soft");
  });

  it("shows active link", () => {
    location.pathname = Path.mock(Path.plants());
    const wrapper = shallow(<NavLinks {...fakeProps()} />);
    expect(wrapper.find("Link").at(0).hasClass("active")).toBeTruthy();
  });

  it("clicks active link: closes panel", () => {
    location.pathname = Path.mock(Path.plants());
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const wrapper = mount(<NavLinks {...p} />);
    wrapper.find("Link").at(0).simulate("click");
    expect(p.close).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: false,
    });
  });

  it("clicks inactive link: opens panel", () => {
    location.pathname = Path.mock(Path.weeds());
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const wrapper = mount(<NavLinks {...p} />);
    wrapper.find("Link").at(0).simulate("click");
    expect(p.close).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: true,
    });
  });

  it("shows sensors link", () => {
    const config = fakeWebAppConfig();
    config.body.hide_sensors = false;
    mockState.resources = buildResourceIndex([config]);
    const p = fakeProps();
    const wrapper = shallow(<NavLinks {...p} />);
    expect(wrapper.html().toLowerCase()).toContain("sensors");
  });

  it("doesn't show sensors link", () => {
    const config = fakeWebAppConfig();
    config.body.hide_sensors = true;
    mockState.resources = buildResourceIndex([config]);
    const p = fakeProps();
    const wrapper = shallow(<NavLinks {...p} />);
    expect(wrapper.html().toLowerCase()).not.toContain("sensors");
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
