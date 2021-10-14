import React from "react";
import {
  SensorReadingsLayer, SensorReadingsLayerProps,
} from "../sensor_readings_layer";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import {
  fakeSensorReading, fakeSensor,
} from "../../../../../__test_support__/fake_state/resources";
import {
  fakeTimeSettings,
} from "../../../../../__test_support__/fake_time_settings";
import { svgMount } from "../../../../../__test_support__/svg_mount";
import { ANALOG } from "farmbot";

describe("<SensorReadingsLayer />", () => {
  const fakeProps = (): SensorReadingsLayerProps => ({
    visible: true,
    overlayVisible: false,
    sensorReadings: [fakeSensorReading()],
    mapTransformProps: fakeMapTransformProps(),
    timeSettings: fakeTimeSettings(),
    sensors: [fakeSensor()],
    farmwareEnvs: [],
  });

  it("renders", () => {
    const wrapper = svgMount(<SensorReadingsLayer {...fakeProps()} />);
    expect(wrapper.html()).toContain("sensor-readings-layer");
  });

  it("shows empty moisture map", () => {
    const p = fakeProps();
    p.overlayVisible = true;
    p.sensors[0].body.label = "tool";
    p.sensors[0].body.pin = 0;
    const wrapper = svgMount(<SensorReadingsLayer {...p} />);
    const layer = wrapper.find("#sensor-readings-layer");
    expect(layer.find("#interpolation-map").length).toEqual(1);
    expect(layer.find("rect").length).toEqual(0);
  });

  it("shows moisture map", () => {
    const p = fakeProps();
    p.overlayVisible = true;
    p.sensors[0].body.label = "soil";
    p.sensorReadings[0].body.mode = ANALOG;
    const reading = fakeSensorReading();
    reading.body.mode = ANALOG;
    reading.body.value = 1000;
    reading.body.x = 100;
    reading.body.y = 200;
    p.sensorReadings.push(reading);
    const wrapper = svgMount(<SensorReadingsLayer {...p} />);
    const layer = wrapper.find("#sensor-readings-layer");
    expect(layer.find("#interpolation-map").length).toEqual(1);
    expect(layer.find("rect").length).toEqual(1800);
  });
});
