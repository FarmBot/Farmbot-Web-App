jest.mock("react-redux", () => ({ connect: jest.fn() }));

let mockPath = "";
jest.mock("../history", () => ({
  getPathArray: jest.fn(() => { return mockPath.split("/"); })
}));

import * as React from "react";
import { App, AppProps, mapStateToProps } from "../app";
import { mount } from "enzyme";
import { bot } from "../__test_support__/fake_state/bot";
import {
  fakeUser, fakeWebAppConfig
} from "../__test_support__/fake_state/resources";
import { fakeState } from "../__test_support__/fake_state";
import {
  buildResourceIndex
} from "../__test_support__/resource_index_builder";
import { error } from "farmbot-toastr";
import { ResourceName } from "farmbot";

const FULLY_LOADED: ResourceName[] = [
  "Sequence", "Regimen", "FarmEvent", "Point", "Tool", "Device"];

const fakeProps = (): AppProps => {
  return {
    timeOffset: 0, // Default to UTC
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
  };
};

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
    expect(wrapper.text())
      .toContain("Farm DesignerControlsDeviceSequencesRegimensToolsFarmware");
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
    const result = mapStateToProps(state);
    expect(result.axisInversion.x).toEqual(true);
  });
});
