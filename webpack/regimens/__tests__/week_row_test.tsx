import * as React from "react";
import { render } from "enzyme";
import { WeekRow } from "../bulk_scheduler/week_row";
import { WeekRowProps } from "../bulk_scheduler/interfaces";
import { betterMerge } from "../../util";

function weekProps(p?: Partial<WeekRowProps>): WeekRowProps {
  return betterMerge({
    dispatch: jest.fn(),
    index: 0,
    week: {
      "days": {
        "day1": false,
        "day2": false,
        "day3": false,
        "day4": false,
        "day5": false,
        "day6": false,
        "day7": false
      }
    }
  }, p || {});
}

describe("<WeekRow/>", () => {
  it("renders week 1 day numbers", () => {
    const wrapper = render(<WeekRow {...weekProps() } />);
    const txt = wrapper.text();
    expect(txt).toEqual("Week 11234567");
  });
});

describe("<WeekRow/>", () => {
  it("renders week 2 day numbers", () => {
    const wrapper = render(<WeekRow {...weekProps({ index: 1 }) } />);
    const txt = wrapper.text();
    expect(txt).toEqual("Week 2891011121314");
  });
});
