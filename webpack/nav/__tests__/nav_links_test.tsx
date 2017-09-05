import * as React from "react";
import { shallow } from "enzyme";
import { NavLinks } from "../nav_links";

describe("NavLinks", () => {
  it("toggles the mobile nav menu", () => {
    const toggle = jest.fn();
    const wrapper = shallow(<NavLinks toggle={(x) => () => toggle(x)} />);
    wrapper.find("Link").first().simulate("click");
    expect(toggle).toHaveBeenCalledWith("mobileMenuOpen");
  });
});
