import * as React from "react";
import { mount } from "enzyme";
import { SensorReadingsTable } from "../table";
import { SensorReadingsTableProps } from "../interfaces";
import {
  fakeSensorReading, fakeSensor
} from "../../../__test_support__/fake_state/resources";

describe("<SensorReadingsTable />", () => {
  function fakeProps(): SensorReadingsTableProps {
    return {
      readingsForPeriod: () => [fakeSensorReading()],
      sensors: [fakeSensor()],
      timeOffset: 0,
    };
  }

  it("renders", () => {
    const wrapper = mount(<SensorReadingsTable {...fakeProps()} />);
    const txt = wrapper.text().toLowerCase();
    ["sensor", "value", "mode", "position", "time",
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
});
