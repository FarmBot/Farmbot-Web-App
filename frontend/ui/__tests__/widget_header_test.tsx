import React from "react";
import { render } from "@testing-library/react";
import { WidgetHeader, WidgetHeaderProps } from "../widget_header";

describe("<WidgetHeader />", () => {
  const fakeProps = (): WidgetHeaderProps => ({
    title: "fakeWidget",
  });

  it("renders title", () => {
    const { container } = render(<WidgetHeader {...fakeProps()} />);
    expect(container.innerHTML).toContain("fakeWidget");
  });

  it("renders children", () => {
    const p = fakeProps();
    p.children = "children";
    const { container } = render(<WidgetHeader {...p} />);
    expect(container.innerHTML).toContain("children");
  });

  it("renders help text", () => {
    const p = fakeProps();
    p.helpText = "fakeHelp";
    const { container } = render(<WidgetHeader {...p} />);
    expect(container.innerHTML).toContain("fakeHelp");
  });
});
