jest.mock("../../../../history", () => ({ history: { push: jest.fn() } }));

let mockAtMax = false;
let mockAtMin = false;
jest.mock("../../zoom", () => {
  return {
    atMaxZoom: () => mockAtMax,
    atMinZoom: () => mockAtMin,
  };
});

import * as React from "react";
import { shallow, mount } from "enzyme";
import {
  GardenMapLegend, ZoomControls, PointsSubMenu
} from "../garden_map_legend";
import { GardenMapLegendProps } from "../../interfaces";
import { clickButton } from "../../../../__test_support__/helpers";
import { history } from "../../../../history";
import { BooleanSetting } from "../../../../session_keys";

describe("<GardenMapLegend />", () => {
  const fakeProps = (): GardenMapLegendProps => ({
    zoom: () => () => undefined,
    toggle: () => () => undefined,
    updateBotOriginQuadrant: () => () => undefined,
    botOriginQuadrant: 2,
    legendMenuOpen: true,
    showPlants: false,
    showPoints: false,
    showSpread: false,
    showFarmbot: false,
    showImages: false,
    showSensorReadings: false,
    dispatch: jest.fn(),
    tzOffset: 0,
    getConfigValue: jest.fn(),
    imageAgeInfo: { newestDate: "", toOldest: 1 },
  });

  it("renders", () => {
    const wrapper = mount(<GardenMapLegend {...fakeProps()} />);
    ["plants", "origin", "move"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
    expect(wrapper.html()).toContain("filter");
    expect(wrapper.html()).not.toContain("extras");
  });

  it("shows submenu", () => {
    localStorage.setItem("FUTURE_FEATURES", "true");
    const wrapper = mount(<GardenMapLegend {...fakeProps()} />);
    expect(wrapper.html()).toContain("filter");
    expect(wrapper.html()).toContain("extras");
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
  it("navigates to point creator", () => {
    const wrapper = mount(<PointsSubMenu
      toggle={jest.fn()}
      getConfigValue={jest.fn()} />);
    clickButton(wrapper, 0, "point creator");
    expect(history.push).toHaveBeenCalledWith(
      "/app/designer/plants/create_point");
  });

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
