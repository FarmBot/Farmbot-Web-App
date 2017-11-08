import * as React from "react";
import { FarmBotLayer } from "../farmbot_layer";
import { shallow } from "enzyme";
import { FarmBotLayerProps } from "../../interfaces";

describe("<FarmBotLayer/>", () => {
  function fakeProps(): FarmBotLayerProps {
    return {
      visible: true,
      botLocationData: {
        position: { x: undefined, y: undefined, z: undefined },
        scaled_encoders: { x: undefined, y: undefined, z: undefined },
        raw_encoders: { x: undefined, y: undefined, z: undefined },
      },
      mapTransformProps: {
        quadrant: 1, gridSize: { x: 3000, y: 1500 }
      },
      stopAtHome: { x: true, y: true },
      botSize: {
        x: { value: 3000, isDefault: true },
        y: { value: 1500, isDefault: true }
      },
      plantAreaOffset: { x: 100, y: 100 },
      peripherals: [],
      eStopStatus: false
    };
  }

  it("shows layer elements", () => {
    const p = fakeProps();
    const result = shallow(<FarmBotLayer {...p } />);
    const layer = result.find("#farmbot-layer");
    expect(layer.find("#virtual-farmbot")).toBeTruthy();
    expect(layer.find("#extents")).toBeTruthy();
  });

  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const result = shallow(<FarmBotLayer {...p } />);
    expect(result.html()).toEqual("<g id=\"farmbot-layer\"></g>");
  });
});
