import * as React from "react";
import { mount } from "enzyme";
import { WeekGrid } from "../week_grid";
import { WeekGridProps } from "../interfaces";
import { Actions } from "../../../constants";

describe("<WeekGrid />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const weeks = [{
    days:
    {
      day1: true,
      day2: false,
      day3: false,
      day4: false,
      day5: false,
      day6: false,
      day7: false
    }
  }];

  it("renders", () => {
    const props: WeekGridProps = { weeks, dispatch: jest.fn() };
    const wrapper = mount<{}>(<WeekGrid {...props} />);
    const buttons = wrapper.find("button");
    expect(buttons.length).toEqual(4);
    ["Days", "Week 1", "1234567"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  function checkAction(position: number, text: string, type: Actions) {
    const props: WeekGridProps = { weeks, dispatch: jest.fn() };
    const wrapper = mount<{}>(<WeekGrid {...props} />);
    const button = wrapper.find("button").at(position);
    expect(button.text().toLowerCase()).toContain(text.toLowerCase());
    button.simulate("click");
    expect(props.dispatch).toHaveBeenCalledWith({ type, payload: undefined });
  }

  it("adds week", () => {
    checkAction(0, "Week", Actions.PUSH_WEEK);
  });

  it("removes week", () => {
    checkAction(1, "Week", Actions.POP_WEEK);
  });

  it("selects all days", () => {
    checkAction(2, "Deselect All", Actions.DESELECT_ALL_DAYS);
  });

  it("deselects all days", () => {
    checkAction(3, "Select All", Actions.SELECT_ALL_DAYS);
  });
});
