import { render } from "@testing-library/react";
import React from "react";
import { Popover, PopoverProps } from "../popover";

describe("<Popover />", () => {
  const fakeProps = (): PopoverProps => ({
    target: <p>target</p>,
    content: <p>content</p>
  });

  it("renders popover", () => {
    const { container } = render(<Popover {...fakeProps()} />);
    expect(container.textContent).toContain("target");
  });
});
