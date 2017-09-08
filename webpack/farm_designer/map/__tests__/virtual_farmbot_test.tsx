import * as React from "react";
import { VirtualFarmBot } from "../virtual_farmbot";
import { shallow } from "enzyme";
import { VirtualFarmBotProps } from "../interfaces";

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

  it("shows in correct location for quadrant 1", () => {
    const p = fakeProps();
    p.mapTransformProps.quadrant = 1;
    const result = shallow(<VirtualFarmBot {...p } />);
    expect(result.html()).toContain("<rect x=\"2990\" y=\"-100\" width=\"20\" height=\"1700\"");
    expect(result.html()).toContain("<circle cx=\"3000\" cy=\"0\" r=\"35\"");
  });

  it("shows in correct location for quadrant 2", () => {
    const p = fakeProps();
    p.mapTransformProps.quadrant = 2;
    const result = shallow(<VirtualFarmBot {...p } />);
    expect(result.html()).toContain("<rect x=\"-10\" y=\"-100\" width=\"20\" height=\"1700\"");
    expect(result.html()).toContain("<circle cx=\"0\" cy=\"0\" r=\"35\"");
  });

  it("shows in correct location for quadrant 3", () => {
    const p = fakeProps();
    p.mapTransformProps.quadrant = 3;
    const result = shallow(<VirtualFarmBot {...p } />);
    expect(result.html()).toContain("<rect x=\"-10\" y=\"-100\" width=\"20\" height=\"1700\"");
    expect(result.html()).toContain("<circle cx=\"0\" cy=\"1500\" r=\"35\"");
  });

  it("shows in correct location for quadrant 4", () => {
    const p = fakeProps();
    p.mapTransformProps.quadrant = 4;
    const result = shallow(<VirtualFarmBot {...p } />);
    expect(result.html()).toContain("<rect x=\"2990\" y=\"-100\" width=\"20\" height=\"1700\"");
    expect(result.html()).toContain("<circle cx=\"3000\" cy=\"1500\" r=\"35\"");
  });

  it("changes location", () => {
    const p = fakeProps();
    p.mapTransformProps.quadrant = 2;
    p.botPosition = { x: 100, y: 200, z: 0 };
    const result = shallow(<VirtualFarmBot {...p } />);
    expect(result.html()).toContain("<rect x=\"90\" y=\"-100\" width=\"20\" height=\"1700\"");
    expect(result.html()).toContain("<circle cx=\"100\" cy=\"200\" r=\"35\"");
  });
});
