import * as React from "react";
import { mount } from "enzyme";
import { MoveAbsoluteWarningProps } from "../../interfaces";
import {
  fakeHardwareFlags,
} from "../../../__test_support__/fake_sequence_step_data";
import { MoveAbsoluteWarning } from "../tile_move_absolute_conflict_check";

describe("<MoveAbsoluteWarning/>", () => {
  const fakeProps = (): MoveAbsoluteWarningProps => ({
    vector: undefined,
    offset: { x: 4.4, y: 5, z: 6 },
    hardwareFlags: fakeHardwareFlags(),
  });

  const CONFLICT_TEXT_BASE = "Hardware setting conflict";

  it("doesn't show setting warning", () => {
    const p = fakeProps();
    const wrapper = mount(<MoveAbsoluteWarning {...p} />);
    expect(wrapper.text()).not.toContain(CONFLICT_TEXT_BASE);
  });

  it("doesn't show warning: axis length 0", () => {
    const p = fakeProps();
    p.offset.x = 10000;
    if (p.hardwareFlags) {
      p.hardwareFlags.stopAtMax.x = true;
      p.hardwareFlags.axisLength.x = 0;
    }
    const wrapper = mount(<MoveAbsoluteWarning {...p} />);
    expect(wrapper.text()).not.toContain(CONFLICT_TEXT_BASE);
  });

  it("shows warning: too high", () => {
    const p = fakeProps();
    p.offset.x = 10000;
    if (p.hardwareFlags) {
      p.hardwareFlags.stopAtMax.x = true;
      p.hardwareFlags.axisLength.x = 100;
    }
    const wrapper = mount(<MoveAbsoluteWarning {...p} />);
    expect(wrapper.text()).toContain(CONFLICT_TEXT_BASE + ": x");
  });

  it("shows warning: too high (negativeOnly)", () => {
    const p = fakeProps();
    p.offset.x = -10000;
    if (p.hardwareFlags) {
      p.hardwareFlags.stopAtMax.x = true;
      p.hardwareFlags.negativeOnly.x = true;
      p.hardwareFlags.axisLength.x = 100;
    }
    const wrapper = mount(<MoveAbsoluteWarning {...p} />);
    expect(wrapper.text()).toContain(CONFLICT_TEXT_BASE + ": x");
  });

  it("shows warning: too low (negativeOnly)", () => {
    const p = fakeProps();
    p.offset.x = 10000;
    if (p.hardwareFlags) {
      p.hardwareFlags.stopAtHome.x = true;
      p.hardwareFlags.negativeOnly.x = true;
    }
    const wrapper = mount(<MoveAbsoluteWarning {...p} />);
    expect(wrapper.text()).toContain(CONFLICT_TEXT_BASE + ": x");
  });

  it("shows warning: too low", () => {
    const p = fakeProps();
    p.offset.x = -10000;
    if (p.hardwareFlags) {
      p.hardwareFlags.stopAtHome.x = true;
      p.hardwareFlags.stopAtMax.x = true;
    }
    const wrapper = mount(<MoveAbsoluteWarning {...p} />);
    expect(wrapper.text()).toContain(CONFLICT_TEXT_BASE + ": x");
  });
});
