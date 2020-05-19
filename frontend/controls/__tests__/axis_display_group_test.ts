import { mount } from "enzyme";
import { AxisDisplayGroup } from "../axis_display_group";
import { AxisDisplayGroupProps } from "../interfaces";

describe("<AxisDisplayGroup />", () => {
  const fakeProps = (): AxisDisplayGroupProps => ({
    position: { x: undefined, y: undefined, z: undefined },
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
    p.missedSteps = { x: 1, y: 2, z: 3 };
    const wrapper = mount(AxisDisplayGroup(p));
    expect(wrapper.find(".missed-step-indicator").length).toEqual(3);
  });

  it("doesn't render missed step indicator", () => {
    const p = fakeProps();
    p.missedSteps = undefined;
    const wrapper = mount(AxisDisplayGroup(p));
    expect(wrapper.find(".missed-step-indicator").length).toEqual(0);
  });
});
