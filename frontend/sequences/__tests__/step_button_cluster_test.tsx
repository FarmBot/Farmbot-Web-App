import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { StepButtonCluster, StepButtonProps } from "../step_button_cluster";
import { Actions } from "../../constants";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { fakeFarmwareData } from "../../__test_support__/fake_sequence_step_data";
import { FarmwareName } from "../step_tiles/tile_execute_script";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { Path } from "../../internal_urls";
import { error } from "../../toast/toast";

describe("<StepButtonCluster />", () => {
  const COMMANDS = ["move", "control peripheral", "read sensor",
    "control servo", "wait", "send message", "reboot", "shutdown", "e-stop",
    "find home", "set home", "find axis length", "if statement",
    "detect weeds", "take photo", "assertion", "mark as"];

  const fakeProps = (): StepButtonProps => ({
    dispatch: jest.fn(),
    current: undefined,
    stepIndex: undefined,
    sequences: [],
    resources: buildResourceIndex().index,
    farmwareData: fakeFarmwareData(),
    close: jest.fn(),
  });

  it("renders sequence commands", () => {
    const { container } = render(<StepButtonCluster {...fakeProps()} />);
    const txt = container.textContent?.toLowerCase() || "";
    COMMANDS.map(command =>
      expect(txt).toContain(command));
    expect(txt).toContain("toggle peripheral");
    expect(txt).not.toContain("pinned");
  });

  it("renders future commands", () => {
    const p = fakeProps();
    p.farmwareData &&
      (p.farmwareData.farmwareNames = [FarmwareName.MeasureSoilHeight]);
    const { container } = render(<StepButtonCluster {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("toggle peripheral");
  });

  it("has correct drag data", () => {
    const p = fakeProps();
    const { container } = render(<StepButtonCluster {...p} />);
    const steps = container.querySelectorAll(".step-dragger");
    const stepButton = steps.item(steps.length - 4);
    expect(stepButton?.textContent?.toLowerCase()).toEqual("take photo");
    fireEvent.dragStart(stepButton as Element, {
      dataTransfer: { setData: jest.fn() },
    });
    expect(p.dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: Actions.PUT_DATA_XFER,
      payload: expect.objectContaining({
        value: expect.objectContaining({
          kind: "take_photo"
        })
      })
    }));
  });

  it("doesn't navigate", () => {
    location.pathname = Path.mock(Path.sequencePage("1"));
    const p = fakeProps();
    const { container } = render(<StepButtonCluster {...p} />);
    const stepButtons = container.querySelectorAll(".step-button");
    fireEvent.click(stepButtons.item(stepButtons.length - 1));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows pinned sequences", () => {
    location.pathname = Path.mock(Path.sequences("1"));
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.name = "pinned";
    sequence.body.pinned = true;
    p.sequences = [sequence];
    const { container } = render(<StepButtonCluster {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("pinned");
  });

  it("filters out commands", () => {
    location.pathname = Path.mock(Path.designerSequences("1"));
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.name = "pinned";
    sequence.body.id = 1;
    p.sequences = [sequence];
    const { container } = render(<StepButtonCluster {...p} />);
    const input = container.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "pinned" } });
    expect(container.textContent?.toLowerCase()).toContain("pinned");
    jest.clearAllMocks();
    fireEvent.click(container.querySelector(".step-button button") as Element);
    expect(p.close).toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Select a sequence first");
  });

  it("doesn't add command", () => {
    location.pathname = Path.mock(Path.designerSequences("1"));
    const p = fakeProps();
    p.sequences = undefined;
    p.farmwareData = undefined;
    const { container } = render(<StepButtonCluster {...p} />);
    const input = container.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "none" } });
    jest.clearAllMocks();
    fireEvent.keyPress(input, {
      key: "Enter",
      code: "Enter",
      charCode: 13,
      target: { value: "none" },
      currentTarget: { value: "none" },
    });
    expect(p.close).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
});
