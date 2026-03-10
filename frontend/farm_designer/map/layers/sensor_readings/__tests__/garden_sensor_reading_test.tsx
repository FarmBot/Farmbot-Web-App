import React from "react";
import { fireEvent, render } from "@testing-library/react";
import {
  GardenSensorReading, GardenSensorReadingProps,
} from "../garden_sensor_reading";
import {
  fakeSensorReading,
} from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import {
  fakeTimeSettings,
} from "../../../../../__test_support__/fake_time_settings";

describe("<GardenSensorReading />", () => {
  const fakeProps = (): GardenSensorReadingProps => ({
    sensorReading: fakeSensorReading(),
    mapTransformProps: fakeMapTransformProps(),
    endTime: undefined,
    timeSettings: fakeTimeSettings(),
    sensorLookup: {},
  });

  const renderReading = (props: GardenSensorReadingProps) =>
    render(<svg><GardenSensorReading {...props} /></svg>);

  const getFirstCircle = (container: HTMLElement) => {
    const circle = container.querySelector("circle");
    if (!circle) { throw new Error("Missing sensor reading circle"); }
    return circle;
  };

  it("renders", () => {
    const { container } = renderReading(fakeProps());
    expect(container.innerHTML).toContain("sensor-reading-");
    expect(container.querySelectorAll("circle").length).toEqual(2);
  });

  it("doesn't render", () => {
    const p = fakeProps();
    p.sensorReading.body.x = undefined;
    const { container } = renderReading(p);
    expect(container.querySelectorAll("circle").length).toEqual(0);
  });

  it("renders sensor name", () => {
    const p = fakeProps();
    p.sensorLookup = { 1: "Sensor Name" };
    const { container } = renderReading(p);
    expect(container.textContent).toContain("Sensor Name (pin 1)");
  });

  it("renders analog reading", () => {
    const p = fakeProps();
    p.sensorReading.body.mode = 1;
    const { container } = renderReading(p);
    expect(container.textContent).toContain("value 0 (analog)");
  });

  it("calls hover", () => {
    const { container } = renderReading(fakeProps());
    const text = container.querySelector("text");
    if (!text) { throw new Error("Missing sensor reading text"); }
    fireEvent.mouseEnter(getFirstCircle(container));
    expect(text.getAttribute("visibility")).toEqual("visible");
    fireEvent.mouseLeave(getFirstCircle(container));
    expect(text.getAttribute("visibility")).toEqual("hidden");
  });
});
