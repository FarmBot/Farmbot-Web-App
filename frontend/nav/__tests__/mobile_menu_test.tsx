import React from "react";
import { shallow } from "enzyme";
import { MobileMenu } from "../mobile_menu";
import { MobileMenuProps } from "../interfaces";
import { fakeHelpState } from "../../__test_support__/fake_designer_state";

describe("<MobileMenu />", () => {
  const fakeProps = (): MobileMenuProps => ({
    close: jest.fn(),
    mobileMenuOpen: true,
    alertCount: 1,
    helpState: fakeHelpState(),
  });

  it("renders", () => {
    const wrapper = shallow(<MobileMenu {...fakeProps()} />);
    expect(wrapper.find(".mobile-menu").hasClass("active")).toBeTruthy();
  });
});
