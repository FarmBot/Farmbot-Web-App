import * as React from "react";
import { LayerToggle, LayerToggleProps } from "../layer_toggle";
import { shallow } from "enzyme";

describe("<LayerToggle/>", () => {
  const toggle = jest.fn();
  function fakeProps(): LayerToggleProps {
    return {
      label: "toggle label",
      value: true,
      onClick: toggle
    };
  }

  it("renders", () => {
    const wrapper = shallow(<LayerToggle {...fakeProps()} />);
    expect(wrapper.text()).toEqual("toggle label");
    expect(wrapper.html()).toContain("green");
  });

  it("toggles", () => {
    const wrapper = shallow(<LayerToggle {...fakeProps()} />);
    wrapper.find("button").simulate("click");
    expect(toggle).toHaveBeenCalled();
  });
});
