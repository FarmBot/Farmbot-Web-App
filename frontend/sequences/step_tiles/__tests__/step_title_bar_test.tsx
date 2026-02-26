import React from "react";
import { StepTitleBar } from "../step_title_bar";
import { render, fireEvent } from "@testing-library/react";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { Wait } from "farmbot";
import { StepTitleBarProps } from "../../interfaces";
import { FarmwareName } from "../tile_execute_script";

describe("<StepTitleBar/>", () => {
  const fakeProps = (): StepTitleBarProps => ({
    step: { kind: "wait", args: { milliseconds: 100 } } as Wait,
    index: 0,
    dispatch: jest.fn(),
    readOnly: false,
    sequence: fakeSequence(),
    pinnedSequenceName: undefined,
    toggleDraggable: jest.fn(),
  });

  const inputProps = (props: StepTitleBarProps) => {
    const rendered = new StepTitleBar(props).render() as React.ReactElement<{
      children: React.ReactElement<{
        value: string;
        placeholder: string;
      }>;
    }>;
    return rendered.props.children.props;
  };

  it("title has placeholder, no value", () => {
    const p = fakeProps();
    const titleProps = inputProps(p);
    expect(titleProps.value).toEqual("");
    const placeholder = (titleProps.placeholder || "").toLowerCase();
    expect(placeholder === "wait" || placeholder === "").toBeTruthy();
    const { container } = render(<StepTitleBar {...p} />);
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toEqual(1);
    const title = inputs[0];
    expect(title.value).toEqual("");
    fireEvent.blur(title);
    expect(p.dispatch).toHaveBeenCalled();
  });

  it("title uses placeholder", () => {
    const p = fakeProps();
    p.step = {
      kind: "execute_script",
      args: { label: FarmwareName.MeasureSoilHeight },
    };
    const titleProps = inputProps(p);
    expect(titleProps.value).toEqual("");
    const placeholder = (titleProps.placeholder || "").toLowerCase();
    expect(placeholder == "measure soil height" || placeholder == "").toBeTruthy();
  });

  it("title has value", () => {
    const p = fakeProps();
    p.step.comment = "new title";
    const { container } = render(<StepTitleBar {...p} />);
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toEqual(1);
    const title = inputs[0];
    expect(title.value).toEqual("new title");
  });

  it("calls enter action", () => {
    const p = fakeProps();
    const { container } = render(<StepTitleBar {...p} />);
    fireEvent.mouseEnter(container.firstChild as HTMLElement);
    expect(p.toggleDraggable).toHaveBeenCalledWith("enter");
  });

  it("calls leave action", () => {
    const p = fakeProps();
    const { container } = render(<StepTitleBar {...p} />);
    fireEvent.mouseLeave(container.firstChild as HTMLElement);
    expect(p.toggleDraggable).toHaveBeenCalledWith("leave");
  });
});
