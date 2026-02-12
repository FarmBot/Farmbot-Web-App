jest.mock("../../../api/crud", () => ({
  destroy: jest.fn(),
}));

import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { SensorReadingsTable } from "../table";
import { SensorReadingsTableProps } from "../interfaces";
import {
  fakeSensorReading, fakeSensor,
} from "../../../__test_support__/fake_state/resources";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { destroy } from "../../../api/crud";

afterAll(() => {
  jest.unmock("../../../api/crud");
});
describe("<SensorReadingsTable />", () => {
  const fakeProps = (sr = fakeSensorReading()): SensorReadingsTableProps => ({
    readingsForPeriod: () => [sr],
    sensors: [fakeSensor()],
    timeSettings: fakeTimeSettings(),
    hover: jest.fn(),
    hovered: undefined,
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const { container } = render(<SensorReadingsTable {...fakeProps()} />);
    const txt = container.textContent?.toLowerCase() || "";
    ["sensor", "value", "mode", "(x, y, z)", "time",
      "(pin 1)", "10, 20, 30", "digital"]
      .map(string => expect(txt).toContain(string));
  });

  it("handles missing pin", () => {
    const p = fakeProps();
    p.sensors[0].body.pin = undefined;
    const sr = fakeSensorReading();
    sr.body.pin = 0;
    p.readingsForPeriod = () => [sr];
    const { container } = render(<SensorReadingsTable {...p} />);
    const txt = container.textContent?.toLowerCase() || "";
    ["sensor", "value", "mode", "(x, y, z)", "time",
      "(pin 0)", "10, 20, 30", "digital"]
      .map(string => expect(txt).toContain(string));
  });

  it("renders analog mode", () => {
    const p = fakeProps();
    const sr = fakeSensorReading();
    sr.body.mode = 1;
    p.readingsForPeriod = () => [sr];
    const { container } = render(<SensorReadingsTable {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("analog");
  });

  it("hovers row", () => {
    const sr = fakeSensorReading();
    const p = fakeProps(sr);
    const { container } = render(<SensorReadingsTable {...p} />);
    const rows = container.querySelectorAll("tr");
    const row = rows.item(rows.length - 1);
    fireEvent.mouseEnter(row);
    expect(p.hover).toHaveBeenCalledWith(sr.uuid);
  });

  it("unhovers row", () => {
    const p = fakeProps();
    const { container } = render(<SensorReadingsTable {...p} />);
    const rows = container.querySelectorAll("tr");
    const row = rows.item(rows.length - 1);
    fireEvent.mouseLeave(row);
    expect(p.hover).toHaveBeenCalledWith(undefined);
  });

  it("selects row", () => {
    const sr = fakeSensorReading();
    const p = fakeProps(sr);
    p.hovered = sr.uuid;
    const { container } = render(<SensorReadingsTable {...p} />);
    const rows = container.querySelectorAll("tr");
    const row = rows.item(rows.length - 1);
    expect(row.classList.contains("selected")).toEqual(true);
  });

  it("deletes reading", () => {
    const sr = fakeSensorReading();
    const p = fakeProps(sr);
    p.hovered = sr.uuid;
    const { container } = render(<SensorReadingsTable {...p} />);
    const rows = container.querySelectorAll("tr");
    const row = rows.item(rows.length - 1);
    expect(row.classList.contains("selected")).toEqual(true);
    fireEvent.click(container.querySelector(".fa-trash") as Element);
    expect(destroy).toHaveBeenCalledWith(sr.uuid);
  });
});
