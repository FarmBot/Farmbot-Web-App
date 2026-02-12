import React from "react";
import { render } from "@testing-library/react";
import { StepInputBox } from "../step_input_box";
import { StepInputProps } from "../../interfaces";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";

jest.mock("../input_default", () => ({
  InputDefault: () => <div className={"input-default"} />,
}));

jest.mock("../input_unknown", () => ({
  InputUnknown: () => <div className={"input-unknown"} />,
}));

describe("<StepInputBox />", () => {
  const fakeProps = (): StepInputProps => ({
    index: 0,
    field: "x",
    step: { kind: "sync", args: {} },
    dispatch: jest.fn(),
    sequence: fakeSequence(),
  });

  it("renders input for known field", () => {
    const p = fakeProps();
    const { container } = render(<StepInputBox {...p} />);
    expect(container.querySelectorAll(".input-default").length).toEqual(1);
    expect(container.querySelectorAll(".input-unknown").length).toEqual(0);
  });

  it("renders input for unknown field", () => {
    const p = fakeProps();
    p.field = "axis";
    const { container } = render(<StepInputBox {...p} />);
    expect(container.querySelectorAll(".input-default").length).toEqual(0);
    expect(container.querySelectorAll(".input-unknown").length).toEqual(1);
  });
});
