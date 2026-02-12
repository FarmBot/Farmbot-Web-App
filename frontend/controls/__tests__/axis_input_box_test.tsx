import React from "react";
import { Xyz } from "farmbot";

const getAxisInputBox = async () =>
  (await import(`../axis_input_box.tsx?m=${Math.random()}`)).AxisInputBox;

describe("<AxisInputBox/>", () => {
  async function inputBoxWithValue(value: number | undefined) {
    const axis: Xyz = "x";
    const props = { axis, value, onChange: jest.fn() };
    const AxisInputBox = await getAxisInputBox();
    return AxisInputBox(props);
  }

  it("renders 0 if 0", async () => {
    // HISTORIC CONTEXT: We hit a bug where entering "0" resulting in -1.
    const input = await inputBoxWithValue(0);
    expect(input.props.value).toEqual(0);
  });

  it("renders '' if undefined", async () => {
    const input = await inputBoxWithValue(undefined);
    expect(input.props.value).toEqual("");
  });

  it("tests inputs", async () => {
    async function testInput(input: string, expected: number | undefined) {
      const onChange = jest.fn();
      const AxisInputBox = await getAxisInputBox();
      const el = AxisInputBox({ axis: "x", value: undefined, onChange });
      const event = { currentTarget: { value: input } } as
        React.FocusEvent<HTMLInputElement>;
      if (typeof el.props.onCommit == "function") {
        el.props.onCommit(event);
      } else if (typeof el.props.onChange == "function") {
        el.props.onChange(event);
      } else {
        throw new Error("Expected commit or change handler");
      }
      expect(onChange).toHaveBeenCalled();
      expect(onChange.mock.calls[0]?.[0]).toEqual("x");
      if (expected === undefined) {
        const value = onChange.mock.calls[0]?.[1];
        expect(value === undefined || Number.isNaN(value)).toBeTruthy();
      } else {
        expect(onChange.mock.calls[0]?.[1]).toEqual(expected);
      }
    }
    await testInput("", undefined);
    await testInput("1", 1);
    await testInput("1.1", 1.1);
    await testInput("e", undefined);
  });
});
