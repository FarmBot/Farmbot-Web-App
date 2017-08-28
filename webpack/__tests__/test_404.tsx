import * as React from "react";
import { mount } from "enzyme";
import { FourOhFour } from "../404";

describe("<FourOhFour/>", function () {
  it("renders helpful text", function () {
    const dom = mount(<FourOhFour />);
    expect(dom.html()).toContain("Page Not Found");
  });
});
