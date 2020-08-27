import React from "react";
import { TileFindHome } from "../tile_find_home";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import {
  fakeHardwareFlags,
} from "../../../__test_support__/fake_sequence_step_data";
import { StepParams } from "../../interfaces";
import { emptyState } from "../../../resources/reducer";
import { FindHome } from "farmbot";

describe("<TileFindHome/>", () => {
  const fakeProps = (): StepParams<FindHome> => ({
    currentSequence: fakeSequence(),
    currentStep: { kind: "find_home", args: { speed: 100, axis: "all" } },
    dispatch: jest.fn(),
    index: 0,
    resources: emptyState().index,
    hardwareFlags: fakeHardwareFlags(),
  });

  it("renders inputs", () => {
    const wrapper = mount(<TileFindHome {...fakeProps()} />);
    const inputs = wrapper.find("input");
    const labels = wrapper.find("label");
    expect(inputs.length).toEqual(5);
    expect(labels.length).toEqual(4);
    expect(inputs.first().props().placeholder).toEqual("Find Home");
    expect(labels.at(0).text()).toContain("x");
    expect(inputs.at(1).props().checked).toBeFalsy();
    expect(labels.at(1).text()).toContain("y");
    expect(inputs.at(2).props().checked).toBeFalsy();
    expect(labels.at(2).text()).toContain("z");
    expect(inputs.at(3).props().checked).toBeFalsy();
    expect(labels.at(3).text()).toContain("all");
    expect(inputs.at(4).props().checked).toBeTruthy();
  });

  const CONFLICT_TEXT_BASE = "Hardware setting conflict";

  it("doesn't render warning", () => {
    const p = fakeProps();
    p.currentStep.args.axis = "x";
    p.hardwareFlags && (p.hardwareFlags.findHomeEnabled.x = true);
    const wrapper = mount(<TileFindHome {...p} />);
    expect(wrapper.text()).not.toContain(CONFLICT_TEXT_BASE);
  });

  it("renders warning: all axes", () => {
    const p = fakeProps();
    p.currentStep.args.axis = "all";
    p.hardwareFlags && (p.hardwareFlags.findHomeEnabled.x = false);
    const wrapper = mount(<TileFindHome {...p} />);
    expect(wrapper.text()).toContain(CONFLICT_TEXT_BASE + ": x");
  });

  it("renders warning: one axis", () => {
    const p = fakeProps();
    p.currentStep.args.axis = "x";
    p.hardwareFlags && (p.hardwareFlags.findHomeEnabled.x = false);
    const wrapper = mount(<TileFindHome {...p} />);
    expect(wrapper.text()).toContain(CONFLICT_TEXT_BASE + ": x");
  });
});
