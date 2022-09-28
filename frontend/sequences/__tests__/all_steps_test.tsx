import React from "react";
import { AllSteps, AllStepsProps } from "../all_steps";
import { shallow } from "enzyme";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { maybeTagStep, getStepTag } from "../../resources/sequence_tagging";
import { DropArea } from "../../draggable/drop_area";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";

describe("<AllSteps />", () => {
  const fakeProps = (): AllStepsProps => ({
    sequence: fakeSequence(),
    sequences: [],
    onDrop: jest.fn(),
    dispatch: jest.fn(),
    readOnly: false,
    resources: buildResourceIndex([]).index,
  });

  it("renders empty sequence", () => {
    const p = fakeProps();
    p.sequence.body.body = undefined;
    const wrapper = shallow(<AllSteps {...p} />);
    expect(wrapper.html()).toEqual("<div class=\"all-steps\"></div>");
  });

  it("renders steps", () => {
    const p = fakeProps();
    p.sequence.body.body = [
      { kind: "move_relative", args: { x: 0, y: 0, z: 0, speed: 100 } },
      { kind: "read_pin", args: { pin_number: 0, pin_mode: 0, label: "---" } },
      { kind: "write_pin", args: { pin_number: 0, pin_value: 0, pin_mode: 0 } },
    ];
    p.sequence.body.body.map(step => maybeTagStep(step));
    const wrapper = shallow(<AllSteps {...p} />);
    ["move-relative-step", "read-pin-step", "write-pin-step"]
      .map(stepClass => expect(wrapper.html()).toContain(stepClass));
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
    const wrapper = shallow(<AllSteps {...p} />);
    expect(wrapper.find(".read-only").length).toEqual(3);
  });

  it("calls onDrop", () => {
    const p = fakeProps();
    p.sequence.body.body = [{ kind: "wait", args: { milliseconds: 0 } }];
    p.sequence.body.body.map(step => maybeTagStep(step));
    const wrapper = shallow(<AllSteps {...p} />);
    wrapper.find<DropArea>(DropArea).props().callback?.("fake key");
    expect(p.onDrop).toHaveBeenCalledWith(0, "fake key");
  });

  it("displays hover highlight", () => {
    const p = fakeProps();
    p.visualized = true;
    p.sequence.body.body = [{ kind: "wait", args: { milliseconds: 0 } }];
    p.sequence.body.body.map(step => maybeTagStep(step));
    p.hoveredStep = getStepTag(p.sequence.body.body[0]);
    const wrapper = shallow(<AllSteps {...p} />);
    expect(wrapper.html()).toContain("hovered");
  });

  it("doesn't display hover highlight", () => {
    const p = fakeProps();
    p.visualized = false;
    p.sequence.body.body = [{ kind: "wait", args: { milliseconds: 0 } }];
    p.sequence.body.body.map(step => maybeTagStep(step));
    p.hoveredStep = getStepTag(p.sequence.body.body[0]);
    const wrapper = shallow(<AllSteps {...p} />);
    expect(wrapper.html()).not.toContain("hovered");
  });
});
