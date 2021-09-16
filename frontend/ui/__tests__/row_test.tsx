import React from "react";
import { shallow } from "enzyme";
import { Row } from "../row";

describe("<Row />", () => {
  it("renders", () => {
    const wrapper = shallow(<Row>text</Row>);
    expect(wrapper.text()).toContain("text");
  });
});
