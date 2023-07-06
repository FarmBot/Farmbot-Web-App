import React from "react";
import { mount } from "enzyme";
import { FourOhFour } from "../404";

describe("<FourOhFour />", () => {
  it("renders helpful text", () => {
    const dom = mount(<FourOhFour />);
    expect(dom.text()).toContain("Not Found");
  });
});
