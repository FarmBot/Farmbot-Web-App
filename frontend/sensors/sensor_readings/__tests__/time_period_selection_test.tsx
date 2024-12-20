import React from "react";
import { mount, shallow } from "enzyme";
import {
  TimePeriodSelection, getEndDate, DateDisplay,
} from "../time_period_selection";
import { fakeSensorReading } from "../../../__test_support__/fake_state/resources";
import { TimePeriodSelectionProps, DateDisplayProps } from "../interfaces";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";

describe("<TimePeriodSelection />", () => {
  function fakeProps(): TimePeriodSelectionProps {
    return {
      timePeriod: 3600 * 24,
      endDate: 1515715140,
      showPreviousPeriod: false,
      setEndDate: jest.fn(),
      setPeriod: jest.fn(),
      togglePrevious: jest.fn(),
    };
  }

  it("renders", () => {
    const wrapper = mount(<TimePeriodSelection {...fakeProps()} />);
    const txt = wrapper.text().toLowerCase();
    ["time period", "day", "period end date", "show previous"]
      .map(string => expect(txt).toContain(string));
  });

  it("changes time period", () => {
    const p = fakeProps();
    const wrapper = shallow(<TimePeriodSelection {...p} />);
    wrapper.find("FBSelect").simulate("change", { label: "", value: 100 });
    expect(p.setPeriod).toHaveBeenCalledWith(100);
  });

  it("changes end date", () => {
    const p = fakeProps();
    const wrapper = shallow(<TimePeriodSelection {...p} />);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: "2002-01-10" } });
    expect(p.setEndDate).toHaveBeenCalledWith(expect.any(Number));
  });

  it("updates end date", () => {
    const p = fakeProps();
    const wrapper = shallow(<TimePeriodSelection {...p} />);
    wrapper.find("i").simulate("click");
    expect(p.setEndDate).toHaveBeenCalled();
  });
});

describe("getEndDate()", () => {
  it("returns recent reading date", () => {
    expect(getEndDate([fakeSensorReading()])).toEqual(expect.any(Number));
  });

  it("returns current date", () => {
    expect(getEndDate([])).toEqual(expect.any(Number));
  });
});

describe("<DateDisplay />", () => {
  function fakeProps(): DateDisplayProps {
    return {
      timePeriod: 3600 * 24 * 7,
      endDate: 1515715140,
      showPreviousPeriod: true,
      timeSettings: fakeTimeSettings(),
    };
  }

  it("renders", () => {
    const wrapper = mount(<DateDisplay {...fakeProps()} />);
    const txt = wrapper.text().toLowerCase();
    ["date", "january 4–january 11 (december 28–january 4)"]
      .map(string => expect(txt).toContain(string));
  });
});
