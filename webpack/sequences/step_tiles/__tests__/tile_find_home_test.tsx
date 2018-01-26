import * as React from "react";
import { TileFindHome } from "../tile_find_home";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { FindHome } from "farmbot/dist";
import { emptyState } from "../../../resources/reducer";
import {
  fakeHardwareFlags
} from "../../../__test_support__/sequence_hardware_settings";

describe("<TileFindHome/>", () => {
  const fakeProps = () => {
    const currentStep: FindHome = {
      kind: "find_home",
      args: {
        speed: 100,
        axis: "all"
      }
    };
    return {
      currentSequence: fakeSequence(),
      currentStep: currentStep,
      dispatch: jest.fn(),
      index: 0,
      resources: emptyState().index,
      hardwareFlags: fakeHardwareFlags()
    };
  };

  it("renders inputs", () => {
    const wrapper = mount(<TileFindHome {...fakeProps() } />);
    const inputs = wrapper.find("input");
    const labels = wrapper.find("label");
    expect(inputs.length).toEqual(5);
    expect(labels.length).toEqual(4);
    expect(inputs.first().props().placeholder).toEqual("Find Home");
    expect(labels.at(0).text()).toContain("Find x");
    expect(inputs.at(1).props().checked).toBeFalsy();
    expect(labels.at(1).text()).toContain("Find y");
    expect(inputs.at(2).props().checked).toBeFalsy();
    expect(labels.at(2).text()).toContain("Find z");
    expect(inputs.at(3).props().checked).toBeFalsy();
    expect(labels.at(3).text()).toContain("Find all");
    expect(inputs.at(4).props().checked).toBeTruthy();
  });

  const CONFLICT_TEXT_BASE = "Hardware setting conflict";

  it("doesn't render warning", () => {
    const p = fakeProps();
    p.currentStep.args.axis = "x";
    p.hardwareFlags.findHomeEnabled.x = true;
    const wrapper = mount(<TileFindHome {...p} />);
    expect(wrapper.text()).not.toContain(CONFLICT_TEXT_BASE);
  });

  it("renders warning: all axes", () => {
    const p = fakeProps();
    p.currentStep.args.axis = "all";
    p.hardwareFlags.findHomeEnabled.x = false;
    const wrapper = mount(<TileFindHome {...p} />);
    expect(wrapper.text()).toContain(CONFLICT_TEXT_BASE + ": x");
  });

  it("renders warning: one axis", () => {
    const p = fakeProps();
    p.currentStep.args.axis = "x";
    p.hardwareFlags.findHomeEnabled.x = false;
    const wrapper = mount(<TileFindHome {...p} />);
    expect(wrapper.text()).toContain(CONFLICT_TEXT_BASE + ": x");
  });
});
