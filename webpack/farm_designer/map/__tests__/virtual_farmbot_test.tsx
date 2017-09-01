import * as React from "react";
import { VirtualFarmBot, VFBProps } from "../virtual_farmbot";
import { shallow } from "enzyme";

describe("<VirtualFarmBot/>", () => {
  function fakeProps(): VFBProps {
    return {
      botPosition: { x: 0, y: 0, z: 0 },
      quadrant: 2,
    };
  }

  it("shows in correct location for quadrant 1", () => {
    const p = fakeProps();
    p.quadrant = 1;
    const result = shallow(<VirtualFarmBot {...p } />);
    expect(result.html()).toContain("<rect x=\"2990\" y=\"0\" width=\"20\" height=\"1500\"");
    expect(result.html()).toContain("<circle cx=\"3000\" cy=\"0\" r=\"35\"");
  });

  it("shows in correct location for quadrant 2", () => {
    const p = fakeProps();
    p.quadrant = 2;
    const result = shallow(<VirtualFarmBot {...p } />);
    expect(result.html()).toContain("<rect x=\"-10\" y=\"0\" width=\"20\" height=\"1500\"");
    expect(result.html()).toContain("<circle cx=\"0\" cy=\"0\" r=\"35\"");
  });

  it("shows in correct location for quadrant 3", () => {
    const p = fakeProps();
    p.quadrant = 3;
    const result = shallow(<VirtualFarmBot {...p } />);
    expect(result.html()).toContain("<rect x=\"-10\" y=\"0\" width=\"20\" height=\"1500\"");
    expect(result.html()).toContain("<circle cx=\"0\" cy=\"1500\" r=\"35\"");
  });

  it("shows in correct location for quadrant 4", () => {
    const p = fakeProps();
    p.quadrant = 4;
    const result = shallow(<VirtualFarmBot {...p } />);
    expect(result.html()).toContain("<rect x=\"2990\" y=\"0\" width=\"20\" height=\"1500\"");
    expect(result.html()).toContain("<circle cx=\"3000\" cy=\"1500\" r=\"35\"");
  });

  it("changes location", () => {
    const p = fakeProps();
    p.quadrant = 2;
    p.botPosition = { x: 100, y: 200, z: 0 };
    const result = shallow(<VirtualFarmBot {...p } />);
    expect(result.html()).toContain("<rect x=\"90\" y=\"0\" width=\"20\" height=\"1500\"");
    expect(result.html()).toContain("<circle cx=\"100\" cy=\"200\" r=\"35\"");
  });
});
