import * as React from "react";
import { shallow, mount } from "enzyme";
import { NavLinks } from "../nav_links";

describe("NavLinks", () => {
  it("toggles the mobile nav menu", () => {
    const close = jest.fn();
    const wrapper = shallow(<NavLinks close={(x) => () => close(x)}
      alertCount={0} />);
    wrapper.find("Link").first().simulate("click");
    expect(close).toHaveBeenCalledWith("mobileMenuOpen");
    expect(wrapper.text()).not.toContain("0");
  });

  it("shows indicator", () => {
    const wrapper = mount(<NavLinks close={jest.fn()} alertCount={1} />);
    expect(wrapper.text()).toContain("1");
  });
});
