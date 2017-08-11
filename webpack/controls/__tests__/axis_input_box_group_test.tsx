import * as React from "react";
import { mount } from "enzyme";
import { AxisInputBoxGroup } from "../axis_input_box_group";

describe("<AxisInputBoxGroup />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  let props = {
    position: { x: undefined, y: undefined, z: undefined },
    onCommit: jest.fn(),
    disabled: false
  };

  it("has 3 inputs and a button", () => {
    let wrapper = mount(<AxisInputBoxGroup {...props} />);
    expect(wrapper.find("input").length).toEqual(3);
    let buttons = wrapper.find("button");
    expect(buttons.length).toEqual(1);
    expect(buttons.text().toLowerCase()).toEqual("go");
    buttons.simulate("click");
    expect(props.onCommit).toHaveBeenCalledWith({ "x": 0, "y": 0, "z": 0 });

  });

  it("button is disabled", () => {
    props.disabled = true;
    let wrapper = mount(<AxisInputBoxGroup {...props} />);
    wrapper.find("button").simulate("click");
    expect(props.onCommit).not.toHaveBeenCalled();
  });

});
