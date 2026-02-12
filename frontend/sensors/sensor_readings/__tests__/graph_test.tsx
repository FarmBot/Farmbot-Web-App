import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { SensorReadingsPlot, calcTimeParams } from "../graph";
import { SensorReadingPlotProps } from "../interfaces";
import {
  fakeSensorReading,
} from "../../../__test_support__/fake_state/resources";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";

describe("<SensorReadingPlot />", () => {
  function fakeProps(sr = fakeSensorReading()): SensorReadingPlotProps {
    return {
      readingsForPeriod: () => [sr],
      endDate: 1515715140,
      timeSettings: fakeTimeSettings(),
      hover: jest.fn(),
      hovered: undefined,
      showPreviousPeriod: false,
      timePeriod: 3600 * 24,
    };
  }

  it("renders", () => {
    const { container } = render(<SensorReadingsPlot {...fakeProps()} />);
    const txt = container.textContent?.toLowerCase() || "";
    ["analog", "digital", "pm", "500"]
      .map(string => expect(txt).toContain(string));
  });

  it("renders years", () => {
    const p = fakeProps();
    p.timePeriod = 3600 * 24 * 365;
    const { container } = render(<SensorReadingsPlot {...p} />);
    expect(container.textContent).toContain("2017");
  });

  it("renders digital reading", () => {
    const sr = fakeSensorReading();
    sr.body.mode = 0;
    sr.body.value = 1;
    const p = fakeProps(sr);
    const { container } = render(<SensorReadingsPlot {...p} />);
    expect(container.querySelector("circle")?.getAttribute("cy")).toEqual("77");
  });

  it("renders analog reading", () => {
    const sr = fakeSensorReading();
    sr.body.mode = 1;
    sr.body.value = 1023;
    const p = fakeProps(sr);
    const { container } = render(<SensorReadingsPlot {...p} />);
    expect(container.querySelector("circle")?.getAttribute("cy")).toEqual("77");
  });

  it("hovers point", () => {
    const sr = fakeSensorReading();
    const p = fakeProps(sr);
    const { container } = render(<SensorReadingsPlot {...p} />);
    fireEvent.mouseEnter(container.querySelector("circle") as Element);
    expect(p.hover).toHaveBeenCalledWith(sr.uuid);
  });

  it("unhovers point", () => {
    const p = fakeProps();
    const { container } = render(<SensorReadingsPlot {...p} />);
    fireEvent.mouseLeave(container.querySelector("circle") as Element);
    expect(p.hover).toHaveBeenCalledWith(undefined);
  });

  it("renders reading value", () => {
    const sr = fakeSensorReading();
    sr.body.value = 555;
    const p = fakeProps(sr);
    p.hovered = sr.uuid;
    const { container } = render(<SensorReadingsPlot {...p} />);
    expect(container.textContent).toContain("555");
  });
});

describe("calcTimeParams()", () => {
  it("returns correct parameters", () => {
    expect(calcTimeParams(3600 * 24))
      .toEqual({ timeScale: 40, timeStep: 3600 });
    expect(calcTimeParams(3600 * 24 * 7))
      .toEqual({ timeScale: 40 * 7, timeStep: 3600 * 24 });
    expect(calcTimeParams(3600 * 24 * 30))
      .toEqual({ timeScale: 40 * 30, timeStep: 3600 * 24 });
    expect(calcTimeParams(3600 * 24 * 365))
      .toEqual({ timeScale: 40 * 30 * 12, timeStep: 3600 * 24 * 30 });
  });
});
