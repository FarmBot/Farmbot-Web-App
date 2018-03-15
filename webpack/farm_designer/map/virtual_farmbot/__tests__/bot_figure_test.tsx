import * as React from "react";
import { shallow } from "enzyme";
import { BotOriginQuadrant } from "../../../interfaces";
import { BotFigure, BotFigureProps } from "../bot_figure";
import { Color } from "../../../../ui/index";

describe("<BotFigure/>", () => {
  function fakeProps(): BotFigureProps {
    return {
      name: "",
      position: { x: 0, y: 0, z: 0 },
      mapTransformProps: {
        quadrant: 1, gridSize: { x: 3000, y: 1500 }
      },
      plantAreaOffset: { x: 100, y: 100 }
    };
  }

  function checkPositionForQuadrant(
    quadrant: BotOriginQuadrant,
    expected: { x: number, y: number },
    name: string,
    opacity: number) {
    it(`shows ${name} in correct location for quadrant ${quadrant}`, () => {
      const p = fakeProps();
      p.mapTransformProps.quadrant = quadrant;
      p.name = name;
      const result = shallow(<BotFigure {...p} />);

      const expectedGantryProps = expect.objectContaining({
        id: "gantry",
        x: expected.x - 10,
        y: -100,
        width: 20,
        height: 1700,
        fill: Color.darkGray,
        fillOpacity: opacity
      });
      const gantryProps = result.find("rect").props();
      expect(gantryProps).toEqual(expectedGantryProps);

      const expectedUTMProps = expect.objectContaining({
        id: "UTM",
        cx: expected.x,
        cy: expected.y,
        r: 35,
        fill: Color.darkGray,
        fillOpacity: opacity
      });
      const UTMProps = result.find("circle").props();
      expect(UTMProps).toEqual(expectedUTMProps);
    });
  }

  checkPositionForQuadrant(1, { x: 3000, y: 0 }, "motors", 0.75);
  checkPositionForQuadrant(2, { x: 0, y: 0 }, "motors", 0.75);
  checkPositionForQuadrant(3, { x: 0, y: 1500 }, "motors", 0.75);
  checkPositionForQuadrant(4, { x: 3000, y: 1500 }, "motors", 0.75);
  checkPositionForQuadrant(2, { x: 0, y: 0 }, "encoders", 0.25);

  it("changes location", () => {
    const p = fakeProps();
    p.mapTransformProps.quadrant = 2;
    p.position = { x: 100, y: 200, z: 0 };
    const result = shallow(<BotFigure {...p} />);
    const gantry = result.find("#gantry");
    expect(gantry.length).toEqual(1);
    expect(gantry.props().x).toEqual(90);
    const UTM = result.find("circle").props();
    expect(UTM.cx).toEqual(100);
    expect(UTM.cy).toEqual(200);
  });

  it("changes color on e-stop", () => {
    const p = fakeProps();
    p.eStopStatus = true;
    const wrapper = shallow(<BotFigure {...p} />);
    expect(wrapper.find("#gantry").props().fill).toEqual(Color.virtualRed);
  });

  it("shows coordinates on hover", () => {
    const wrapper = shallow(<BotFigure {...fakeProps()} />);
    expect(wrapper.state().hovered).toBeFalsy();
    const utm = wrapper.find("#UTM");
    utm.simulate("mouseOver");
    expect(wrapper.state().hovered).toBeTruthy();
    utm.simulate("mouseLeave");
    expect(wrapper.state().hovered).toBeFalsy();
  });
});
