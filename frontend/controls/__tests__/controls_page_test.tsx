import React from "react";
import { mount } from "enzyme";
import { Controls } from "../controls_page";
import { push } from "../../history";
import { Path } from "../../internal_urls";

describe("<Controls />", () => {
  it("redirects", () => {
    const wrapper = mount(<Controls />);
    expect(wrapper.text().toLowerCase()).toContain("redirecting");
    expect(push).toHaveBeenCalledWith(Path.controls());
  });
});
