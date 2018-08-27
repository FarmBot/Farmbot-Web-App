jest.mock("../../../history", () => ({ history: { push: jest.fn() } }));

let mockAtMax = false;
let mockAtMin = false;
jest.mock("../zoom", () => {
  return {
    atMaxZoom: () => mockAtMax,
    atMinZoom: () => mockAtMin,
  };
});

import * as React from "react";
import { shallow, mount } from "enzyme";
import { GardenMapLegend, ZoomControls } from "../garden_map_legend";
import { GardenMapLegendProps } from "../interfaces";

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
    dispatch: jest.fn(),
    tzOffset: 0,
    getConfigValue: jest.fn(),
    imageAgeInfo: { newestDate: "", toOldest: 1 },
  });

  it("renders", () => {
    const wrapper = mount(<GardenMapLegend {...fakeProps()} />);
    ["plants", "origin", "move"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
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
