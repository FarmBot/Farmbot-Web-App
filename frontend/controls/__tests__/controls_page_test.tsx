import React from "react";
import { mount } from "enzyme";
import { Controls } from "../controls_page";
import { Path } from "../../internal_urls";

describe("<Controls />", () => {
  it("redirects", () => {
    const wrapper = mount(<Controls />);
    expect(wrapper.text().toLowerCase()).toContain("redirecting");
    expect(mockNavigate).toHaveBeenCalledWith(Path.controls());
  });
});
