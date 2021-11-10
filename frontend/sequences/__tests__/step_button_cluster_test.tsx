let mockPath = "";
jest.mock("../../history", () => ({
  push: jest.fn(),
  getPathArray: jest.fn(() => mockPath.split("/")),
}));

let mockShouldDisplay = false;
jest.mock("../../farmware/state_to_props", () => ({
  shouldDisplayFeature: () => mockShouldDisplay,
}));

import React from "react";
import { mount } from "enzyme";
import { StepButtonCluster, StepButtonProps } from "../step_button_cluster";
import { Actions } from "../../constants";
import { push } from "../../history";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { fakeFarmwareData } from "../../__test_support__/fake_sequence_step_data";
import { FarmwareName } from "../step_tiles/tile_execute_script";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { Path } from "../../internal_urls";

describe("<StepButtonCluster />", () => {
  const COMMANDS = ["move", "control peripheral", "read sensor",
    "control servo", "wait", "send message", "reboot", "shutdown", "e-stop",
    "find home", "set home", "find axis length", "if statement",
    "execute sequence", "detect weeds", "take photo", "assertion", "mark as"];

  const fakeProps = (): StepButtonProps => ({
    dispatch: jest.fn(),
    current: undefined,
    stepIndex: undefined,
    sequences: [],
    resources: buildResourceIndex().index,
    farmwareData: fakeFarmwareData(),
  });

  it("renders sequence commands", () => {
    const wrapper = mount(<StepButtonCluster {...fakeProps()} />);
    COMMANDS.map(command =>
      expect(wrapper.text().toLowerCase()).toContain(command));
    expect(wrapper.text().toLowerCase()).not.toContain("toggle peripheral");
    expect(wrapper.text().toLowerCase()).not.toContain("pinned");
  });

  it("renders future commands", () => {
    const p = fakeProps();
    mockShouldDisplay = true;
    p.farmwareData.farmwareNames = [FarmwareName.MeasureSoilHeight];
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

  it("navigates to sequence", () => {
    mockPath = Path.mock(Path.designerSequences("commands"));
    const p = fakeProps();
    p.current = fakeSequence();
    p.current.body.name = "sequence 1";
    const wrapper = mount(<StepButtonCluster {...p} />);
    wrapper.find(".step-button").last().simulate("click");
    expect(push).toHaveBeenCalledWith(Path.sequences("sequence_1"));
  });

  it("navigates back", () => {
    mockPath = Path.mock(Path.designerSequences("commands"));
    const p = fakeProps();
    const wrapper = mount(<StepButtonCluster {...p} />);
    wrapper.find(".step-button").last().simulate("click");
    expect(push).toHaveBeenCalledWith(Path.sequences());
  });

  it("doesn't navigate", () => {
    mockPath = Path.mock(Path.sequencePage("1"));
    const p = fakeProps();
    const wrapper = mount(<StepButtonCluster {...p} />);
    wrapper.find(".step-button").last().simulate("click");
    expect(push).not.toHaveBeenCalled();
  });

  it("shows pinned sequences", () => {
    mockPath = Path.mock(Path.sequences("1"));
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.pinned = true;
    p.sequences = [sequence];
    const wrapper = mount(<StepButtonCluster {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("pinned");
  });
});
