import * as React from "react";
import { shallow } from "enzyme";
import { StepSizeSelector } from "../step_size_selector";

describe("StepSizeSelector", () => {
  it("Calls selectors when clicking a button", () => {
    const selector = jest.fn();
    const el = shallow(<StepSizeSelector
      choices={[4, 5, 6]}
      selected={5}
      selector={selector}
    />);
    const buttons = el.find("button");
    expect(buttons.length).toBe(3);
    buttons.at(0).simulate("click");
    expect(selector).toHaveBeenCalledWith(4);
  });
});
