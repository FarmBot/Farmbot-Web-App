jest.mock("moment", () => () => ({ unix: () => 1020 }));

import * as React from "react";
import { mount } from "enzyme";
import { MotorPositionPlot, MotorPositionHistory } from "../motor_position_plot";
import { BotLocationData, BotPosition } from "../../../devices/interfaces";

describe("<MotorPositionPlot />", () => {
  const fakePosition = (): BotPosition => ({ x: 0, y: 0, z: 0 });
  const fakeLocationData = (): BotLocationData => ({
    position: fakePosition(),
    scaled_encoders: fakePosition(),
    raw_encoders: fakePosition()
  });

  const fakeProps = () => ({
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
