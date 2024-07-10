import React from "react";
import { mount } from "enzyme";
import { Promo } from "../promo";

describe("<Promo />", () => {
  it("renders", () => {
    console.error = jest.fn();
    const wrapper = mount(<Promo />);
    expect(wrapper.html()).toContain("three-d-garden");
  });
});
