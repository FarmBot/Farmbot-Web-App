jest.mock("../../history", () => ({ push: jest.fn() }));

import * as React from "react";
import { mount } from "enzyme";
import { Messages } from "../messages_page";
import { push } from "../../history";

describe("<Messages />", () => {
  it("redirects", () => {
    const wrapper = mount(<Messages />);
    expect(wrapper.text().toLowerCase()).toContain("redirecting");
    expect(push).toHaveBeenCalledWith("/app/designer/messages");
  });
});
