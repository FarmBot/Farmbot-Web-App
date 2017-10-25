import * as React from "react";
import { shallow } from "enzyme";
import { GardenMapLegend } from "../garden_map_legend";
import { GardenMapLegendProps } from "../interfaces";

describe("<GardenMapLegend />", () => {
  function fakeProps(): GardenMapLegendProps {
    return {
      zoom: () => () => undefined,
      toggle: () => () => undefined,
      updateBotOriginQuadrant: () => () => undefined,
      botOriginQuadrant: 2,
      zoomLvl: 1,
      legendMenuOpen: true,
      showPlants: false,
      showPoints: false,
      showSpread: false,
      showFarmbot: false
    };
  }

  function checkZoomButtons(level: number, disabled: number) {
    const p = fakeProps();
    p.zoomLvl = level;
    const wrapper = shallow(<GardenMapLegend {...p} />);
    expect(wrapper.find(".disabled").length).toEqual(disabled);
  }

  const MAX = 1.8;
  const MIN = 0.1;

  it("zoom buttons active", () => {
    checkZoomButtons(1.0, 0);
    checkZoomButtons(MIN + 0.1, 0);
  });

  it("zoom out button disabled", () => {
    checkZoomButtons(MIN + 0.01, 1);
    checkZoomButtons(MIN, 1);
    checkZoomButtons(MIN - 0.05, 1);
  });

  it("zoom in button disabled", () => {
    checkZoomButtons(MAX - 0.01, 1);
    checkZoomButtons(MAX, 1);
    checkZoomButtons(MAX + 0.05, 1);
  });
});
