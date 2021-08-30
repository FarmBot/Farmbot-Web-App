import React from "react";
import { mount } from "enzyme";
import { TileCalibrate } from "../tile_calibrate";
import { HardwareFlags, StepParams } from "../../interfaces";
import {
  fakeHardwareFlags, fakeStepParams,
} from "../../../__test_support__/fake_sequence_step_data";
import { Calibrate } from "farmbot";

describe("<TileCalibrate/>", () => {
  const fakeProps = (): StepParams<Calibrate> => ({
    ...fakeStepParams({ kind: "calibrate", args: { axis: "all" } }),
    hardwareFlags: fakeHardwareFlags(),
  });

  it("renders inputs", () => {
    const block = mount(<TileCalibrate {...fakeProps()} />);
    const inputs = block.find("input");
    const labels = block.find("label");
    expect(inputs.length).toEqual(5);
    expect(labels.length).toEqual(4);
    expect(inputs.first().props().placeholder).toEqual("Find axis length");
    expect(labels.at(0).text()).toContain("x");
    expect(inputs.at(1).props().value).toEqual("x");
  });

  const CONFLICT_TEXT_BASE = "Hardware setting conflict";

  it("doesn't render warning", () => {
    const p = fakeProps();
    p.currentStep.args.axis = "x";
    (p.hardwareFlags as HardwareFlags).findHomeEnabled.x = true;
    const wrapper = mount(<TileCalibrate {...p} />);
    expect(wrapper.html()).not.toContain(CONFLICT_TEXT_BASE);
  });

  it("renders warning: all axes", () => {
    const p = fakeProps();
    p.currentStep.args.axis = "all";
    (p.hardwareFlags as HardwareFlags).findHomeEnabled.x = false;
    const wrapper = mount(<TileCalibrate {...p} />);
    expect(wrapper.html()).toContain(CONFLICT_TEXT_BASE + ": x");
  });

  it("renders warning: one axis", () => {
    const p = fakeProps();
    p.currentStep.args.axis = "x";
    (p.hardwareFlags as HardwareFlags).findHomeEnabled.x = false;
    const wrapper = mount(<TileCalibrate {...p} />);
    expect(wrapper.html()).toContain(CONFLICT_TEXT_BASE + ": x");
  });
});
