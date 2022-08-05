import React from "react";
import { mount } from "enzyme";
import { AxisInputBoxGroup } from "../axis_input_box_group";
import { BotPosition } from "../../devices/interfaces";
import { AxisInputBoxGroupProps } from "../interfaces";
import { clickButton } from "../../__test_support__/helpers";

describe("<AxisInputBoxGroup />", () => {
  const fakeProps = (): AxisInputBoxGroupProps => ({
    position: { x: undefined, y: undefined, z: undefined },
    onCommit: jest.fn(),
    disabled: false,
    locked: false,
    dispatch: jest.fn(),
  });

  it("has 3 inputs and a button", () => {
    const wrapper = mount(<AxisInputBoxGroup {...fakeProps()} />);
    expect(wrapper.find("input").length).toEqual(3);
    expect(wrapper.find("button").length).toEqual(1);
  });

  it("button is disabled", () => {
    const p = fakeProps();
    p.disabled = true;
    const wrapper = mount(<AxisInputBoxGroup {...p} />);
    wrapper.find("button").simulate("click");
    expect(p.onCommit).not.toHaveBeenCalled();
  });

  it("changes", () => {
    const wrapper = mount<AxisInputBoxGroup>(
      <AxisInputBoxGroup {...fakeProps()} />);
    wrapper.instance().change("x", 10);
    expect(wrapper.state()).toEqual({ x: 10 });
  });

  function testGo(
    testCase: string,
    coordinates: Record<"position" | "inputs" | "expected", BotPosition>) {
    it(`Go: ${testCase}`, () => {
      const p = fakeProps();
      p.disabled = false;
      p.position = coordinates.position;
      const wrapper = mount(<AxisInputBoxGroup {...p} />);
      wrapper.setState(coordinates.inputs);
      clickButton(wrapper, 0, "go");
      expect(p.onCommit).toHaveBeenCalledWith(coordinates.expected);
    });
  }
  testGo("position and inputs undefined", {
    position: { x: undefined, y: undefined, z: undefined },
    inputs: { x: undefined, y: undefined, z: undefined },
    expected: { x: 0, y: 0, z: 0 },
  });
  testGo("inputs undefined", {
    position: { x: 1, y: 2, z: 3 },
    inputs: { x: undefined, y: undefined, z: undefined },
    expected: { x: 1, y: 2, z: 3 },
  });
  testGo("position undefined", {
    position: { x: undefined, y: undefined, z: undefined },
    inputs: { x: 4, y: 5, z: 6 },
    expected: { x: 4, y: 5, z: 6 },
  });
  testGo("mix of position and inputs undefined", {
    position: { x: 7, y: undefined, z: undefined },
    inputs: { x: undefined, y: 8, z: undefined },
    expected: { x: 7, y: 8, z: 0 },
  });
});
