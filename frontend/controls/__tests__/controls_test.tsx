import * as React from "react";
import { mount } from "enzyme";
import { RawControls as Controls } from "../controls";
import { bot } from "../../__test_support__/fake_state/bot";
import {
  fakePeripheral, fakeWebcamFeed, fakeSensor
} from "../../__test_support__/fake_state/resources";
import { Dictionary } from "farmbot";
import { Props } from "../interfaces";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";

describe("<Controls />", () => {
  const mockConfig: Dictionary<boolean> = {};

  const fakeProps = (): Props => ({
    dispatch: jest.fn(),
    bot: bot,
    feeds: [fakeWebcamFeed()],
    peripherals: [fakePeripheral()],
    sensors: [fakeSensor()],
    botToMqttStatus: "up",
    firmwareSettings: bot.hardware.mcu_params,
    shouldDisplay: () => true,
    getWebAppConfigVal: jest.fn((key) => (mockConfig[key])),
    sensorReadings: [],
    timeSettings: fakeTimeSettings(),
    env: {},
    firmwareHardware: undefined,
  });

  it("shows webcam widget", () => {
    mockConfig.hide_webcam_widget = false;
    const wrapper = mount(<Controls {...fakeProps()} />);
    const txt = wrapper.text().toLowerCase();
    ["webcam", "move", "peripherals", "sensors"]
      .map(string => expect(txt).toContain(string));
  });

  it("hides webcam widget", () => {
    mockConfig.hide_webcam_widget = true;
    const wrapper = mount(<Controls {...fakeProps()} />);
    const txt = wrapper.text().toLowerCase();
    ["move", "peripherals", "sensors"]
      .map(string => expect(txt).toContain(string));
    expect(txt).not.toContain("webcam");
  });

  it("shows sensors widget", () => {
    mockConfig.hide_webcam_widget = false;
    mockConfig.hide_sensors = false;
    const wrapper = mount(<Controls {...fakeProps()} />);
    const txt = wrapper.text().toLowerCase();
    ["webcam", "move", "peripherals", "sensors"]
      .map(string => expect(txt).toContain(string));
  });

  it("hides sensors widget", () => {
    mockConfig.hide_webcam_widget = true;
    mockConfig.hide_sensors = true;
    const wrapper = mount(<Controls {...fakeProps()} />);
    const txt = wrapper.text().toLowerCase();
    ["move", "peripherals"]
      .map(string => expect(txt).toContain(string));
    ["webcam", "sensors"]
      .map(string => expect(txt).not.toContain(string));
  });

  it("doesn't show sensor readings widget", () => {
    const p = fakeProps();
    mockConfig.hide_sensors = true;
    const wrapper = mount(<Controls {...p} />);
    const txt = wrapper.text().toLowerCase();
    expect(txt).not.toContain("sensor history");
  });

  it("shows sensor readings widget", () => {
    const p = fakeProps();
    mockConfig.hide_sensors = false;
    const wrapper = mount(<Controls {...p} />);
    const txt = wrapper.text().toLowerCase();
    expect(txt).toContain("sensor history");
  });
});
