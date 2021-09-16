import React from "react";
import { shallow } from "enzyme";
import { Col } from "../column";

describe("<Col />", () => {
  it("renders", () => {
    const wrapper = shallow(<Col>text</Col>);
    expect(wrapper.text()).toContain("text");
  });
});
