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
      zoomLvl: 1.8,
      activeDragXY: { x: undefined, y: undefined, z: undefined }
    };
  }

  it("renders plant", () => {
    let wrapper = shallow(<GardenPlant {...fakeProps() } />);
    expect(wrapper.find("image").length).toEqual(1);
    expect(wrapper.find("image").props().opacity).toEqual(1);
    expect(wrapper.find("Circle").length).toEqual(1);
    expect(wrapper.find("Circle").props().selected).toBeFalsy();
    expect(wrapper.find("text").length).toEqual(0);
    expect(wrapper.find("rect").length).toEqual(0);
  });

  it("renders drag helpers", () => {
    let p = fakeProps();
    p.dragging = true;
    let wrapper = shallow(<GardenPlant {...p } />);
    expect(wrapper.find("#coordinates-tooltip").length).toEqual(1);
    expect(wrapper.find("#long-crosshair").length).toEqual(1);
    expect(wrapper.find("#short-crosshair").length).toEqual(1);
    expect(wrapper.find("#vert-alignment-indicator").length).toEqual(0);
    expect(wrapper.find("#horiz-alignment-indicator").length).toEqual(0);
  });

  it("renders coordinates tooltip while dragging", () => {
    let p = fakeProps();
    p.dragging = true;
    let wrapper = shallow(<GardenPlant {...p } />);
    expect(wrapper.find("text").length).toEqual(1);
    expect(wrapper.find("text").text()).toEqual("100, 200");
    expect(wrapper.find("text").props().fontSize).toEqual("1.25rem");
    expect(wrapper.find("text").props().dy).toEqual(-20);
  });

  it("renders coordinates tooltip while dragging: scaled", () => {
    let p = fakeProps();
    p.dragging = true;
    p.zoomLvl = 0.9;
    let wrapper = shallow(<GardenPlant {...p } />);
    expect(wrapper.find("text").length).toEqual(1);
    expect(wrapper.find("text").text()).toEqual("100, 200");
    expect(wrapper.find("text").props().fontSize).toEqual("3rem");
    expect(wrapper.find("text").props().dy).toEqual(-48);
  });

  it("renders crosshair while dragging", () => {
    let p = fakeProps();
    p.dragging = true;
    let wrapper = shallow(<GardenPlant {...p } />);
    let crosshair = wrapper.find("#short-crosshair");
    expect(crosshair.length).toEqual(1);
    let r1Props = crosshair.find("rect").at(0).props();
    expect(r1Props).toEqual({
      "height": 2, "width": 8, "x": 90, "y": 199, "style": { "fill": "#434343" }
    });
    let r2Props = crosshair.find("rect").at(1).props();
    expect(r2Props).toEqual({
      "height": 8, "width": 2, "x": 99, "y": 190, "style": { "fill": "#434343" }
    });
    let r3Props = crosshair.find("rect").at(2).props();
    expect(r3Props).toEqual({
      "height": 2, "width": 8, "x": 102, "y": 199, "style": { "fill": "#434343" }
    });
    let r4Props = crosshair.find("rect").at(3).props();
    expect(r4Props).toEqual({
      "height": 8, "width": 2, "x": 99, "y": 202, "style": { "fill": "#434343" }
    });
  });

  it("renders crosshair while dragging: scaled", () => {
    let p = fakeProps();
    p.dragging = true;
    p.zoomLvl = 0.9;
    let wrapper = shallow(<GardenPlant {...p } />);
    let crosshair = wrapper.find("#short-crosshair");
    expect(crosshair.length).toEqual(1);
    let r1Props = crosshair.find("rect").at(0).props();
    expect(r1Props).toEqual({
      "height": 4.8, "width": 19.2, "x": 76, "y": 197.6, "style": { "fill": "#434343" }
    });
    let r2Props = crosshair.find("rect").at(1).props();
    expect(r2Props).toEqual({
      "height": 19.2, "width": 4.8, "x": 97.6, "y": 176, "style": { "fill": "#434343" }
    });
    let r3Props = crosshair.find("rect").at(2).props();
    expect(r3Props).toEqual({
      "height": 4.8, "width": 19.2, "x": 104.8, "y": 197.6, "style": { "fill": "#434343" }
    });
    let r4Props = crosshair.find("rect").at(3).props();
    expect(r4Props).toEqual({
      "height": 19.2, "width": 4.8, "x": 97.6, "y": 204.8, "style": { "fill": "#434343" }
    });
  });

  it("renders vertical alignment indicators", () => {
    let p = fakeProps();
    p.dragging = false;
    p.plant.body.x = 100;
    p.plant.body.y = 100;
    p.activeDragXY = { x: 100, y: 0, z: 0 };
    let wrapper = shallow(<GardenPlant {...p } />);
    expect(wrapper.find("#vert-alignment-indicator").length).toEqual(1);
    expect(wrapper.find("#horiz-alignment-indicator").length).toEqual(0);
    expect(wrapper.find("rect").length).toEqual(2);
  });

  it("renders horizontal alignment indicators", () => {
    let p = fakeProps();
    p.dragging = false;
    p.plant.body.x = 100;
    p.plant.body.y = 100;
    p.activeDragXY = { x: 0, y: 100, z: 0 };
    let wrapper = shallow(<GardenPlant {...p } />);
    expect(wrapper.find("#vert-alignment-indicator").length).toEqual(0);
    expect(wrapper.find("#horiz-alignment-indicator").length).toEqual(1);
    expect(wrapper.find("rect").length).toEqual(2);
  });

});
