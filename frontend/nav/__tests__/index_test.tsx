let mockIsMobile = false;

import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { NavBar } from "../index";
import { bot } from "../../__test_support__/fake_state/bot";
import { NavBarProps } from "../interfaces";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { fakePings } from "../../__test_support__/fake_state/pings";
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
import { ControlsPanelProps } from "../../controls/controls";
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
    cleanup();
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

  const setStateSync = (instance: NavBar) => {
    instance.setState = ((state: Partial<NavBar["state"]>) => {
      instance.state = { ...instance.state, ...state };
    }) as NavBar["setState"];
    return instance;
  };

  it("has correct parent className", () => {
    const { container } = render(<NavBar {...fakeProps()} />);
    const root = container.querySelector("div");
    expect(root?.className).toContain("nav-wrapper");
    expect(root?.className).not.toContain("red");
    expect(container.querySelectorAll(".connectivity-button.hover").length)
      .toEqual(0);
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
    const { container } = render(<NavBar {...p} />);
    expect(container.innerHTML).toContain("hover");
  });

  it("displays movement progress", () => {
    const p = fakeProps();
    p.appState.movement = {
      start: { x: 0, y: 0, z: 0 },
      distance: { x: 0, y: 100, z: 0 },
    };
    p.bot.hardware.location_data.position = { x: 0, y: 50, z: 0 };
    p.bot.hardware.informational_settings.busy = true;
    const { container } = render(<NavBar {...p} />);
    expect(container.innerHTML).toContain("width: 50%");
  });

  it("closes nav menu", () => {
    const instance = setStateSync(new NavBar(fakeProps()));
    instance.setState({ mobileMenuOpen: true });
    instance.closeMobileMenu();
    expect(instance.state.mobileMenuOpen).toBeFalsy();
    instance.closeMobileMenu();
    expect(instance.state.mobileMenuOpen).toBeFalsy();
  });

  it("silently sets user timezone as needed", () => {
    const p = fakeProps();
    p.device = fakeDevice({ timezone: undefined });
    render(<NavBar {...p} />);
    expect(maybeSetTimezoneSpy).toHaveBeenCalledWith(p.dispatch, p.device);
  });

  it("toggles state value", () => {
    const instance = setStateSync(new NavBar(fakeProps()));
    expect(instance.state.mobileMenuOpen).toEqual(false);
    instance.toggleMobileMenu();
    expect(instance.state.mobileMenuOpen).toEqual(true);
  });

  it("toggles popup", () => {
    const p = fakeProps();
    const instance = new NavBar(p);
    instance.togglePopup("controls")();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_POPUP, payload: "controls",
    });
  });

  it("updates document title", () => {
    const instance = setStateSync(new NavBar(fakeProps()));
    expect(instance.state.documentTitle).toEqual("");
    document.title = "new page";
    instance.componentDidUpdate();
    expect(instance.state.documentTitle).not.toEqual("");
  });

  it("displays connectivity saucer", () => {
    mockIsMobile = true;
    const p = fakeProps();
    p.device.body.name = "broccolibot";
    const { container } = render(<NavBar {...p} />);
    expect(container.querySelectorAll(".diagnosis-indicator.nav").length)
      .toEqual(1);
    expect(container.textContent?.toLowerCase()).not.toContain("broccolibot");
  });

  it("displays connectivity saucer and button", () => {
    mockIsMobile = false;
    const p = fakeProps();
    p.device.body.name = "broccolibot";
    const { container } = render(<NavBar {...p} />);
    expect(container.querySelectorAll(".diagnosis-indicator.nav").length)
      .toEqual(1);
    expect(container.textContent?.toLowerCase()).toContain("broccolibot");
  });

  it("displays default device name when none is provided", () => {
    const props = fakeProps();
    props.device.body.name = "";
    const { container } = render(<NavBar {...props} />);
    expect(container.textContent || "").toContain("FarmBot");
  });

  it("displays setup button", () => {
    const wrapper = mountWithContext(<NavBar {...fakeProps()} />);
    fireEvent.click(wrapper.container.querySelector(".setup-button") as Element);
    expect(mockNavigate).toHaveBeenCalledWith(Path.setup());
    expect(wrapper.container.textContent?.toLowerCase()).toContain("complete");
  });

  it("displays setup button: small screens", () => {
    mockIsMobile = true;
    const { container } = render(<NavBar {...fakeProps()} />);
    expect(container.querySelector(".setup-button")?.textContent
      ?.toLowerCase()).toEqual("setup");
  });

  it("doesn't display setup button when complete", () => {
    const p = fakeProps();
    p.device.body.setup_completed_at = "123";
    const { container } = render(<NavBar {...p} />);
    expect(container.querySelectorAll(".setup-button").length).toEqual(0);
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
    const { container } = render(<NavBar {...p} />);
    expect(container.querySelector("div")?.className).toContain("red");
  });

  it("displays active job", () => {
    mockIsMobile = false;
    const p = fakeProps();
    p.bot.hardware.jobs = { "job title": fakePercentJob() };
    const { container } = render(<NavBar {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("99%");
    expect(container.textContent?.toLowerCase()).toContain("job title");
  });

  it("displays active job on small screens", () => {
    mockIsMobile = true;
    const p = fakeProps();
    p.bot.hardware.jobs = { "job title": fakePercentJob() };
    const { container } = render(<NavBar {...p} />);
    const progressBar = container.querySelector(".jobs-button-progress-bar");
    expect(progressBar).toBeTruthy();
    expect((progressBar as HTMLElement).style.width).toEqual("99%");
  });

  it("uses MCU params when firmware config is missing", () => {
    const p = fakeProps();
    p.firmwareConfig = undefined;
    p.appState.popups.controls = true;
    const instance = new NavBar(p);
    const coordinates = instance.Coordinates() as React.ReactElement<{
      children: React.ReactElement<{ content: React.ReactElement }>;
    }>;
    const props = coordinates.props.children.props.content.props as
      ControlsPanelProps;
    expect(props.firmwareSettings).toEqual(p.bot.hardware.mcu_params);
  });

});
