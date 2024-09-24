import React from "react";
import { mount } from "enzyme";
import { Sky, SkyProps } from "../sky";

describe("<Sky />", () => {
  const fakeProps = (): SkyProps => ({
  });

  it("renders", () => {
    const wrapper = mount(<Sky {...fakeProps()} />);
    expect(wrapper.html()).toContain("primitive");
  });
});
