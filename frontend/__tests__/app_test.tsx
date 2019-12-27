let mockPath = "";
jest.mock("../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
  history: { getCurrentLocation: () => ({ pathname: mockPath }) }
}));

import * as React from "react";
import { RawApp as App, AppProps, mapStateToProps } from "../app";
import { mount } from "enzyme";
import { bot } from "../__test_support__/fake_state/bot";
import {
  fakeUser, fakeWebAppConfig, fakeFbosConfig, fakeFarmwareEnv
} from "../__test_support__/fake_state/resources";
import { fakeState } from "../__test_support__/fake_state";
import {
  buildResourceIndex
} from "../__test_support__/resource_index_builder";
import { ResourceName } from "farmbot";
import { fakeTimeSettings } from "../__test_support__/fake_time_settings";
import { error } from "../toast/toast";
import { fakePings } from "../__test_support__/fake_state/pings";

const FULLY_LOADED: ResourceName[] = [
  "Sequence", "Regimen", "FarmEvent", "Point", "Tool", "Device"];

const fakeProps = (): AppProps => ({
  timeSettings: fakeTimeSettings(),
  dispatch: jest.fn(),
  loaded: [],
  logs: [],
  user: fakeUser(),
  bot: bot,
  consistent: true,
  axisInversion: { x: false, y: false, z: false },
  firmwareConfig: undefined,
  xySwap: false,
  animate: false,
  getConfigValue: jest.fn(),
  tour: undefined,
  resources: buildResourceIndex().index,
  autoSync: false,
  alertCount: 0,
  pings: fakePings(),
  env: {},
});

describe("<App />: Controls Pop-Up", () => {
  function controlsPopUp(page: string, exists: boolean) {
    it(`doesn't render controls pop-up on ${page} page`, () => {
      mockPath = "/app/" + page;
      const wrapper = mount(<App {...fakeProps()} />);
      if (exists) {
        expect(wrapper.html()).toContain("controls-popup");
      } else {
        expect(wrapper.html()).not.toContain("controls-popup");
      }
    });
  }

  controlsPopUp("designer", true);
  controlsPopUp("designer/plants", true);
  controlsPopUp("controls", false);
  controlsPopUp("device", true);
  controlsPopUp("sequences", true);
  controlsPopUp("sequences/for_regimens", true);
  controlsPopUp("regimens", false);
  controlsPopUp("tools", true);
  controlsPopUp("farmware", true);
  controlsPopUp("account", false);

});

describe("<App />: Loading", () => {
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
      expect.stringContaining("App could not be fully loaded"), "Warning");
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
});

describe("<App />: NavBar", () => {
  it("displays links", () => {
    const p = fakeProps();
    p.loaded = FULLY_LOADED;
    const wrapper = mount(<App {...p} />);
    const t = wrapper.text();
    const strings = [
      "Farm Designer",
      "Controls",
      "Device",
      "Sequences",
      "Regimens",
      "Farmware"
    ];
    strings.map(string => expect(t).toContain(string));
    wrapper.unmount();
  });

  it("displays ticker", () => {
    const p = fakeProps();
    p.loaded = FULLY_LOADED;
    const wrapper = mount(<App {...p} />);
    expect(wrapper.text()).toContain("No logs yet.");
    wrapper.unmount();
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const config = fakeWebAppConfig();
    config.body.x_axis_inverted = true;
    state.resources = buildResourceIndex([config]);
    state.bot.hardware.user_env = { fake: "value" };
    const result = mapStateToProps(state);
    expect(result.axisInversion.x).toEqual(true);
    expect(result.autoSync).toEqual(false);
    expect(result.env).toEqual({ fake: "value" });
  });

  it("returns api props", () => {
    const state = fakeState();
    const config = fakeFbosConfig();
    config.body.auto_sync = true;
    config.body.api_migrated = true;
    const fakeEnv = fakeFarmwareEnv();
    state.resources = buildResourceIndex([config, fakeEnv]);
    state.bot.minOsFeatureData = { api_farmware_env: "8.0.0" };
    state.bot.hardware.informational_settings.controller_version = "8.0.0";
    const result = mapStateToProps(state);
    expect(result.autoSync).toEqual(true);
    expect(result.env).toEqual({ [fakeEnv.body.key]: fakeEnv.body.value });
  });
});
