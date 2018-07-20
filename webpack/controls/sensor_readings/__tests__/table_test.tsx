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
    ["sensor", "value", "mode", "position", "time", "(pin 1)", "10, 20, 30"]
      .map(string => expect(txt).toContain(string));
  });
});
