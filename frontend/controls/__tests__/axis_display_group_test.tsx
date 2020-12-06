let mockDev = false;
jest.mock("../../settings/dev/dev_support", () => ({
  DevSettings: { futureFeaturesEnabled: () => mockDev }
}));

import { mount } from "enzyme";
import { AxisDisplayGroup } from "../axis_display_group";
import { AxisDisplayGroupProps } from "../interfaces";
import { MissedStepIndicator } from "../move/missed_step_indicator";

describe("<AxisDisplayGroup />", () => {
  const fakeProps = (): AxisDisplayGroupProps => ({
    position: { x: undefined, y: undefined, z: undefined },
    firmwareSettings: {
      encoder_enabled_x: 1,
      encoder_enabled_y: 1,
      encoder_enabled_z: 1,
    },
    label: "Heyoo",
  });

  it("has 3 inputs and a label", () => {
    const wrapper = mount(AxisDisplayGroup(fakeProps()));
    expect(wrapper.find("input").length).toEqual(3);
    expect(wrapper.find("label").length).toEqual(1);
  });

  it("renders '' for falsy values", () => {
    const wrapper = mount(AxisDisplayGroup(fakeProps()));
    const inputs = wrapper.find("input");
    const label = wrapper.find("label");
    expect(inputs.at(0).props().value).toBe("---");
    expect(inputs.at(1).props().value).toBe("---");
    expect(inputs.at(2).props().value).toBe("---");
    expect(label.text()).toBe("Heyoo");
  });

  it("renders real values for ... real values", () => {
    const p = fakeProps();
    p.position = { x: 1, y: 2, z: 3 };
    const wrapper = mount(AxisDisplayGroup(p));
    const inputs = wrapper.find("input");
    const label = wrapper.find("label");

    expect(inputs.at(0).props().value).toBe(1);
    expect(inputs.at(1).props().value).toBe(2);
    expect(inputs.at(2).props().value).toBe(3);
    expect(label.text()).toBe("Heyoo");
  });

  it("renders missed step indicator", () => {
    const p = fakeProps();
    p.missedSteps = { x: 0, y: 2, z: 3 };
    const wrapper = mount(AxisDisplayGroup(p));
    expect(wrapper.find(".missed-step-indicator").length).toEqual(3);
  });

  it("doesn't render missed step indicator when undefined", () => {
    const p = fakeProps();
    p.missedSteps = undefined;
    const wrapper = mount(AxisDisplayGroup(p));
    expect(wrapper.find(".missed-step-indicator").length).toEqual(0);
  });

  it("doesn't render missed step indicator when invalid", () => {
    const p = fakeProps();
    p.missedSteps = { x: -1, y: -1, z: -1 };
    const wrapper = mount(AxisDisplayGroup(p));
    expect(wrapper.find(".missed-step-indicator").length).toEqual(0);
  });

  it("doesn't render missed step indicator when detection not enabled", () => {
    const p = fakeProps();
    p.firmwareSettings = undefined;
    p.missedSteps = { x: 1, y: 2, z: 3 };
    const wrapper = mount(AxisDisplayGroup(p));
    expect(wrapper.find(".missed-step-indicator").length).toEqual(0);
  });

  it("renders missed step indicator when idle", () => {
    const p = fakeProps();
    p.missedSteps = { x: 1, y: 2, z: 3 };
    p.axisStates = { x: "idle", y: undefined, z: "stop" };
    const wrapper = mount(AxisDisplayGroup(p));
    const indicators = wrapper.find(MissedStepIndicator);
    expect(indicators.length).toEqual(3);
    expect(indicators.first().props().missedSteps).toEqual(0);
    expect(indicators.at(1).props().missedSteps).toEqual(2);
    expect(indicators.last().props().missedSteps).toEqual(3);
  });

  it("renders axis state", () => {
    mockDev = true;
    const p = fakeProps();
    p.busy = true;
    p.axisStates = { x: "idle", y: "idle", z: "idle" };
    const wrapper = mount(AxisDisplayGroup(p));
    expect(wrapper.text()).toContain("idle");
  });

  it("doesn't render axis state", () => {
    mockDev = false;
    const p = fakeProps();
    p.axisStates = { x: undefined, y: undefined, z: undefined };
    const wrapper = mount(AxisDisplayGroup(p));
    expect(wrapper.text()).not.toContain("idle");
  });
});
