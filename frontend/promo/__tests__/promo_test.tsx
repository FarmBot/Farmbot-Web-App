import React from "react";
import { mount } from "enzyme";
import { Promo } from "../promo";

describe("<Promo />", () => {
  it("renders", () => {
    console.error = jest.fn();
    const wrapper = mount(<Promo />);
    expect(wrapper.html()).toContain("three-d-garden");
  });

  it("opens config menu", () => {
    const wrapper = mount(<Promo />);
    expect(wrapper.html()).not.toContain("all-configs");
    wrapper.find(".gear").simulate("click");
    expect(wrapper.html()).toContain("all-configs");
  });
});
