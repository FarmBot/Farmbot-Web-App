import * as React from "react";
import { FarmDesigner } from "../index";
import { mount } from "enzyme";
import { Props } from "../interfaces";
import { store } from "../../redux/store";
import { GardenMapLegendProps } from "../map/interfaces";

describe("<FarmDesigner/>", () => {
  function fakeProps(): Props {
    return {
      dispatch: jest.fn(),
      selectedPlant: undefined,
      designer: {
        selectedPlant: undefined,
        hoveredPlant: {
          plantUUID: undefined,
          icon: ""
        },
        cropSearchQuery: "",
        cropSearchResults: []
      },
      hoveredPlant: undefined,
      points: [],
      plants: [],
      toolSlots: [],
      crops: [],
      botPosition: { x: undefined, y: undefined, z: undefined }
    };
  }

  it("loads default map settings", () => {
    localStorage["showPoints"] = "false";
    const wrapper = mount(<FarmDesigner { ...fakeProps() } />, { context: { store } });
    const legendProps = wrapper.find("GardenMapLegend").props() as GardenMapLegendProps;
    expect(legendProps.zoomLvl).toEqual(1);
    expect(legendProps.legendMenuOpen).toBeFalsy();
    expect(legendProps.showPlants).toBeTruthy();
    expect(legendProps.showPoints).toBeTruthy();
    expect(legendProps.showSpread).toBeFalsy();
    expect(legendProps.showFarmbot).toBeTruthy();
    expect(legendProps.botOriginQuadrant).toEqual(2);
  });
});
