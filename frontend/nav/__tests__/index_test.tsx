let mockIsMobile = false;
jest.mock("../../screen_size", () => ({
  isMobile: () => mockIsMobile,
}));

jest.mock("../../devices/timezones/guess_timezone", () => ({
  maybeSetTimezone: jest.fn()
}));

jest.mock("../../api/crud", () => ({ refresh: jest.fn() }));

jest.mock("../../devices/actions", () => ({
  sync: jest.fn(),
  readStatus: jest.fn(),
}));

import React from "react";
import { shallow, mount } from "enzyme";
import { NavBar } from "../index";
import { bot } from "../../__test_support__/fake_state/bot";
import { NavBarProps } from "../interfaces";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { maybeSetTimezone } from "../../devices/timezones/guess_timezone";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { fakePings } from "../../__test_support__/fake_state/pings";
import { Link } from "../../link";
import { refresh } from "../../api/crud";
import { push } from "../../history";
import {
  fakeHelpState, fakeMenuOpenState,
} from "../../__test_support__/fake_designer_state";
import { Path } from "../../internal_urls";
import { fakePercentJob } from "../../__test_support__/fake_bot_data";
import {
  fakeFirmwareConfig, fakeUser,
} from "../../__test_support__/fake_state/resources";
import { app } from "../../__test_support__/fake_state/app";
import { Actions } from "../../constants";
import { cloneDeep } from "lodash";

describe("<NavBar />", () => {
  const fakeProps = (): NavBarProps => ({
    timeSettings: fakeTimeSettings(),
    logs: [],
    bot,
    user: fakeUser(),
    dispatch: jest.fn(),
    getConfigValue: jest.fn(),
    helpState: fakeHelpState(),
    device: fakeDevice(),
    alertCount: 0,
    pings: fakePings(),
    alerts: [],
    apiFirmwareValue: undefined,
    authAud: undefined,
    wizardStepResults: [],
    telemetry: [],
    appState: cloneDeep(app),
    sourceFwConfig: jest.fn(),
    sourceFbosConfig: jest.fn(),
    firmwareConfig: fakeFirmwareConfig().body,
    resources: buildResourceIndex([]).index,
    menuOpen: fakeMenuOpenState(),
    env: {},
    feeds: [],
    peripherals: [],
    sequences: [],
  });

  it("has correct parent className", () => {
    const wrapper = shallow(<NavBar {...fakeProps()} />);
    expect(wrapper.find("div").first().hasClass("nav-wrapper")).toBeTruthy();
    expect(wrapper.find("div").first().hasClass("red")).toBeFalsy();
    expect(wrapper.html()).not.toContain("hover");
  });

  it("shows popups as open", () => {
    const p = fakeProps();
    p.appState.popups.connectivity = true;
    p.appState.popups.jobs = true;
    p.appState.popups.controls = true;
    const wrapper = shallow(<NavBar {...p} />);
    expect(wrapper.html()).toContain("hover");
  });

  it("displays movement progress", () => {
    const p = fakeProps();
    p.appState.movement = {
      start: { x: 0, y: 0, z: 0 },
      distance: { x: 0, y: 100, z: 0 },
    };
    bot.hardware.location_data.position = { x: 0, y: 50, z: 0 };
    bot.hardware.informational_settings.busy = true;
    const wrapper = shallow(<NavBar {...p} />);
    expect(wrapper.html()).toContain("width:50%");
  });

  it("closes nav menu", () => {
    const wrapper = mount<NavBar>(<NavBar {...fakeProps()} />);
    const link = wrapper.find(Link).first();
    link.simulate("click");
    expect(wrapper.instance().state.mobileMenuOpen).toBeFalsy();
    link.simulate("click");
    expect(wrapper.instance().state.mobileMenuOpen).toBeFalsy();
  });

  it("silently sets user timezone as needed", () => {
    const p = fakeProps();
    p.device = fakeDevice({ timezone: undefined });
    const wrapper = mount(<NavBar {...p} />);
    wrapper.mount();
    expect(maybeSetTimezone).toHaveBeenCalledWith(p.dispatch, p.device);
  });

  it("handles missing user", () => {
    const p = fakeProps();
    p.user = undefined;
    const wrapper = mount(<NavBar {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("menu");
  });

  it("toggles state value", () => {
    const wrapper = shallow<NavBar>(<NavBar {...fakeProps()} />);
    expect(wrapper.state().mobileMenuOpen).toEqual(false);
    wrapper.instance().toggle("mobileMenuOpen")();
    expect(wrapper.state().mobileMenuOpen).toEqual(true);
  });

  it("toggles popup", () => {
    const p = fakeProps();
    const wrapper = shallow<NavBar>(<NavBar {...p} />);
    wrapper.instance().togglePopup("controls")();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_POPUP, payload: "controls",
    });
  });

  it("refreshes device", () => {
    const p = fakeProps();
    const wrapper = mount<NavBar>(<NavBar {...p} />);
    expect(wrapper.state().documentTitle).toEqual("");
    document.title = "new page";
    wrapper.instance().componentDidUpdate();
    expect(wrapper.state().documentTitle).not.toEqual("");
    expect(refresh).toHaveBeenCalledWith(p.device);
    jest.resetAllMocks();
    wrapper.instance().componentDidUpdate();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("displays connectivity saucer", () => {
    mockIsMobile = true;
    const wrapper = mount(<NavBar {...fakeProps()} />);
    expect(wrapper.find(".saucer").length).toEqual(2);
    expect(wrapper.text().toLowerCase()).not.toContain("connectivity");
  });

  it("displays connectivity saucer and button", () => {
    mockIsMobile = false;
    const wrapper = mount(<NavBar {...fakeProps()} />);
    expect(wrapper.find(".saucer").length).toEqual(2);
    expect(wrapper.text().toLowerCase()).toContain("connectivity");
  });

  it("displays setup button", () => {
    const wrapper = mount(<NavBar {...fakeProps()} />);
    wrapper.find(".setup-button").simulate("click");
    expect(push).toHaveBeenCalledWith(Path.setup());
    expect(wrapper.text().toLowerCase()).toContain("complete");
  });

  it("displays setup button: small screens", () => {
    mockIsMobile = true;
    const wrapper = mount(<NavBar {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).not.toContain("complete");
  });

  it("doesn't display setup button when complete", () => {
    const p = fakeProps();
    p.device.body.setup_completed_at = "123";
    const wrapper = mount(<NavBar {...p} />);
    expect(wrapper.find(".setup-button").length).toEqual(0);
  });

  it("displays navbar visual warning for support tokens", () => {
    const p = fakeProps();
    p.authAud = "staff";
    const wrapper = shallow(<NavBar {...p} />);
    expect(wrapper.find("div").first().hasClass("red")).toBeTruthy();
  });

  it("displays active job", () => {
    mockIsMobile = false;
    const p = fakeProps();
    p.bot.hardware.jobs = { "job title": fakePercentJob() };
    const wrapper = mount(<NavBar {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("99%");
    expect(wrapper.text().toLowerCase()).toContain("job title");
  });

  it("displays active job on small screens", () => {
    mockIsMobile = true;
    const p = fakeProps();
    p.bot.hardware.jobs = { "job title": fakePercentJob() };
    const wrapper = mount(<NavBar {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("99%");
    expect(wrapper.text().toLowerCase()).not.toContain("job title");
  });
});
