import React from "react";
import { AllSteps, AllStepsProps } from "../all_steps";
import { render, fireEvent } from "@testing-library/react";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { maybeTagStep, getStepTag } from "../../resources/sequence_tagging";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { emptyState } from "../../resources/reducer";

jest.mock("../../draggable/drop_area", () => ({
  DropArea: (props: { callback?: (key: string) => void }) =>
    <button className="drop-area-mock"
      onClick={() => props.callback?.("fake key")} />,
}));

jest.mock("../../draggable/step_dragger", () => ({
  StepDragger: (props: { children: React.ReactNode }) =>
    <div className="step-dragger-mock">{props.children}</div>,
}));

jest.mock("../sequence_editor_middle_active", () => ({
  AddCommandButton: () => <div className="add-command-button-mock" />,
}));

jest.mock("../step_tiles/index", () => ({
  renderCeleryNode: (props: { currentStep: { kind: string } }) =>
    <div className={`${props.currentStep.kind.replace(/_/g, "-")}-step`} />,
}));

describe("<AllSteps />", () => {
  const fakeProps = (): AllStepsProps => ({
    sequence: fakeSequence(),
    sequences: [],
    onDrop: jest.fn(),
    dispatch: jest.fn(),
    readOnly: false,
    resources: buildResourceIndex([]).index,
    sequencesState: emptyState().consumers.sequences,
  });

  it("renders empty sequence", () => {
    const p = fakeProps();
    p.sequence.body.body = undefined;
    const { container } = render(<AllSteps {...p} />);
    expect(container.querySelector(".grid")?.innerHTML).toEqual("");
  });

  it("renders steps", () => {
    const p = fakeProps();
    p.sequence.body.body = [
      { kind: "move_relative", args: { x: 0, y: 0, z: 0, speed: 100 } },
      { kind: "read_pin", args: { pin_number: 0, pin_mode: 0, label: "---" } },
      { kind: "write_pin", args: { pin_number: 0, pin_value: 0, pin_mode: 0 } },
    ];
    p.sequence.body.body.map(step => maybeTagStep(step));
    const { container } = render(<AllSteps {...p} />);
    const html = container.innerHTML;
    ["move-relative-step", "read-pin-step", "write-pin-step"]
      .map(stepClass => expect(html).toContain(stepClass));
  });

  it("renders read-only steps", () => {
    const p = fakeProps();
    p.readOnly = true;
    p.sequence.body.body = [
      { kind: "move_relative", args: { x: 0, y: 0, z: 0, speed: 100 } },
      { kind: "read_pin", args: { pin_number: 0, pin_mode: 0, label: "---" } },
      { kind: "write_pin", args: { pin_number: 0, pin_value: 0, pin_mode: 0 } },
    ];
    p.sequence.body.body.map(step => maybeTagStep(step));
    const { container } = render(<AllSteps {...p} />);
    expect(container.querySelectorAll(".read-only").length).toEqual(3);
  });

  it("calls onDrop", () => {
    const p = fakeProps();
    p.sequence.body.body = [{ kind: "wait", args: { milliseconds: 0 } }];
    p.sequence.body.body.map(step => maybeTagStep(step));
    const { container } = render(<AllSteps {...p} />);
    fireEvent.click(container.querySelector(".drop-area-mock") as Element);
    expect(p.onDrop).toHaveBeenCalledWith(0, "fake key");
  });

  it("displays hover highlight", () => {
    const p = fakeProps();
    p.visualized = "uuid";
    p.sequence.body.body = [{ kind: "wait", args: { milliseconds: 0 } }];
    p.sequence.body.body.map(step => maybeTagStep(step));
    p.hoveredStep = getStepTag(p.sequence.body.body[0]);
    const { container } = render(<AllSteps {...p} />);
    expect(container.innerHTML).toContain("hovered");
  });

  it("doesn't display hover highlight", () => {
    const p = fakeProps();
    p.visualized = undefined;
    p.sequence.body.body = [{ kind: "wait", args: { milliseconds: 0 } }];
    p.sequence.body.body.map(step => maybeTagStep(step));
    p.hoveredStep = getStepTag(p.sequence.body.body[0]);
    const { container } = render(<AllSteps {...p} />);
    expect(container.innerHTML).not.toContain("hovered");
  });
});
