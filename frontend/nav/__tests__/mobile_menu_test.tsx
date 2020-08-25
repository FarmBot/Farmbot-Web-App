import React from "react";
import { shallow } from "enzyme";
import { MobileMenu } from "../mobile_menu";
import { MobileMenuProps } from "../interfaces";

describe("<MobileMenu />", () => {
  const fakeProps = (): MobileMenuProps => ({
    close: jest.fn(),
    mobileMenuOpen: true,
    alertCount: 1,
  });

  it("renders", () => {
    const wrapper = shallow(<MobileMenu {...fakeProps()} />);
    expect(wrapper.find(".mobile-menu").hasClass("active")).toBeTruthy();
  });
});
