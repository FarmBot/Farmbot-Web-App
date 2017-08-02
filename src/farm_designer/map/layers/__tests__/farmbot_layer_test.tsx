import * as React from "react";
import { FarmBotLayer, FarmBotLayerProps } from "../farmbot_layer";
import { shallow } from "enzyme";

describe("<FarmBotLayer/>", () => {
  function fakeProps(): FarmBotLayerProps {
    return {
      visible: true,
      botPosition: { x: 0, y: 0, z: 0 },
      botOriginQuadrant: 2
    };
  }
  it("toggles visibility off", () => {
    let p = fakeProps();
    p.visible = false;
    let result = shallow(<FarmBotLayer {...p } />);
    expect(result.html()).toEqual("<g></g>");
  });

  it("shows in correct location for quadrant 1", () => {
    let p = fakeProps();
    p.botOriginQuadrant = 1;
    let result = shallow(<FarmBotLayer {...p } />);
    expect(result.html()).toContain("<rect x=\"2992\" y=\"0\" width=\"20\" height=\"1500\"");
    expect(result.html()).toContain("<circle cx=\"3002\" cy=\"0\" r=\"35\"");
  });

  it("shows in correct location for quadrant 2", () => {
    let p = fakeProps();
    p.botOriginQuadrant = 2;
    let result = shallow(<FarmBotLayer {...p } />);
    expect(result.html()).toContain("<rect x=\"-10\" y=\"0\" width=\"20\" height=\"1500\"");
    expect(result.html()).toContain("<circle cx=\"0\" cy=\"0\" r=\"35\"");
  });

  it("shows in correct location for quadrant 3", () => {
    let p = fakeProps();
    p.botOriginQuadrant = 3;
    let result = shallow(<FarmBotLayer {...p } />);
    expect(result.html()).toContain("<rect x=\"-10\" y=\"0\" width=\"20\" height=\"1500\"");
    expect(result.html()).toContain("<circle cx=\"0\" cy=\"1502\" r=\"35\"");
  });

  it("shows in correct location for quadrant 4", () => {
    let p = fakeProps();
    p.botOriginQuadrant = 4;
    let result = shallow(<FarmBotLayer {...p } />);
    expect(result.html()).toContain("<rect x=\"2992\" y=\"0\" width=\"20\" height=\"1500\"");
    expect(result.html()).toContain("<circle cx=\"3002\" cy=\"1502\" r=\"35\"");
  });

  it("changes location", () => {
    let p = fakeProps();
    p.botOriginQuadrant = 2;
    p.botPosition = { x: 100, y: 200, z: 0 };
    let result = shallow(<FarmBotLayer {...p } />);
    expect(result.html()).toContain("<rect x=\"90\" y=\"0\" width=\"20\" height=\"1500\"");
    expect(result.html()).toContain("<circle cx=\"100\" cy=\"200\" r=\"35\"");
  });
});
