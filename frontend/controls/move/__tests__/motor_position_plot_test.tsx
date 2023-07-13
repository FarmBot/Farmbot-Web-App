jest.mock("moment", () => () => ({ unix: () => 1020 }));

import React from "react";
import { mount } from "enzyme";
import {
  MotorPositionPlot, MotorPositionHistory, MotorPositionPlotProps,
} from "../motor_position_plot";
import { BotPosition } from "../../../devices/interfaces";
import { ValidLocationData } from "../../../util/location";

describe("<MotorPositionPlot />", () => {
  const fakePosition = (): BotPosition => ({ x: 0, y: 0, z: 0 });
  const fakeLocationData = (): ValidLocationData => ({
    position: fakePosition(),
    scaled_encoders: fakePosition(),
    raw_encoders: fakePosition(),
    load: fakePosition(),
    axis_states: { x: "idle", y: "cruise", z: "idle" },
  });

  const fakeProps = (): MotorPositionPlotProps => ({
    locationData: fakeLocationData(),
  });

  it("renders", () => {
    const wrapper = mount(<MotorPositionPlot {...fakeProps()} />);
    ["x", "y", "z", "position", "seconds ago", "120", "100"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("renders motor position", () => {
    const location1 = fakeLocationData();
    const location2 = fakeLocationData();
    location2.position.x = 100;
    sessionStorage.setItem(MotorPositionHistory.array, JSON.stringify([
      { timestamp: 1000, locationData: location1 },
      { timestamp: 1010, locationData: location2 },
    ]));
    const wrapper = mount(<MotorPositionPlot {...fakeProps()} />);
    expect(wrapper.html()).toContain("M 120,0 L 120,0 L 110,-12.5 L 100,0");
    expect(wrapper.html()).toContain("M 120,0 L 120,0 L 110,0 L 100,0");
  });

  it("renders motor load", () => {
    const location1 = fakeLocationData();
    const location2 = fakeLocationData();
    location2.load.x = 100;
    location2.axis_states.x = "cruise";
    location1.load.x = 50;
    location1.axis_states.x = "idle";
    sessionStorage.setItem(MotorPositionHistory.array, JSON.stringify([
      { timestamp: 1000, locationData: location1 },
      { timestamp: 1010, locationData: location2 },
    ]));
    const p = fakeProps();
    p.load = true;
    const wrapper = mount(<MotorPositionPlot {...p} />);
    expect(wrapper.html()).toContain("M 120,0 L 120,0 L 110,-50 L 100,0");
    expect(wrapper.html()).toContain("M 120,0 L 120,0 L 110,0 L 100,0");
  });

  it("handles undefined data", () => {
    const location1 = fakeLocationData();
    const location2 = fakeLocationData();
    location2.position.x = undefined;
    sessionStorage.setItem(MotorPositionHistory.array, JSON.stringify([
      { timestamp: 1000, locationData: location1 },
      { timestamp: 1010, locationData: location2 },
    ]));
    const wrapper = mount(<MotorPositionPlot {...fakeProps()} />);
    expect(wrapper.html()).not.toContain("M 120,0 L 120,0 L 110,-12.5 L 100,0");
    expect(wrapper.html()).toContain("M 120,0 L 120,0 L 110,0 L 100,0");
  });
});
