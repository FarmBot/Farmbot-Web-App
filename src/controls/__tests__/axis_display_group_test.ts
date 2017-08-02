import { mount } from "enzyme";
import { AxisDisplayGroup } from "../axis_display_group";
import { bot } from "../../__test_support__/fake_state/bot";
import { defensiveClone } from "../../util";

describe("<AxisDisplayGroup />", () => {
  let params = { bot, label: "Heyoo" };
  let wrapper = mount(AxisDisplayGroup(params));

  it("has 3 inputs and a label", () => {
    expect(wrapper.find("input").length).toEqual(3);
    expect(wrapper.find("label").length).toEqual(1);
  });

  it("renders '' for falsy values", () => {
    let inputs = wrapper.find("input");
    let label = wrapper.find("label");
    expect(inputs.at(0).props().value).toBe("");
    expect(inputs.at(1).props().value).toBe("");
    expect(inputs.at(2).props().value).toBe("");
    expect(label.text()).toBe("Heyoo");
  });

  it("renders real values for ... real values", () => {
    let props = { bot: defensiveClone(bot), label: "Heyoo" };
    props.bot.hardware.location_data.position = {
      x: 1,
      y: 2,
      z: 3
    };
    let el = mount(AxisDisplayGroup(props));
    let inputs = el.find("input");
    let label = el.find("label");

    expect(inputs.at(0).props().value).toBe(1);
    expect(inputs.at(1).props().value).toBe(2);
    expect(inputs.at(2).props().value).toBe(3);
    expect(label.text()).toBe("Heyoo");
  });
});
