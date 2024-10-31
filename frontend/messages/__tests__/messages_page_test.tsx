import React from "react";
import { mount } from "enzyme";
import { Messages } from "../messages_page";
import { Path } from "../../internal_urls";

describe("<Messages />", () => {
  it("redirects", () => {
    const wrapper = mount(<Messages />);
    expect(wrapper.text().toLowerCase()).toContain("redirecting");
    expect(mockNavigate).toHaveBeenCalledWith(Path.messages());
  });
});
