let mockIsMobile = false;

import React from "react";
import { fireEvent } from "@testing-library/react";
import { mapStateToProps, RawNavBar as NavBar } from "../index";
import { Provider } from "react-redux";
import { Store, UnknownAction } from "redux";
import { TaggedResource } from "farmbot";
import { bot } from "../../__test_support__/fake_state/bot";
import { NavBarProps } from "../interfaces";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import {
  fakeDesignerState,
  fakeHelpState, fakeMenuOpenState,
} from "../../__test_support__/fake_designer_state";
import { Path } from "../../internal_urls";
import { NavigationContext } from "../../routes_helpers";
import { fakePercentJob } from "../../__test_support__/fake_bot_data";
import {
  fakeFbosConfig, fakeFirmwareConfig, fakePeripheral, fakeSequence,
  fakeTelemetry, fakeUser, fakeWebAppConfig, fakeWebcamFeed,
  fakeWizardStepResult,
} from "../../__test_support__/fake_state/resources";
import { app } from "../../__test_support__/fake_state/app";
import { Actions } from "../../constants";
import { cloneDeep } from "lodash";
import { renderWithContext } from "../../__test_support__/mount_with_context";
import * as controlsPanelModule from "../../controls/controls";
import * as screenSize from "../../screen_size";
import * as guessTimezone from "../../devices/timezones/guess_timezone";
import * as mustBeOnline from "../../devices/must_be_online";
import { fakeState } from "../../__test_support__/fake_state";
import {
  commandPaletteShortcut, COMMAND_PALETTE_OPEN_EVENT,
} from "../../command_palette";
import { BooleanSetting } from "../../session_keys";

let isMobileSpy: jest.SpyInstance;
let isDesktopSpy: jest.SpyInstance;
let maybeSetTimezoneSpy: jest.SpyInstance;
let forceOnlineSpy: jest.SpyInstance;

describe("<NavBar />", () => {
  const mockStoreForProps = (props: NavBarProps) => {
    const state = fakeState();
    state.bot = props.bot;
    state.app = props.appState;
    state.dispatch = props.dispatch;
    const resources: TaggedResource[] = [
      fakeWebAppConfig(),
      props.device,
      ...props.logs,
      ...(props.user ? [props.user] : []),
    ];
    state.resources = buildResourceIndex(resources);
    return {
      getState: () => state,
      dispatch: props.dispatch,
      subscribe: () => () => { },
      replaceReducer: () => undefined,
      [Symbol.observable]: () => ({
        subscribe: () => ({ unsubscribe: () => undefined }),
        [Symbol.observable]() { return this; },
      }),
    } as unknown as Store<ReturnType<typeof fakeState>, UnknownAction>;
  };

  const renderNavBar = (props = fakeProps()) => {
    const mockStore = mockStoreForProps(props);
    return renderWithContext(
      <Provider store={mockStore}>
        <NavBar {...props} />
      </Provider>);
  };

  beforeEach(() => {
    mockIsMobile = false;
    localStorage.removeItem("myBotIs");
    document.body.innerHTML = "";
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
    apiFirmwareValue: undefined,
    authAud: undefined,
    wizardStepResults: [],
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
    const { container } = renderNavBar();
    const navWrapper = container.querySelector(".nav-wrapper");
    expect(navWrapper).toBeTruthy();
    expect(navWrapper?.classList.contains("nav-load-in")).toBeTruthy();
    expect(navWrapper?.classList.contains("red")).toBeFalsy();
    expect(container.querySelector(".connectivity-button.hover")).toBeFalsy();
  });

  it("renders demo account", () => {
    forceOnlineSpy.mockImplementation(() => true);
    const { container } = renderNavBar();
    const text = container.textContent?.toLowerCase() || "";
    expect(text).toContain("using a demo account");
  });

  it("sets demo state when forced online", () => {
    forceOnlineSpy.mockImplementation(() => true);
    const p = fakeProps();
    renderNavBar(p);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_STATE,
      payload: undefined,
    });
  });

  it("doesn't set demo state when not forced online", () => {
    forceOnlineSpy.mockImplementation(() => false);
    const p = fakeProps();
    renderNavBar(p);
    expect(p.dispatch).not.toHaveBeenCalledWith({
      type: Actions.DEMO_SET_STATE,
      payload: undefined,
    });
  });

  it("displays links", () => {
    const { container } = renderNavBar();
    const text = container.textContent || "";
    [
      "Plants",
      "Sequences",
      "Regimens",
      "Events",
      "Points",
      "Weeds",
      "Photos",
      "Tools",
      "Messages",
      "Help",
      "Settings",
    ].map(string => expect(text).toContain(string));
  });

  it("displays ticker", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.sync_status = "synced";
    p.bot.connectivity.uptime["bot.mqtt"] = { state: "up", at: 1 };
    renderNavBar(p);
    expect(document.body.textContent || "").toContain("No logs yet.");
  });

  it("shows popups as open", () => {
    const p = fakeProps();
    p.appState.popups.connectivity = true;
    p.appState.popups.jobs = true;
    p.appState.popups.controls = true;
    const { container } = renderNavBar(p);
    expect(container.querySelector(".connectivity-button.hover")).toBeTruthy();
    expect(container.querySelector(".nav-coordinates.hover")).toBeTruthy();
    expect(container.querySelector(".jobs-button.hover")).toBeTruthy();
    expect(document.querySelector(
      ".connectivity-popover-portal.nav-popover-portal")).toBeTruthy();
    expect(document.querySelector(
      ".controls-popover-portal.nav-popover-portal")).toBeTruthy();
    expect(document.querySelector(
      ".jobs-panel-portal.nav-popover-portal")).toBeTruthy();
  });

  it("opens the command palette from the right nav cluster", () => {
    const open = jest.fn();
    window.addEventListener(COMMAND_PALETTE_OPEN_EVENT, open);
    const { container } = renderNavBar();
    const button = container.querySelector(".command-palette-nav-button");
    expect(button?.textContent)
      .toEqual(`Commands ${commandPaletteShortcut()}`);
    fireEvent.click(button as Element);
    expect(open).toHaveBeenCalledTimes(1);
    window.removeEventListener(COMMAND_PALETTE_OPEN_EVENT, open);
  });

  it("hides command palette shortcut help on mobile", () => {
    mockIsMobile = true;
    const { container } = renderNavBar();
    const button = container.querySelector(".command-palette-nav-button");
    expect(button).toHaveAccessibleName("Commands");
    expect(button).toHaveAttribute("title", "Commands");
    expect(button).toHaveTextContent("");
    expect(button?.querySelector("span")).toBeNull();
    expect(button?.outerHTML).not.toContain(commandPaletteShortcut());
  });

  it("displays movement progress", () => {
    const p = fakeProps();
    p.appState.movement = {
      start: { x: 0, y: 0, z: 0 },
      distance: { x: 0, y: 100, z: 0 },
    };
    p.bot.hardware.location_data.position = { x: 0, y: 50, z: 0 };
    p.bot.hardware.informational_settings.busy = true;
    const { container } = renderNavBar(p);
    expect(container.querySelector(".movement-progress")?.getAttribute("style") || "")
      .toContain("50%");
  });

  it("closes nav menu", () => {
    const setStateSpy = jest.spyOn(
      NavBar.prototype as unknown as { setState: jest.Mock },
      "setState",
    );
    const { container } = renderNavBar();
    const icon = container.querySelector(".mobile-menu-icon") as HTMLElement;
    expect(icon).toBeTruthy();
    fireEvent.click(icon);
    expect(setStateSpy).toHaveBeenCalledWith({ mobileMenuOpen: true });
    fireEvent.click(container.querySelector(".mobile-menu-icon") as HTMLElement);
    expect(setStateSpy).toHaveBeenCalledWith({ mobileMenuOpen: false });
    setStateSpy.mockRestore();
  });

  it("silently sets user timezone as needed", () => {
    const p = fakeProps();
    p.device = fakeDevice({ timezone: undefined });
    renderNavBar(p);
    expect(maybeSetTimezoneSpy).toHaveBeenCalledWith(p.dispatch, p.device);
  });

  it("toggles state value", () => {
    const setStateSpy = jest.spyOn(
      NavBar.prototype as unknown as { setState: jest.Mock },
      "setState",
    );
    const { container } = renderNavBar();
    const icon = container.querySelector(".mobile-menu-icon") as HTMLElement;
    expect(document.querySelector(".mobile-menu.active")).toBeFalsy();
    fireEvent.click(icon);
    expect(document.querySelector(".mobile-menu.active")).toBeTruthy();
    fireEvent.click(document.querySelector(
      ".mobile-menu.active .shop-link") as HTMLElement);
    expect(setStateSpy).toHaveBeenLastCalledWith({ mobileMenuOpen: false });
    setStateSpy.mockRestore();
  });

  it("toggles popup", () => {
    const p = fakeProps();
    const { container } = renderNavBar(p);
    fireEvent.click(container.querySelector(".connectivity-button") as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_POPUP, payload: "connectivity",
    });
    fireEvent.click(container.querySelector(".nav-coordinates") as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_POPUP, payload: "controls",
    });
    fireEvent.click(container.querySelector(".jobs-button") as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_POPUP, payload: "jobs",
    });
  });

  it("closes the mobile menu from a navigation link", () => {
    const setStateSpy = jest.spyOn(
      NavBar.prototype as unknown as { setState: jest.Mock },
      "setState",
    );
    const { container } = renderNavBar();
    fireEvent.click(container.querySelector(
      ".top-menu-container .nav-links a",
    ) as Element);
    expect(setStateSpy).toHaveBeenCalledWith({ mobileMenuOpen: false });
    setStateSpy.mockRestore();
  });

  it("updates document title", () => {
    const setStateSpy = jest.spyOn(
      NavBar.prototype as unknown as { setState: jest.Mock },
      "setState",
    );
    const p = fakeProps();
    const mockStore = mockStoreForProps(p);
    const { rerender } = renderWithContext(
      <Provider store={mockStore}>
        <NavBar {...p} />
      </Provider>);
    document.title = "new page";
    rerender(
      <NavigationContext.Provider value={mockNavigate}>
        <Provider store={mockStore}>
          <NavBar {...p} />
        </Provider>
      </NavigationContext.Provider>);
    expect(setStateSpy).toHaveBeenCalled();
    setStateSpy.mockRestore();
  });

  it("displays connectivity saucer", () => {
    mockIsMobile = true;
    const p = fakeProps();
    p.device.body.name = "broccolibot";
    const { container } = renderNavBar(p);
    expect(container.querySelectorAll(".diagnosis-indicator.nav").length)
      .toEqual(1);
    expect(container.textContent?.toLowerCase()).not.toContain("broccolibot");
  });

  it("displays connectivity saucer and button", () => {
    mockIsMobile = false;
    const p = fakeProps();
    p.device.body.name = "broccolibot";
    const { container } = renderNavBar(p);
    expect(container.querySelectorAll(".diagnosis-indicator.nav").length)
      .toEqual(1);
    expect(container.textContent?.toLowerCase()).toContain("broccolibot");
  });

  it("displays default device name when none is provided", () => {
    const props = fakeProps();
    props.device.body.name = "";
    const { container } = renderNavBar(props);
    expect(container.textContent || "").toContain("FarmBot");
  });

  it("displays setup button", () => {
    const { container } = renderNavBar();
    const setupButton = container.querySelector(".setup-button") as HTMLAnchorElement;
    expect(setupButton).toBeTruthy();
    expect(setupButton).toHaveTextContent(/^Setup: 0%$/);
    fireEvent.click(setupButton);
    expect(mockNavigate).toHaveBeenCalledWith(Path.setup());
  });

  it("displays setup button: small screens", () => {
    mockIsMobile = true;
    const { container } = renderNavBar();
    expect(container.querySelector(".setup-button")?.textContent?.toLowerCase())
      .toEqual("setup");
  });

  it("doesn't display setup button when complete", () => {
    const p = fakeProps();
    p.device.body.setup_completed_at = "123";
    const { container } = renderNavBar(p);
    expect(container.querySelector(".setup-button")).toBeNull();
  });

  it("displays time travel button without device coordinates", () => {
    const p = fakeProps();
    p.getConfigValue = () => true;
    p.device.body.lat = undefined;
    p.device.body.lng = undefined;
    const { container } = renderNavBar(p);
    expect(container.querySelector(".time-travel-button")).toBeTruthy();
  });

  it("displays navbar visual warning for support tokens", () => {
    const p = fakeProps();
    p.authAud = "staff";
    const { container } = renderNavBar(p);
    expect(container.querySelector(".nav-wrapper")?.classList.contains("red"))
      .toBeTruthy();
  });

  it("displays active job", () => {
    mockIsMobile = false;
    const p = fakeProps();
    p.bot.hardware.jobs = { "job title": fakePercentJob() };
    const { container } = renderNavBar(p);
    expect(container.textContent?.toLowerCase()).toContain("99%");
    expect(container.textContent?.toLowerCase()).toContain("job title");
  });

  it("displays active job on small screens", () => {
    mockIsMobile = true;
    const p = fakeProps();
    p.bot.hardware.jobs = { "job title": fakePercentJob() };
    const { container } = renderNavBar(p);
    const progressBar = container.querySelector(".jobs-button-progress-bar");
    expect(progressBar).toBeTruthy();
    expect(progressBar?.getAttribute("style") || "").toContain("99%");
  });

  it("uses MCU params when firmware config is missing", () => {
    const controlsPanelSpy = jest.spyOn(controlsPanelModule, "ControlsPanel");
    const p = fakeProps();
    p.firmwareConfig = undefined;
    p.appState.popups.controls = true;
    renderNavBar(p);
    const callWithMcuParams = controlsPanelSpy.mock.calls.find(([props]) =>
      !!props
      && typeof props == "object"
      && "firmwareSettings" in props
      && (props as { firmwareSettings: unknown }).firmwareSettings
      == p.bot.hardware.mcu_params);
    expect(callWithMcuParams).toBeTruthy();
    controlsPanelSpy.mockRestore();
  });

  it("maps and memoizes connected navbar state", () => {
    const state = fakeState();
    const device = fakeDevice();
    const wizardStepResult = fakeWizardStepResult();
    const peripheral = fakePeripheral();
    const sequence = fakeSequence();
    state.resources = buildResourceIndex([
      device,
      fakeUser(),
      fakeWebAppConfig(),
      fakeFbosConfig(),
      fakeFirmwareConfig(),
      wizardStepResult,
      fakeTelemetry(),
      fakeWebcamFeed(),
      peripheral,
      sequence,
    ]);

    const first = mapStateToProps(state);
    expect(first.dispatch).toBe(state.dispatch);
    expect(first.resources).toBe(state.resources.index);
    expect(first.designer).toBe(state.resources.consumers.farm_designer);
    expect(first.device.body.id).toEqual(device.body.id);
    expect(first.firmwareConfig).toEqual(expect.any(Object));
    expect(first.wizardStepResults.map(result => result.body.id))
      .toEqual([wizardStepResult.body.id]);
    expect(first.peripherals.map(result => result.body.id))
      .toEqual([peripheral.body.id]);
    expect(first.sequences.map(result => result.body.id))
      .toEqual([sequence.body.id]);
    expect(first.getConfigValue(BooleanSetting.three_d_garden)).toBeFalsy();

    const connectivityUpdate = {
      ...state,
      bot: { ...state.bot, connectivity: cloneDeep(state.bot.connectivity) },
    };
    const second = mapStateToProps(connectivityUpdate);
    expect(second.bot).toBe(first.bot);
    expect(second.peripherals).toBe(first.peripherals);

    const botUpdate = {
      ...connectivityUpdate,
      bot: { ...connectivityUpdate.bot, stepSize: state.bot.stepSize + 1 },
    };
    expect(mapStateToProps(botUpdate).bot).toBe(botUpdate.bot);
  });

});
