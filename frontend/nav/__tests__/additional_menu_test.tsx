import React from "react";
import { mount, shallow } from "enzyme";
import { AdditionalMenu } from "../additional_menu";
import { AccountMenuProps } from "../interfaces";

describe("AdditionalMenu", () => {
  const fakeProps = (): AccountMenuProps => ({
    isStaff: false,
    close: jest.fn(),
  });

  it("renders the account menu", () => {
    const wrapper = mount(<AdditionalMenu {...fakeProps()} />);
    const text = wrapper.text();
    expect(text).toContain("Account Settings");
    expect(text).toContain("Logout");
    expect(text).toContain("VERSION");
    expect(text).not.toContain("destroy token");
  });

  it("renders the account menu as staff", () => {
    const p = fakeProps();
    p.isStaff = true;
    const wrapper = mount(<AdditionalMenu {...p} />);
    const text = wrapper.text();
    expect(text).toContain("Account Settings");
    expect(text).toContain("destroy token");
  });

  it("closes the account menu upon nav", () => {
    const close = jest.fn();
    const p = fakeProps();
    p.close = x => () => close(x);
    const wrapper = shallow(<AdditionalMenu {...p} />);
    wrapper.find("Link").first().simulate("click");
    expect(close).toHaveBeenCalledWith("accountMenuOpen");
  });

  it("navigates to help page", () => {
    const wrapper = shallow(<AdditionalMenu {...fakeProps()} />);
    wrapper.find("Link").at(2).simulate("click");
  });
});
