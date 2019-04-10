import * as React from "react";
import { mount } from "enzyme";
import { SensorReadingsTable } from "../table";
import { SensorReadingsTableProps } from "../interfaces";
import {
  fakeSensorReading, fakeSensor
} from "../../../__test_support__/fake_state/resources";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";

describe("<SensorReadingsTable />", () => {
  function fakeProps(sr = fakeSensorReading()): SensorReadingsTableProps {
    return {
      readingsForPeriod: () => [sr],
      sensors: [fakeSensor()],
      timeSettings: fakeTimeSettings(),
      hover: jest.fn(),
      hovered: undefined,
    };
  }

  it("renders", () => {
    const wrapper = mount(<SensorReadingsTable {...fakeProps()} />);
    const txt = wrapper.text().toLowerCase();
    ["sensor", "value", "mode", "(x, y, z)", "time",
      "(pin 1)", "10, 20, 30", "digital"]
      .map(string => expect(txt).toContain(string));
  });

  it("renders analog mode", () => {
    const p = fakeProps();
    const sr = fakeSensorReading();
    sr.body.mode = 1;
    p.readingsForPeriod = () => [sr];
    const wrapper = mount(<SensorReadingsTable {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("analog");
  });

  it("hovers row", () => {
    const sr = fakeSensorReading();
    const p = fakeProps(sr);
    const wrapper = mount(<SensorReadingsTable {...p} />);
    wrapper.find("tr").last().simulate("mouseEnter");
    expect(p.hover).toHaveBeenCalledWith(sr.uuid);
  });

  it("unhovers row", () => {
    const p = fakeProps();
    const wrapper = mount(<SensorReadingsTable {...p} />);
    wrapper.find("tr").last().simulate("mouseLeave");
    expect(p.hover).toHaveBeenCalledWith(undefined);
  });

  it("selects row", () => {
    const sr = fakeSensorReading();
    const p = fakeProps(sr);
    p.hovered = sr.uuid;
    const wrapper = mount(<SensorReadingsTable {...p} />);
    expect(wrapper.find("tr").last().hasClass("selected")).toEqual(true);
  });
});
