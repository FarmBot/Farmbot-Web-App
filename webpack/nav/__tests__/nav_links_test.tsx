import * as React from "react";
import { shallow } from "enzyme";
import { NavLinks } from "../nav_links";

describe("NavLinks", () => {
  it("toggles the mobile nav menu", () => {
    const close = jest.fn();
    const wrapper = shallow(<NavLinks close={(x) => () => close(x)} />);
    wrapper.find("Link").first().simulate("click");
    expect(close).toHaveBeenCalledWith("mobileMenuOpen");
  });
});
