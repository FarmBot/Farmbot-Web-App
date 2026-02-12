import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { AddButtonProps } from "../interfaces";
import { AddButton } from "../add_button";

describe("<AddButton />", () => {
  it("renders an add button when active", () => {
    const props: AddButtonProps = { active: true, onClick: jest.fn() };
    const { container } = render(<AddButton {...props} />);
    const button = container.querySelector("button");
    ["green", "bulk-scheduler-add"].map(klass => {
      expect(button?.classList.contains(klass)).toBeTruthy();
    });
    expect(container.querySelector("i")?.classList.contains("fa-plus")).toBeTruthy();
    fireEvent.click(button as Element);
    expect(props.onClick).toHaveBeenCalled();
  });

  it("renders a <div> when inactive", () => {
    const props: AddButtonProps = { active: false, onClick: jest.fn() };
    const { container } = render(<AddButton {...props} />);
    expect(container.innerHTML).toEqual("<div class=\"no-add-button\"></div>");
  });
});
