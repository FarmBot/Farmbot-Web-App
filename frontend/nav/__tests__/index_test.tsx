let mockIsMobile = false;

import React from "react";
import { render } from "@testing-library/react";
import { shallow, mount } from "enzyme";
import { NavBar } from "../index";
import { bot } from "../../__test_support__/fake_state/bot";
import { NavBarProps } from "../interfaces";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { fakePings } from "../../__test_support__/fake_state/pings";
import { Link } from "../../link";
import {
  fakeDesignerState,
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
import { mountWithContext } from "../../__test_support__/mount_with_context";
import { ControlsPanel, ControlsPanelProps } from "../../controls/controls";
import * as screenSize from "../../screen_size";
import * as guessTimezone from "../../devices/timezones/guess_timezone";
import { showTimeTravelButton } from "../../three_d_garden/time_travel";
import * as mustBeOnline from "../../devices/must_be_online";

let isMobileSpy: jest.SpyInstance;
let isDesktopSpy: jest.SpyInstance;
let maybeSetTimezoneSpy: jest.SpyInstance;
let forceOnlineSpy: jest.SpyInstance;

describe("<NavBar />", () => {
  beforeEach(() => {
    mockIsMobile = false;
    localStorage.removeItem("myBotIs");
    isMobileSpy = jest.spyOn(screenSize, "isMobile")
      .mockImplementation(() => mockIsMobile);
    isDesktopSpy = jest.spyOn(screenSize, "isDesktop")
      .mockImplementation(() => !mockIsMobile);
    maybeSetTimezoneSpy = jest.spyOn(guessTimezone, "maybeSetTimezone")
      .mockImplementation(jest.fn());
    forceOnlineSpy = jest.spyOn(mustBeOnline, "forceOnline")
      .mockImplementation(() => false);
  });

  afterEach(() => {
    isMobileSpy.mockRestore();
    isDesktopSpy.mockRestore();
    maybeSetTimezoneSpy.mockRestore();
    forceOnlineSpy.mockRestore();
    localStorage.removeItem("myBotIs");
    document.body.innerHTML = "";
  });

  const fakeProps = (): NavBarProps => ({
    timeSettings: fakeTimeSettings(),
    logs: [],
    bot: cloneDeep(bot),
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
    sourceFbosConfig: jest.fn(() => ({ value: undefined, consistent: true })),
    firmwareConfig: fakeFirmwareConfig().body,
    resources: buildResourceIndex([]).index,
    menuOpen: fakeMenuOpenState(),
    env: {},
    feeds: [],
    peripherals: [],
    sequences: [],
    designer: fakeDesignerState(),
  });

  it("has correct parent className", () => {
    const wrapper = shallow(<NavBar {...fakeProps()} />);
    expect(wrapper.find("div").first().hasClass("nav-wrapper")).toBeTruthy();
    expect(wrapper.find("div").first().hasClass("red")).toBeFalsy();
    expect(wrapper.find(".connectivity-button.hover").length).toEqual(0);
  });

  it("renders demo account", () => {
    forceOnlineSpy.mockImplementation(() => true);
    const { container } = render(<NavBar {...fakeProps()} />);
    const text = container.textContent?.toLowerCase() || "";
    expect(text).toContain("using a demo account");
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
    p.bot.hardware.location_data.position = { x: 0, y: 50, z: 0 };
    p.bot.hardware.informational_settings.busy = true;
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
    mount(<NavBar {...p} />);
    expect(maybeSetTimezoneSpy).toHaveBeenCalledWith(p.dispatch, p.device);
  });

  it("toggles state value", () => {
    const wrapper = shallow<NavBar>(<NavBar {...fakeProps()} />);
    expect(wrapper.state().mobileMenuOpen).toEqual(false);
    wrapper.instance().toggleMobileMenu();
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

  it("updates document title", () => {
    const wrapper = mount<NavBar>(<NavBar {...fakeProps()} />);
    expect(wrapper.state().documentTitle).toEqual("");
    document.title = "new page";
    wrapper.instance().componentDidUpdate();
    expect(wrapper.state().documentTitle).not.toEqual("");
  });

  it("displays connectivity saucer", () => {
    mockIsMobile = true;
    const p = fakeProps();
    p.device.body.name = "broccolibot";
    const wrapper = mount(<NavBar {...p} />);
    expect(wrapper.find(".diagnosis-indicator.nav").length).toEqual(1);
    expect(wrapper.text().toLowerCase()).not.toContain("broccolibot");
  });

  it("displays connectivity saucer and button", () => {
    mockIsMobile = false;
    const p = fakeProps();
    p.device.body.name = "broccolibot";
    const wrapper = mount(<NavBar {...p} />);
    expect(wrapper.find(".diagnosis-indicator.nav").length).toEqual(1);
    expect(wrapper.text().toLowerCase()).toContain("broccolibot");
  });

  it("displays default device name when none is provided", () => {
    const props = fakeProps();
    props.device.body.name = "";
    const { container } = render(<NavBar {...props} />);
    expect(container.textContent || "").toContain("FarmBot");
  });

  it("displays setup button", () => {
    const wrapper = mountWithContext(<NavBar {...fakeProps()} />);
    wrapper.find(".setup-button").simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.setup());
    expect(wrapper.text().toLowerCase()).toContain("complete");
  });

  it("displays setup button: small screens", () => {
    mockIsMobile = true;
    const wrapper = mount(<NavBar {...fakeProps()} />);
    expect(wrapper.find(".setup-button").text().toLowerCase()).toEqual("setup");
  });

  it("doesn't display setup button when complete", () => {
    const p = fakeProps();
    p.device.body.setup_completed_at = "123";
    const wrapper = mount(<NavBar {...p} />);
    expect(wrapper.find(".setup-button").length).toEqual(0);
  });

  it("displays time travel button", () => {
    const p = fakeProps();
    p.getConfigValue = () => true;
    p.device.body.lat = 1;
    p.device.body.lng = 1;
    expect(showTimeTravelButton(true, p.device.body)).toBeTruthy();
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
    const progressBar = wrapper.find(".jobs-button-progress-bar");
    expect(progressBar.length).toEqual(1);
    expect(progressBar.first().prop("style")).toEqual({ width: "99%" });
  });

  it("uses MCU params when firmware config is missing", () => {
    const p = fakeProps();
    p.firmwareConfig = undefined;
    p.appState.popups.controls = true;
    const wrapper = mount<NavBar>(<NavBar {...p} />);
    const props = wrapper.find(ControlsPanel).props() as ControlsPanelProps;
    expect(props.firmwareSettings).toEqual(p.bot.hardware.mcu_params);
  });

});
