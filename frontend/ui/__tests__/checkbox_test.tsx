import React from "react";
import { render } from "@testing-library/react";
import { Checkbox, CheckboxProps } from "../checkbox";

describe("<Checkbox />", () => {
  const fakeProps = (): CheckboxProps => ({
    onChange: jest.fn(),
    title: "title text",
    checked: false,
  });

  it("renders", () => {
    const { container } = render(<Checkbox {...fakeProps()} />);
    expect(container.innerHTML).toContain("title text");
  });

  it("renders: partial", () => {
    const p = fakeProps();
    p.partial = true;
    const { container } = render(<Checkbox {...p} />);
    expect(container.innerHTML).toContain("partial");
  });

  it("renders: disabled", () => {
    const p = fakeProps();
    p.disabled = true;
    const { container } = render(<Checkbox {...p} />);
    expect(container.innerHTML).toContain("incompatible");
  });
});
