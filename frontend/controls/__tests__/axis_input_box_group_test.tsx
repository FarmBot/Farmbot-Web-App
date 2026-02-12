import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { AxisInputBoxGroup } from "../axis_input_box_group";
import { BotPosition } from "../../devices/interfaces";
import { AxisInputBoxGroupProps } from "../interfaces";
import { changeBlurableInputRTL } from "../../__test_support__/helpers";

describe("<AxisInputBoxGroup />", () => {
  const fakeProps = (): AxisInputBoxGroupProps => ({
    position: { x: undefined, y: undefined, z: undefined },
    onCommit: jest.fn(),
    disabled: false,
    locked: false,
    dispatch: jest.fn(),
  });

  it("has 3 inputs and a button", () => {
    const { container } = render(<AxisInputBoxGroup {...fakeProps()} />);
    expect(container.querySelectorAll("input").length).toEqual(3);
    expect(container.querySelectorAll("button").length).toEqual(1);
  });

  it("button is disabled", () => {
    const p = fakeProps();
    p.disabled = true;
    render(<AxisInputBoxGroup {...p} />);
    fireEvent.click(screen.getByRole("button", { name: "GO" }));
    expect(p.onCommit).not.toHaveBeenCalled();
  });

  it("changes", () => {
    const p = fakeProps();
    const { container } = render(<AxisInputBoxGroup {...p} />);
    const inputs = container.querySelectorAll("input");
    changeBlurableInputRTL(inputs[0] as HTMLInputElement, "10");
    fireEvent.click(screen.getByRole("button", { name: "GO" }));
    expect(p.onCommit).toHaveBeenCalledWith({ x: 10, y: 0, z: 0 });
  });

  function testGo(
    testCase: string,
    coordinates: Record<"position" | "inputs" | "expected", BotPosition>) {
    it(`Go: ${testCase}`, () => {
      const p = fakeProps();
      p.disabled = false;
      p.position = coordinates.position;
      const { container } = render(<AxisInputBoxGroup {...p} />);
      const inputs = container.querySelectorAll("input");
      if (typeof coordinates.inputs.x == "number") {
        changeBlurableInputRTL(inputs[0] as HTMLInputElement,
          `${coordinates.inputs.x}`);
      }
      if (typeof coordinates.inputs.y == "number") {
        changeBlurableInputRTL(inputs[1] as HTMLInputElement,
          `${coordinates.inputs.y}`);
      }
      if (typeof coordinates.inputs.z == "number") {
        changeBlurableInputRTL(inputs[2] as HTMLInputElement,
          `${coordinates.inputs.z}`);
      }
      fireEvent.click(screen.getByRole("button", { name: "GO" }));
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
