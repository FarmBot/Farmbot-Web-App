import * as React from "react";
import { shallow } from "enzyme";
import { BotOriginQuadrant } from "../../../../interfaces";
import { BotFigure, BotFigureProps } from "../bot_figure";
import { Color } from "../../../../../ui/index";
import {
  fakeMapTransformProps
} from "../../../../../__test_support__/map_transform_props";

describe("<BotFigure/>", () => {
  function fakeProps(): BotFigureProps {
    return {
      name: "",
      position: { x: 0, y: 0, z: 0 },
      mapTransformProps: fakeMapTransformProps(),
      plantAreaOffset: { x: 100, y: 100 }
    };
  }

  function checkPositionForQuadrant(
    quadrant: BotOriginQuadrant,
    xySwap: boolean,
    expected: { x: number, y: number },
    name: string,
    opacity: number) {
    it(`shows ${name} in correct location for quadrant ${quadrant}`, () => {
      const p = fakeProps();
      p.mapTransformProps.quadrant = quadrant;
      p.mapTransformProps.xySwap = xySwap;
      p.name = name;
      const result = shallow<BotFigure>(<BotFigure {...p} />);

      const expectedGantryProps = expect.objectContaining({
        id: "gantry",
        x: xySwap ? -100 : expected.x - 10,
        y: xySwap ? expected.x - 10 : -100,
        width: xySwap ? 1700 : 20,
        height: xySwap ? 20 : 1700,
        fill: Color.darkGray,
        fillOpacity: opacity
      });
      const gantryProps = result.find("rect").props();
      expect(gantryProps).toEqual(expectedGantryProps);

      const expectedUTMProps = expect.objectContaining({
        id: "UTM",
        cx: xySwap ? expected.y : expected.x,
        cy: xySwap ? expected.x : expected.y,
        r: 35,
        fill: Color.darkGray,
        fillOpacity: opacity
      });
      const UTMProps = result.find("circle").props();
      expect(UTMProps).toEqual(expectedUTMProps);
    });
  }

  checkPositionForQuadrant(1, false, { x: 3000, y: 0 }, "motors", 0.75);
  checkPositionForQuadrant(2, false, { x: 0, y: 0 }, "motors", 0.75);
  checkPositionForQuadrant(3, false, { x: 0, y: 1500 }, "motors", 0.75);
  checkPositionForQuadrant(4, false, { x: 3000, y: 1500 }, "motors", 0.75);
  checkPositionForQuadrant(1, true, { x: 0, y: 1500 }, "motors", 0.75);
  checkPositionForQuadrant(2, true, { x: 0, y: 0 }, "motors", 0.75);
  checkPositionForQuadrant(3, true, { x: 3000, y: 0 }, "motors", 0.75);
  checkPositionForQuadrant(4, true, { x: 3000, y: 1500 }, "motors", 0.75);
  checkPositionForQuadrant(2, false, { x: 0, y: 0 }, "encoders", 0.25);

  it("changes location", () => {
    const p = fakeProps();
    p.mapTransformProps.quadrant = 2;
    p.position = { x: 100, y: 200, z: 0 };
    const result = shallow<BotFigure>(<BotFigure {...p} />);
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
    const wrapper = shallow<BotFigure>(<BotFigure {...p} />);
    expect(wrapper.find("#gantry").props().fill).toEqual(Color.virtualRed);
  });

  it("shows coordinates on hover", () => {
    const p = fakeProps();
    p.position.x = 100;
    const wrapper = shallow<BotFigure>(<BotFigure {...p} />);
    expect(wrapper.instance().state.hovered).toBeFalsy();
    const utm = wrapper.find("#UTM");
    utm.simulate("mouseOver");
    expect(wrapper.instance().state.hovered).toBeTruthy();
    expect(wrapper.find("text").props()).toEqual(expect.objectContaining({
      x: 100, y: 0, dx: 40, dy: 0,
      textAnchor: "start", visibility: "visible",
    }));
    expect(wrapper.text()).toEqual("(100, 0, 0)");
    utm.simulate("mouseLeave");
    expect(wrapper.instance().state.hovered).toBeFalsy();
    expect(wrapper.find("text").props()).toEqual(
      expect.objectContaining({ visibility: "hidden" }));
  });

  it("shows coordinates on hover: X&Y swapped", () => {
    const p = fakeProps();
    p.position.x = 100;
    p.mapTransformProps.xySwap = true;
    const wrapper = shallow<BotFigure>(<BotFigure {...p} />);
    const utm = wrapper.find("#UTM");
    utm.simulate("mouseOver");
    expect(wrapper.instance().state.hovered).toBeTruthy();
    expect(wrapper.find("text").props()).toEqual(expect.objectContaining({
      x: 0, y: 100, dx: 0, dy: 55,
      textAnchor: "middle", visibility: "visible",
    }));
    expect(wrapper.text()).toEqual("(100, 0, 0)");
  });
});
