import * as React from "react";
import { mount, shallow } from "enzyme";
import { AdditionalMenu } from "../additional_menu";

describe("AdditionalMenu", () => {
  it("renders the account menu", () => {
    const wrapper =mount<>(<AdditionalMenu
      logout={jest.fn()}
      close={jest.fn()} />);
    const text = wrapper.text();
    expect(text).toContain("Account Settings");
    expect(text).toContain("Documentation");
    expect(text).toContain("Logout");
    expect(text).toContain("VERSION");
  });

  it("closes the account menu upon nav", () => {
    const close = jest.fn();
    const wrapper = shallow(<AdditionalMenu
      logout={jest.fn()}
      close={(x) => () => close(x)} />);
    wrapper.find("Link").first().simulate("click");
    expect(close).toHaveBeenCalledWith("accountMenuOpen");
  });

  it("logs out", () => {
    const logout = jest.fn();
    const wrapper = shallow(<AdditionalMenu
      logout={logout}
      close={jest.fn()} />);
    wrapper.find("a").at(1).simulate("click");
    expect(logout).toHaveBeenCalled();
  });
});
