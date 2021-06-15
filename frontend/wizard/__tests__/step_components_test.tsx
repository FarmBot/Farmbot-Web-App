import React from "react";
import { mount } from "enzyme";
import { Video } from "../step_components";

describe("<Video />", () => {
  it("renders video", () => {
    const wrapper = mount(<Video url={"url"} />);
    expect(wrapper.html()).toContain("url");
  });
});
