const mockUpdateArg = jest.fn();

import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { InputDefault } from "../input_default";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { StepInputProps } from "../../interfaces";
import * as stepTiles from "../../step_tiles";
import { Wait } from "farmbot";
import * as ui from "../../../ui";
import { BIProps } from "../../../ui/blurable_input";
let updateStepSpy: jest.SpyInstance;
let blurableInputSpy: jest.SpyInstance;

beforeEach(() => {
  updateStepSpy = jest.spyOn(stepTiles, "updateStep")
    .mockImplementation(() => mockUpdateArg);
  blurableInputSpy = jest.spyOn(ui, "BlurableInput")
    .mockImplementation(((props: BIProps) =>
      <input value={props.value} onBlur={e => props.onCommit(e)} />) as never);
});

afterEach(() => {
  updateStepSpy.mockRestore();
  blurableInputSpy.mockRestore();
  mockUpdateArg.mockClear();
});
describe("<InputDefault />", () => {
  const fakeProps = (): StepInputProps => ({
    index: 0,
    field: "milliseconds",
    step: { kind: "wait", args: { milliseconds: 0 } },
    dispatch: jest.fn(),
    sequence: fakeSequence(),
  });

  it("renders arg value", () => {
    const p = fakeProps();
    const { container } = render(<InputDefault {...p} />);
    expect((container.querySelector("input") as HTMLInputElement).value)
      .toEqual("0");
  });

  it("doesn't render bad arg value type", () => {
    const p = fakeProps();
    (p.step as Wait).args.milliseconds = false as unknown as number;
    const { container } = render(<InputDefault {...p} />);
    expect((container.querySelector("input") as HTMLInputElement).value)
      .toEqual("");
  });

  it("updates the step", () => {
    const p = fakeProps();
    const { container } = render(<InputDefault {...p} />);
    const input = container.querySelector("input") as Element;
    const e = { currentTarget: { value: "100" } };
    fireEvent.blur(input, e);
    expect(stepTiles.updateStep).toHaveBeenCalledTimes(1);
    expect(stepTiles.updateStep).toHaveBeenCalledWith(p);
    expect(mockUpdateArg).toHaveBeenCalledTimes(1);
    const eventArg = (mockUpdateArg).mock.calls[0][0] as
      React.SyntheticEvent<HTMLInputElement>;
    expect(eventArg.type).toEqual("blur");
  });
});
