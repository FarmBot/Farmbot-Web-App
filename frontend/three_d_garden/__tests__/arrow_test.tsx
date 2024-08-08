import React from "react";
import { mount } from "enzyme";
import { Arrow, ArrowProps } from "../arrow";

describe("<Arrow />", () => {
  const fakeProps = (): ArrowProps => ({
    length: 10,
    width: 5,
  });

  it("renders", () => {
    const wrapper = mount(<Arrow {...fakeProps()} />);
    expect(wrapper.html()).toContain("extrude");
  });
});
