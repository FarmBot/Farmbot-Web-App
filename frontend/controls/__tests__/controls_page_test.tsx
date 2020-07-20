jest.mock("../../history", () => ({ push: jest.fn() }));

import * as React from "react";
import { mount } from "enzyme";
import { Controls } from "../controls_page";
import { push } from "../../history";

describe("<Controls />", () => {
  it("redirects", () => {
    const wrapper = mount(<Controls />);
    expect(wrapper.text().toLowerCase()).toContain("redirecting");
    expect(push).toHaveBeenCalledWith("/app/designer/controls");
  });
});
