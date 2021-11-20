import React from "react";
import { mount } from "enzyme";
import { Messages } from "../messages_page";
import { push } from "../../history";
import { Path } from "../../internal_urls";

describe("<Messages />", () => {
  it("redirects", () => {
    const wrapper = mount(<Messages />);
    expect(wrapper.text().toLowerCase()).toContain("redirecting");
    expect(push).toHaveBeenCalledWith(Path.messages());
  });
});
