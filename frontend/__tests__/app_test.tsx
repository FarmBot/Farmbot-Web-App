let mockSatisfies = true;
jest.mock("bowser", () => ({
  getParser: () => ({ satisfies: () => mockSatisfies }),
}));

jest.mock("../hotkeys", () => ({
  HotKeys: () => <div />,
}));

import React from "react";
import { RawApp as App, AppProps, mapStateToProps } from "../app";
import { mount } from "enzyme";
import { bot } from "../__test_support__/fake_state/bot";
import {
  fakeUser, fakeWebAppConfig, fakeFarmwareEnv,
} from "../__test_support__/fake_state/resources";
import { fakeState } from "../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../__test_support__/resource_index_builder";
import { ResourceName } from "farmbot";
import { fakeTimeSettings } from "../__test_support__/fake_time_settings";
import { error, warning } from "../toast/toast";
import { fakePings } from "../__test_support__/fake_state/pings";
import { auth } from "../__test_support__/fake_state/token";
import {
  fakeDesignerState,
  fakeHelpState, fakeMenuOpenState,
} from "../__test_support__/fake_designer_state";
import { Path } from "../internal_urls";
import { app } from "../__test_support__/fake_state/app";

const FULLY_LOADED: ResourceName[] = [
  "Sequence", "Regimen", "FarmEvent", "Point", "Tool", "Device"];

const fakeProps = (): AppProps => ({
  timeSettings: fakeTimeSettings(),
  dispatch: jest.fn(),
  loaded: [],
  logs: [],
  user: fakeUser(),
  bot: bot,
  axisInversion: { x: false, y: false, z: false },
  firmwareConfig: undefined,
  xySwap: false,
  animate: false,
  getConfigValue: jest.fn(),
  sourceFwConfig: jest.fn(),
  sourceFbosConfig: jest.fn(),
  helpState: fakeHelpState(),
  resources: buildResourceIndex().index,
  alertCount: 0,
  pings: fakePings(),
  env: {},
  alerts: [],
  apiFirmwareValue: undefined,
  authAud: undefined,
  wizardStepResults: [],
  telemetry: [],
  appState: app,
  feeds: [],
  peripherals: [],
  sequences: [],
  menuOpen: fakeMenuOpenState(),
  designer: fakeDesignerState(),
});

describe("<App />: Loading", () => {
  beforeEach(() => {
    location.pathname = Path.mock(Path.app());
  });

  it("MUST_LOADs not loaded", () => {
    const wrapper = mount(<App {...fakeProps()} />);
    expect(wrapper.text()).toContain("Loading...");
    wrapper.unmount();
  });

  it("MUST_LOADs partially loaded", () => {
    const p = fakeProps();
    p.loaded = ["Sequence"];
    const wrapper = mount(<App {...p} />);
    expect(wrapper.text()).toContain("Loading...");
    wrapper.unmount();
  });

  it("MUST_LOADs loaded", () => {
    const p = fakeProps();
    p.loaded = FULLY_LOADED;
    const wrapper = mount(<App {...p} />);
    expect(wrapper.text()).not.toContain("Loading...");
    wrapper.unmount();
  });

  it("times out while loading", () => {
    jest.useFakeTimers();
    const wrapper = mount(<App {...fakeProps()} />);
    jest.runAllTimers();
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("App could not be fully loaded"),
      { title: "Warning" });
    wrapper.unmount();
  });

  it("loads before timeout", () => {
    const p = fakeProps();
    p.loaded = FULLY_LOADED;
    jest.useFakeTimers();
    const wrapper = mount(<App {...p} />);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("checks browser compatibility: ok", () => {
    mockSatisfies = true;
    mount(<App {...fakeProps()} />);
    expect(warning).not.toHaveBeenCalled();
  });

  it("checks browser compatibility: no", () => {
    mockSatisfies = false;
    mount(<App {...fakeProps()} />);
    expect(warning).toHaveBeenCalled();
  });

  it("navigates to landing page", () => {
    location.pathname = Path.mock(Path.app());
    const p = fakeProps();
    p.getConfigValue = () => "controls";
    mount(<App {...p} />);
    expect(mockNavigate).toHaveBeenCalledWith(Path.controls());
  });

  it("doesn't navigate to landing page", () => {
    location.pathname = Path.mock(Path.controls());
    const p = fakeProps();
    p.getConfigValue = () => "controls";
    mount(<App {...p} />);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("enables the dark theme", () => {
    const p = fakeProps();
    p.getConfigValue = () => true;
    const wrapper = mount(<App {...p} />);
    expect(wrapper.find(".app").hasClass("dark")).toBeTruthy();
  });

  it("enables the light theme", () => {
    const p = fakeProps();
    p.getConfigValue = () => false;
    const wrapper = mount(<App {...p} />);
    expect(wrapper.find(".app").hasClass("light")).toBeTruthy();
  });
});

describe("<App />: NavBar", () => {
  it("displays links", () => {
    const p = fakeProps();
    p.loaded = FULLY_LOADED;
    const wrapper = mount(<App {...p} />);
    const t = wrapper.text();
    const strings = [
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
    ];
    strings.map(string => expect(t).toContain(string));
    wrapper.unmount();
  });

  it("displays ticker", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.sync_status = "synced";
    p.bot.connectivity.uptime["bot.mqtt"] = { state: "up", at: 1 };
    p.loaded = FULLY_LOADED;
    const wrapper = mount(<App {...p} />);
    expect(wrapper.text()).toContain("No logs yet.");
    wrapper.unmount();
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    state.auth = auth;
    state.auth.token.unencoded.aud = "unknown";
    const config = fakeWebAppConfig();
    config.body.x_axis_inverted = true;
    const farmwareEnv = fakeFarmwareEnv();
    farmwareEnv.body.key = "fakeKey";
    state.resources = buildResourceIndex([config, farmwareEnv]);
    const result = mapStateToProps(state);
    expect(result.axisInversion.x).toEqual(true);
    expect(result.env).toEqual({ fakeKey: "fake_FarmwareEnv_value" });
    expect(result.authAud).toEqual("unknown");
  });

  it("handles missing auth", () => {
    const state = fakeState();
    state.auth = undefined;
    const result = mapStateToProps(state);
    expect(result.authAud).toEqual(undefined);
  });
});
