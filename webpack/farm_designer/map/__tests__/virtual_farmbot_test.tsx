import * as React from "react";
import { VirtualFarmBot } from "../virtual_farmbot";
import { shallow } from "enzyme";
import { VirtualFarmBotProps } from "../interfaces";
import { BotOriginQuadrant } from "../../interfaces";

describe("<VirtualFarmBot/>", () => {
  function fakeProps(): VirtualFarmBotProps {
    return {
      botPosition: { x: 0, y: 0, z: 0 },
      mapTransformProps: {
        quadrant: 1, gridSize: { x: 3000, y: 1500 }
      },
      plantAreaOffset: { x: 100, y: 100 }
    };
  }

  function checkPositionForQuadrant(
    quadrant: BotOriginQuadrant,
    expected: { x: number, y: number }) {
    it(`shows in correct location for quadrant ${quadrant}`, () => {
      const p = fakeProps();
      p.mapTransformProps.quadrant = quadrant;
      const result = shallow(<VirtualFarmBot {...p } />);

      const expectedGantryProps = {
        id: "gantry",
        x: expected.x - 10,
        y: -100,
        width: 20,
        height: 1700,
        fill: "#434343",
        fillOpacity: 0.75
      };
      const gantryProps = result.find("rect").props();
      expect(gantryProps).toEqual(expectedGantryProps);

      const expectedUTMProps = {
        id: "UTM",
        cx: expected.x,
        cy: expected.y,
        r: 35,
        fill: "#434343",
        fillOpacity: 0.75
      };
      const UTMProps = result.find("circle").props();
      expect(UTMProps).toEqual(expectedUTMProps);
    });
  }

  checkPositionForQuadrant(1, { x: 3000, y: 0 });
  checkPositionForQuadrant(2, { x: 0, y: 0 });
  checkPositionForQuadrant(3, { x: 0, y: 1500 });
  checkPositionForQuadrant(4, { x: 3000, y: 1500 });

  it("changes location", () => {
    const p = fakeProps();
    p.mapTransformProps.quadrant = 2;
    p.botPosition = { x: 100, y: 200, z: 0 };
    const result = shallow(<VirtualFarmBot {...p } />);
    expect(result.find("#gantry").props().x).toEqual(90);
    const UTM = result.find("circle").props();
    expect(UTM.cx).toEqual(100);
    expect(UTM.cy).toEqual(200);
  });
});
