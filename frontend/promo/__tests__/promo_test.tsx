import React from "react";
import { shallow } from "enzyme";
import { Promo } from "../promo";

describe("<Promo />", () => {
  it("renders", () => {
    console.error = jest.fn();
    const wrapper = shallow(<Promo />);
    expect(wrapper.html()).toContain("three-d-garden");
  });
});
