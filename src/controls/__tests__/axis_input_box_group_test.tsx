import * as React from "react";
import { mount } from "enzyme";
import { AxisInputBoxGroup } from "../axis_input_box_group";

describe("<AxisInputBoxGroup />", () => {
  let onCommit = jest.fn();
  let position = { x: undefined, y: undefined, z: undefined };
  let wrapper = mount(<AxisInputBoxGroup
    position={position}
    onCommit={onCommit} />);

  it("has 3 inputs and a button", () => {
    expect(wrapper.find("input").length).toEqual(3);
    let buttons = wrapper.find("button");
    expect(buttons.length).toEqual(1);
    expect(buttons.text().toLowerCase()).toEqual("go");
    buttons.simulate("click");
    expect(onCommit).toHaveBeenCalled();
  });
});
