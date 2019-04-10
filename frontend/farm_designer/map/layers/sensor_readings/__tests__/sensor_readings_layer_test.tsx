import * as React from "react";
import { mount } from "enzyme";
import {
  SensorReadingsLayer, SensorReadingsLayerProps
} from "../sensor_readings_layer";
import {
  fakeMapTransformProps
} from "../../../../../__test_support__/map_transform_props";
import {
  fakeSensorReading, fakeSensor
} from "../../../../../__test_support__/fake_state/resources";
import {
  fakeTimeSettings
} from "../../../../../__test_support__/fake_time_settings";

describe("<SensorReadingsLayer />", () => {
  const fakeProps = (): SensorReadingsLayerProps => ({
    visible: true,
    sensorReadings: [fakeSensorReading()],
    mapTransformProps: fakeMapTransformProps(),
    timeSettings: fakeTimeSettings(),
    sensors: [fakeSensor()],
  });

  it("renders", () => {
    const wrapper = mount(<SensorReadingsLayer {...fakeProps()} />);
    expect(wrapper.html()).toContain("sensor-readings-layer");
  });
});
