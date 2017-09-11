import * as React from "react";
import { FarmBotLayer } from "../farmbot_layer";
import { shallow } from "enzyme";
import { FarmBotLayerProps } from "../../interfaces";

describe("<FarmBotLayer/>", () => {
  function fakeProps(): FarmBotLayerProps {
    return {
      visible: true,
      botPosition: { x: 0, y: 0, z: 0 },
      mapTransformProps: {
        quadrant: 1, gridSize: { x: 3000, y: 1500 }
      },
      stopAtHome: { x: true, y: true },
      botSize: {
        x: { value: 3000, isDefault: true },
        y: { value: 1500, isDefault: true }
      },
      plantAreaOffset: { x: 100, y: 100 }
    };
  }
  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const result = shallow(<FarmBotLayer {...p } />);
    expect(result.html()).toEqual("<g></g>");
  });
});
