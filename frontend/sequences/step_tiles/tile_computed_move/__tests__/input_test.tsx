import React from "react";
import { shallow, mount } from "enzyme";
import { MoveStepInputProps } from "../interfaces";
import { MoveStepInput } from "../input";

describe("<MoveStepInput />", () => {
  const fakeProps = (): MoveStepInputProps => ({
    field: "offset",
    axis: "x",
    value: undefined,
    onCommit: jest.fn(),
    setValue: jest.fn(),
  });

  it("renders number input", () => {
    const p = fakeProps();
    p.value = 1;
    const wrapper = shallow(<MoveStepInput {...p} />);
    expect(wrapper.props().type).toEqual("number");
  });

  it("renders text input", () => {
    const p = fakeProps();
    p.value = "value";
    const wrapper = shallow(<MoveStepInput {...p} />);
    expect(wrapper.props().type).toEqual("text");
  });

  it("clears value", () => {
    const p = fakeProps();
    p.value = "lua";
    const wrapper = mount(<MoveStepInput {...p} />);
    wrapper.find("input").simulate("keyUp", { key: "" });
    expect(p.setValue).toHaveBeenCalled();
  });

  it("sets lua value", () => {
    const p = fakeProps();
    p.value = undefined;
    const wrapper = mount(<MoveStepInput {...p} />);
    wrapper.find("input").simulate("keyUp", { key: "=" });
    expect(p.setValue).toHaveBeenCalledWith("");
  });

  it("shows default lua value", () => {
    const p = fakeProps();
    p.value = "";
    const wrapper = mount(<MoveStepInput {...p} />);
    expect(wrapper.find("input").props().value).toEqual("");
  });

  it("calls back", () => {
    const p = fakeProps();
    p.onClear = jest.fn();
    const wrapper = mount(<MoveStepInput {...p} />);
    wrapper.find("input").simulate("keyUp", { key: "" });
    expect(p.onClear).toHaveBeenCalled();
  });
});
