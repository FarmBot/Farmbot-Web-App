jest.mock("moment", () => () => ({ valueOf: () => 1020000 }));

import React from "react";
import { mount } from "enzyme";
import {
  MotorPositionPlot, MotorPositionHistory, MotorPositionPlotProps,
  updateMotorHistoryArray,
} from "../motor_position_plot";
import { BotPosition } from "../../../devices/interfaces";
import { ValidLocationData } from "../../../util/location";
import { bot } from "../../../__test_support__/fake_state/bot";

const fakePosition = (): BotPosition => ({ x: 0, y: 0, z: 0 });
const fakeLocationData = (): ValidLocationData => ({
  position: fakePosition(),
  scaled_encoders: fakePosition(),
  raw_encoders: fakePosition(),
  load: fakePosition(),
  axis_states: { x: "idle", y: "cruise", z: "idle" },
});

describe("<MotorPositionPlot />", () => {
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
      { timestamp: 1000000, locationData: location1 },
      { timestamp: 1010000, locationData: location2 },
    ]));
    const wrapper = mount(<MotorPositionPlot {...fakeProps()} />);
    expect(wrapper.html()).toContain("M 120,-12.5 L 120,-12.5 L 110,0");
    expect(wrapper.html()).toContain("M 120,0 L 120,0 L 110,0");
  });

  it("renders motor load", () => {
    const location1 = fakeLocationData();
    const location2 = fakeLocationData();
    location2.load.x = 100;
    location2.axis_states.x = "cruise";
    location1.load.x = 50;
    location1.axis_states.x = "idle";
    sessionStorage.setItem(MotorPositionHistory.array, JSON.stringify([
      { timestamp: 1000000, locationData: location1 },
      { timestamp: 1010000, locationData: location2 },
    ]));
    const p = fakeProps();
    p.load = true;
    p.firmwareSettings = bot.hardware.mcu_params;
    p.firmwareSettings.encoder_missed_steps_max_x = 100;
    p.firmwareSettings.encoder_missed_steps_max_y = 100;
    p.firmwareSettings.encoder_missed_steps_max_z = 100;
    const wrapper = mount(<MotorPositionPlot {...p} />);
    expect(wrapper.html()).toContain("M 120,-25 L 120,-50 L 110,0");
    expect(wrapper.html()).toContain("M 120,0 L 120,0 L 110,0");
    expect(wrapper.html()).toContain("line x1=\"0\" y1=\"-50\" x2=\"120\"");
  });

  it("handles undefined data", () => {
    const location1 = fakeLocationData();
    const location2 = fakeLocationData();
    location2.position.x = undefined;
    sessionStorage.setItem(MotorPositionHistory.array, JSON.stringify([
      { timestamp: 1000000, locationData: location1 },
      { timestamp: 1010000, locationData: location2 },
    ]));
    const wrapper = mount(<MotorPositionPlot {...fakeProps()} />);
    expect(wrapper.html()).not.toContain("M 120,-12.5 L 120,-12.5 L 110,0");
    expect(wrapper.html()).toContain("M 120,0 L 120,0 L 110,0");
  });
});

describe("updateMotorHistoryArray()", () => {
  it("initializes array", () => {
    sessionStorage.clear();
    expect(sessionStorage.getItem(MotorPositionHistory.array)).toBeFalsy();
    const locationData = fakeLocationData();
    const result = updateMotorHistoryArray(locationData);
    const expected = [{ timestamp: 1020000, locationData }];
    expect(result).toEqual(expected);
    expect(JSON.parse("" + sessionStorage.getItem(MotorPositionHistory.array)))
      .toEqual(expected);
  });

  it("doesn't add duplicate data to array", () => {
    expect(sessionStorage.getItem(MotorPositionHistory.array)).toBeTruthy();
    const locationData = fakeLocationData();
    const result = updateMotorHistoryArray(locationData);
    expect(result.length).toEqual(1);
  });
});
