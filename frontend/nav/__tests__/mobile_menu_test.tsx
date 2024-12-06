import React from "react";
import { render, screen } from "@testing-library/react";
import { MobileMenu } from "../mobile_menu";
import { MobileMenuProps } from "../interfaces";
import {
  fakeDesignerState, fakeHelpState,
} from "../../__test_support__/fake_designer_state";

describe("<MobileMenu />", () => {
  const fakeProps = (): MobileMenuProps => ({
    close: jest.fn(),
    mobileMenuOpen: true,
    alertCount: 1,
    helpState: fakeHelpState(),
    designer: fakeDesignerState(),
    dispatch: jest.fn(),
  });

  it("renders", () => {
    render(<MobileMenu {...fakeProps()} />);
    const mobileMenu = screen.getByRole("navigation", { name: "Mobile Panel Menu" });
    expect(mobileMenu).toHaveClass("mobile-menu active");
  });
});
