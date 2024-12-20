const step_buttons = require("../step_buttons");
const mockStepClick = jest.fn();
step_buttons.stepClick = jest.fn(() => mockStepClick);

import React, { act } from "react";
import { mount } from "enzyme";
import { StepButtonCluster, StepButtonProps } from "../step_button_cluster";
import { Actions } from "../../constants";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { fakeFarmwareData } from "../../__test_support__/fake_sequence_step_data";
import { FarmwareName } from "../step_tiles/tile_execute_script";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { Path } from "../../internal_urls";
import { stepClick } from "../step_buttons";

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
    const wrapper = mount(<StepButtonCluster {...fakeProps()} />);
    COMMANDS.map(command =>
      expect(wrapper.text().toLowerCase()).toContain(command));
    expect(wrapper.text().toLowerCase()).toContain("toggle peripheral");
    expect(wrapper.text().toLowerCase()).not.toContain("pinned");
  });

  it("renders future commands", () => {
    const p = fakeProps();
    p.farmwareData &&
      (p.farmwareData.farmwareNames = [FarmwareName.MeasureSoilHeight]);
    const wrapper = mount(<StepButtonCluster {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("toggle peripheral");
  });

  it("has correct drag data", () => {
    const p = fakeProps();
    const wrapper = mount(<StepButtonCluster {...p} />);
    const steps = wrapper.find(".step-dragger");
    const stepButton = steps.at(steps.length - 4);
    expect(stepButton.text().toLowerCase()).toEqual("take photo");
    stepButton.simulate("dragStart", { dataTransfer: { setData: jest.fn() } });
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
    const wrapper = mount(<StepButtonCluster {...p} />);
    wrapper.find(".step-button").last().simulate("click");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows pinned sequences", () => {
    location.pathname = Path.mock(Path.sequences("1"));
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.name = "pinned";
    sequence.body.pinned = true;
    p.sequences = [sequence];
    const wrapper = mount(<StepButtonCluster {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("pinned");
  });

  it("filters out commands", () => {
    location.pathname = Path.mock(Path.designerSequences("1"));
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.name = "pinned";
    sequence.body.id = 1;
    p.sequences = [sequence];
    const wrapper = mount(<StepButtonCluster {...p} />);
    act(() => {
      wrapper.find("input").props().onChange?.({
        currentTarget: { value: "pinned" }
      } as React.ChangeEvent<HTMLInputElement>);
    });
    wrapper.update();
    expect(wrapper.text().toLowerCase()).toContain("pinned");
    jest.clearAllMocks();
    wrapper.find("input").simulate("keypress",
      { key: "Enter", currentTarget: { value: "pinned" } });
    expect(stepClick).toHaveBeenCalledWith(
      p.dispatch,
      { kind: "execute", args: { sequence_id: 1 }, body: undefined },
      p.current,
      p.stepIndex,
    );
    expect(mockStepClick).toHaveBeenCalled();
  });

  it("doesn't add command", () => {
    location.pathname = Path.mock(Path.designerSequences("1"));
    const p = fakeProps();
    p.sequences = undefined;
    p.farmwareData = undefined;
    const wrapper = mount(<StepButtonCluster {...p} />);
    act(() => {
      wrapper.find("input").props().onChange?.({
        currentTarget: { value: "none" }
      } as React.ChangeEvent<HTMLInputElement>);
    });
    wrapper.update();
    jest.clearAllMocks();
    wrapper.find("input").simulate("keypress",
      { key: "Enter", currentTarget: { value: "none" } });
    expect(stepClick).not.toHaveBeenCalled();
    expect(mockStepClick).not.toHaveBeenCalled();
  });
});
