jest.mock("../../../../history", () => ({
  history: { push: jest.fn() },
  getPathArray: () => [],
}));

let mockAtMax = false;
let mockAtMin = false;
jest.mock("../../zoom", () => ({
  atMaxZoom: () => mockAtMax,
  atMinZoom: () => mockAtMin,
}));

let mockDev = false;
jest.mock("../../../../account/dev/dev_support", () => ({
  DevSettings: {
    futureFeaturesEnabled: () => mockDev,
  }
}));

import * as React from "react";
import { shallow, mount } from "enzyme";
import {
  GardenMapLegend, ZoomControls, PointsSubMenu,
} from "../garden_map_legend";
import { GardenMapLegendProps } from "../../interfaces";
import { BooleanSetting } from "../../../../session_keys";
import {
  fakeTimeSettings,
} from "../../../../__test_support__/fake_time_settings";

describe("<GardenMapLegend />", () => {
  const fakeProps = (): GardenMapLegendProps => ({
    zoom: () => () => undefined,
    toggle: () => () => undefined,
    legendMenuOpen: true,
    showPlants: false,
    showPoints: false,
    showWeeds: false,
    showSpread: false,
    showFarmbot: false,
    showImages: false,
    showZones: false,
    showSensorReadings: false,
    hasSensorReadings: false,
    dispatch: jest.fn(),
    timeSettings: fakeTimeSettings(),
    getConfigValue: jest.fn(),
    imageAgeInfo: { newestDate: "", toOldest: 1 },
  });

  it("renders", () => {
    const wrapper = mount(<GardenMapLegend {...fakeProps()} />);
    ["plants", "move"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
    expect(wrapper.html()).toContain("filter");
    expect(wrapper.html()).not.toContain("extras");
  });

  it("shows submenu", () => {
    mockDev = true;
    const p = fakeProps();
    p.hasSensorReadings = true;
    const wrapper = mount(<GardenMapLegend {...p} />);
    expect(wrapper.html()).toContain("filter");
    expect(wrapper.html()).toContain("extras");
    mockDev = false;
  });
});

describe("<ZoomControls />", () => {
  const expectDisabledBtnCountToEqual = (expected: number) => {
    const wrapper = shallow(<ZoomControls
      zoom={jest.fn()}
      getConfigValue={jest.fn()} />);
    expect(wrapper.find(".disabled").length).toEqual(expected);
  };

  it("zoom buttons active", () => {
    mockAtMax = false;
    mockAtMin = false;
    expectDisabledBtnCountToEqual(0);
  });

  it("zoom out button disabled", () => {
    mockAtMax = false;
    mockAtMin = true;
    expectDisabledBtnCountToEqual(1);
  });

  it("zoom in button disabled", () => {
    mockAtMax = true;
    mockAtMin = false;
    expectDisabledBtnCountToEqual(1);
  });
});

describe("<PointsSubMenu />", () => {
  it("shows historic points", () => {
    const toggle = jest.fn();
    const wrapper = shallow(<PointsSubMenu
      toggle={toggle}
      getConfigValue={() => true} />);
    const toggleBtn = wrapper.find("LayerToggle");
    expect(toggleBtn.props().value).toEqual(true);
    toggleBtn.simulate("click");
    expect(toggle).toHaveBeenCalledWith(BooleanSetting.show_historic_points);
  });
});
