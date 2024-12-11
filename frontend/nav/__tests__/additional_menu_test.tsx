jest.mock("../../config_storage/actions", () => ({
  setWebAppConfigValue: jest.fn()
}));

import React from "react";
import { mount, shallow } from "enzyme";
import { AdditionalMenu } from "../additional_menu";
import { AccountMenuProps } from "../interfaces";
import { fireEvent, render, screen } from "@testing-library/react";
import { setWebAppConfigValue } from "../../config_storage/actions";
import { BooleanSetting } from "../../session_keys";

describe("AdditionalMenu", () => {
  const fakeProps = (): AccountMenuProps => ({
    isStaff: false,
    close: jest.fn(),
    dispatch: jest.fn(),
    darkMode: false,
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

  it("toggles dark mode", () => {
    render(<AdditionalMenu {...fakeProps()} />);
    const toggle = screen.getByText("🌣");
    fireEvent.click(toggle);
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      BooleanSetting.dark_mode, true);
  });
});
