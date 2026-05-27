import React from "react";
import { render } from "@testing-library/react";
import { MoistureSurface, MoistureSurfaceProps } from "../moisture_texture";
import { clone } from "lodash";
import { INITIAL } from "../../config";
import {
  fakeSensor, fakeSensorReading,
} from "../../../__test_support__/fake_state/resources";
import * as interpolationMap from
  "../../../farm_designer/map/layers/points/interpolation_map";

describe("<MoistureSurface />", () => {
  const fakeProps = (): MoistureSurfaceProps => ({
    config: clone(INITIAL),
    sensors: [],
    sensorReadings: [],
    showMoistureReadings: true,
    showMoistureMap: true,
    position: [0, 0, 0],
    color: "black",
    radius: 10,
  });

  it("renders with readings", () => {
    const p = fakeProps();
    p.showMoistureReadings = true;
    const reading = fakeSensorReading();
    reading.body.pin = 1;
    reading.body.mode = 1;
    p.sensorReadings = [reading];
    const sensor = fakeSensor();
    sensor.body.pin = 1;
    sensor.body.label = "soil moisture";
    p.sensors = [sensor];
    const { container } = render(<MoistureSurface {...p} />);
    expect(container).toContainHTML("moisture-layer");
  });

  it("renders without readings", () => {
    const p = fakeProps();
    p.showMoistureReadings = false;
    const { container } = render(<MoistureSurface {...p} />);
    expect(container).toContainHTML("moisture-layer");
  });

  it("renders the moisture map with a native instanced mesh", () => {
    const { container } = render(<MoistureSurface {...fakeProps()} />);
    expect(container.querySelector("instancedmesh")).toBeTruthy();
    expect(container.querySelector(".instances")).toBeFalsy();
    expect(container.querySelector(".instance")).toBeFalsy();
  });

  it("skips interpolation when the moisture map is hidden", () => {
    const generateData = jest.spyOn(interpolationMap, "generateData");
    const p = fakeProps();
    p.showMoistureMap = false;
    render(<MoistureSurface {...p} />);
    expect(generateData).not.toHaveBeenCalled();
  });
});
