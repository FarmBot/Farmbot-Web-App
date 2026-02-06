import React from "react";
import { shallow, mount } from "enzyme";
import { NavLinks } from "../nav_links";
import { NavLinksProps } from "../interfaces";
import {
  fakeDesignerState, fakeHelpState,

} from "../../__test_support__/fake_designer_state";
import { Path } from "../../internal_urls";
import { Actions } from "../../constants";
import { mockDispatch } from "../../__test_support__/fake_dispatch";
import { fakeState } from "../../__test_support__/fake_state";
import { store } from "../../redux/store";
import * as configStorageActions from "../../config_storage/actions";
import * as selectors from "../../resources/selectors";
import * as tours from "../../help/tours";

let mockState = fakeState();
let getStateSpy: jest.SpyInstance;
let getWebAppConfigValueSpy: jest.SpyInstance;
let selectAllFarmwareInstallationsSpy: jest.SpyInstance;
let maybeBeaconSpy: jest.SpyInstance;
const originalPathname = location.pathname;

describe("<NavLinks />", () => {
  beforeEach(() => {
    mockState = fakeState();
    getStateSpy = jest.spyOn(store, "getState")
      .mockImplementation(() => mockState);
    getWebAppConfigValueSpy = jest.spyOn(configStorageActions,
      "getWebAppConfigValue")
      .mockImplementation(() => () => false);
    selectAllFarmwareInstallationsSpy = jest.spyOn(selectors,
      "selectAllFarmwareInstallations")
      .mockImplementation(() => []);
    maybeBeaconSpy = jest.spyOn(tours, "maybeBeacon")
      .mockImplementation(() => "");
  });

  afterEach(() => {
    getStateSpy.mockRestore();
    getWebAppConfigValueSpy.mockRestore();
    selectAllFarmwareInstallationsSpy.mockRestore();
    maybeBeaconSpy.mockRestore();
    location.pathname = originalPathname;
  });

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
    maybeBeaconSpy.mockImplementation(() => "beacon soft");
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
    getWebAppConfigValueSpy.mockImplementation(() => () => false);
    const p = fakeProps();
    const wrapper = shallow(<NavLinks {...p} />);
    expect(wrapper.html().toLowerCase()).toContain("sensors");
  });

  it("doesn't show sensors link", () => {
    getWebAppConfigValueSpy.mockImplementation(() => () => true);
    const p = fakeProps();
    const wrapper = shallow(<NavLinks {...p} />);
    expect(wrapper.html().toLowerCase()).not.toContain("sensors");
  });

  it("doesn't show farmware link", () => {
    selectAllFarmwareInstallationsSpy.mockImplementation(() => []);
    const wrapper = shallow(<NavLinks {...fakeProps()} />);
    expect(wrapper.html().toLowerCase()).not.toContain("farmware");
  });

  it("shows farmware link", () => {
    mockState.resources.consumers.farmware.firstPartyFarmwareNames = ["included"];
    selectAllFarmwareInstallationsSpy.mockImplementation(() => [{
      body: { package: "custom-farmware" },
    }] as never);
    const wrapper = shallow(<NavLinks {...fakeProps()} />);
    expect(wrapper.html().toLowerCase()).toContain("farmware");
  });
});
