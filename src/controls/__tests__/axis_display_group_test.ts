import * as React from "react";
import { mount } from "enzyme";
import { AxisDisplayGroup } from "../axis_display_group";
import { bot } from "../../__test_support__/fake_state/bot";

describe("<AxisDisplayGroup />", () => {
  let params = { bot, label: "Heyoo" };
  let wrapper = mount(AxisDisplayGroup(params));

  it("has 3 inputs and a label", () => {
    expect(wrapper.find("input").length).toEqual(3);
    expect(wrapper.find("label").length).toEqual(1);
  });

  it("renders correct values", () => {
    let inputs = wrapper.find("input");
    let label = wrapper.find("label");
    expect(inputs.at(0).props().value).toBe("");
    expect(inputs.at(1).props().value).toBe("");
    expect(inputs.at(2).props().value).toBe("");
    expect(label.text()).toBe("Heyoo");
  });
});
