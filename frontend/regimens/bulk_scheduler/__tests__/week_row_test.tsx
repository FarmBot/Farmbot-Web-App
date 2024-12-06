import React from "react";
import { render, mount } from "enzyme";
import { WeekRow } from "../week_row";
import { WeekRowProps } from "../interfaces";
import { betterMerge } from "../../../util";
import { newWeek } from "../../reducer";
import { Actions } from "../../../constants";

describe("<WeekRow/>", () => {
  const fakeProps = (p?: Partial<WeekRowProps>): WeekRowProps =>
    betterMerge({
      dispatch: jest.fn(),
      index: 0,
      week: newWeek()
    }, p || {});

  it("renders week 1 day numbers", () => {
    const wrapper = render(<WeekRow {...fakeProps()} />);
    expect(wrapper.text()).toEqual("Week 11234567");
  });

  it("renders week 2 day numbers", () => {
    const wrapper = render(<WeekRow {...fakeProps({ index: 1 })} />);
    expect(wrapper.text()).toEqual("Week 2891011121314");
  });

  it("selects day", () => {
    const p = fakeProps();
    const wrapper = mount(<WeekRow {...p} />);
    wrapper.find("input").first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_DAY,
      payload: { week: 0, day: 1 },
    });
  });
});
