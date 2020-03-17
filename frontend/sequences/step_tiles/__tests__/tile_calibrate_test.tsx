import * as React from "react";
import { TileCalibrate, CalibrateParams } from "../tile_calibrate";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { emptyState } from "../../../resources/reducer";
import { HardwareFlags } from "../../interfaces";
import {
  fakeHardwareFlags,
} from "../../../__test_support__/fake_sequence_step_data";

describe("<TileCalibrate/>", () => {
  const fakeProps = (): CalibrateParams => ({
    currentSequence: fakeSequence(),
    currentStep: { kind: "calibrate", args: { axis: "all" } },
    dispatch: jest.fn(),
    index: 0,
    resources: emptyState().index,
    confirmStepDeletion: false,
    hardwareFlags: fakeHardwareFlags(),
  });

  it("errors with incorrect kind", () => {
    console.error = jest.fn();
    const p = fakeProps();
    // tslint:disable-next-line:no-any
    p.currentStep.kind = "wrong" as any;
    expect(() => mount(<TileCalibrate {...p} />))
      .toThrowError("TileCalibrate expects calibrate");
  });

  it("renders inputs", () => {
    const block = mount(<TileCalibrate {...fakeProps()} />);
    const inputs = block.find("input");
    const labels = block.find("label");
    expect(inputs.length).toEqual(5);
    expect(labels.length).toEqual(4);
    expect(inputs.first().props().placeholder).toEqual("Calibrate");
    expect(labels.at(0).text()).toContain("Calibrate x");
    expect(inputs.at(1).props().value).toEqual("x");
  });

  const CONFLICT_TEXT_BASE = "Hardware setting conflict";

  it("doesn't render warning", () => {
    const p = fakeProps();
    p.currentStep.args.axis = "x";
    (p.hardwareFlags as HardwareFlags).findHomeEnabled.x = true;
    const wrapper = mount(<TileCalibrate {...p} />);
    expect(wrapper.text()).not.toContain(CONFLICT_TEXT_BASE);
  });

  it("renders warning: all axes", () => {
    const p = fakeProps();
    p.currentStep.args.axis = "all";
    (p.hardwareFlags as HardwareFlags).findHomeEnabled.x = false;
    const wrapper = mount(<TileCalibrate {...p} />);
    expect(wrapper.text()).toContain(CONFLICT_TEXT_BASE + ": x");
  });

  it("renders warning: one axis", () => {
    const p = fakeProps();
    p.currentStep.args.axis = "x";
    (p.hardwareFlags as HardwareFlags).findHomeEnabled.x = false;
    const wrapper = mount(<TileCalibrate {...p} />);
    expect(wrapper.text()).toContain(CONFLICT_TEXT_BASE + ": x");
  });
});
