import * as React from "react";
import { GardenPlant } from "../garden_plant";
import { shallow } from "enzyme";
import { GardenPlantProps } from "../../interfaces";
import { fakePlant } from "../../../__test_support__/fake_state/resources";

describe("<GardenPlant/>", () => {
  function fakeProps(): GardenPlantProps {
    return {
      quadrant: 2,
      plant: fakePlant(),
      selected: false,
      dragging: false,
      onClick: jest.fn(),
      dispatch: jest.fn(),
      zoomLvl: 1.8
    };
  }

  it("renders plant", () => {
    let result = shallow(<GardenPlant {...fakeProps() } />);
    expect(result.find("image").length).toEqual(1);
    expect(result.find("image").props().opacity).toEqual(1);
    expect(result.find("Circle").length).toEqual(1);
    expect(result.find("Circle").props().selected).toBeFalsy();
    expect(result.find("text").length).toEqual(0);
    expect(result.find("rect").length).toEqual(0);
  });

  it("renders coordinates tooltip while dragging", () => {
    let p = fakeProps();
    p.dragging = true;
    let result = shallow(<GardenPlant {...p } />);
    expect(result.find("text").length).toEqual(1);
    expect(result.find("text").text()).toEqual("100, 200");
    expect(result.find("text").props().fontSize).toEqual("1.25rem");
    expect(result.find("text").props().dy).toEqual(-20);
  });

  it("renders coordinates tooltip while dragging: scaled", () => {
    let p = fakeProps();
    p.dragging = true;
    p.zoomLvl = 0.9;
    let result = shallow(<GardenPlant {...p } />);
    expect(result.find("text").length).toEqual(1);
    expect(result.find("text").text()).toEqual("100, 200");
    expect(result.find("text").props().fontSize).toEqual("3rem");
    expect(result.find("text").props().dy).toEqual(-48);
  });

  it("renders crosshair while dragging", () => {
    let p = fakeProps();
    p.dragging = true;
    let result = shallow(<GardenPlant {...p } />);
    expect(result.find("rect").length).toEqual(4);
    let r1Props = result.find("rect").at(0).props();
    expect(r1Props).toEqual({ "height": 2, "width": 8, "x": 90, "y": 199 });
    let r2Props = result.find("rect").at(1).props();
    expect(r2Props).toEqual({ "height": 8, "width": 2, "x": 99, "y": 190 });
    let r3Props = result.find("rect").at(2).props();
    expect(r3Props).toEqual({ "height": 2, "width": 8, "x": 102, "y": 199 });
    let r4Props = result.find("rect").at(3).props();
    expect(r4Props).toEqual({ "height": 8, "width": 2, "x": 99, "y": 202 });
  });

  it("renders crosshair while dragging: scaled", () => {
    let p = fakeProps();
    p.dragging = true;
    p.zoomLvl = 0.9;
    let result = shallow(<GardenPlant {...p } />);
    expect(result.find("rect").length).toEqual(4);
    let r1Props = result.find("rect").at(0).props();
    expect(r1Props).toEqual({ "height": 4.8, "width": 19.2, "x": 76, "y": 197.6 });
    let r2Props = result.find("rect").at(1).props();
    expect(r2Props).toEqual({ "height": 19.2, "width": 4.8, "x": 97.6, "y": 176 });
    let r3Props = result.find("rect").at(2).props();
    expect(r3Props).toEqual({ "height": 4.8, "width": 19.2, "x": 104.8, "y": 197.6 });
    let r4Props = result.find("rect").at(3).props();
    expect(r4Props).toEqual({ "height": 19.2, "width": 4.8, "x": 97.6, "y": 204.8 });
  });
});
