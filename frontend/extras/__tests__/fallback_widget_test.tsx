import React from "react";
import { render } from "@testing-library/react";
import { FallbackWidget, FallbackWidgetProps } from "../fallback_widget";

describe("<FallbackWidget />", () => {
  const fakeProps = (): FallbackWidgetProps => ({
    title: "FakeWidget",
  });

  it("renders widget fallback", () => {
    const { container } = render(<FallbackWidget {...fakeProps()} />);
    const widget = container.querySelector(".widget-wrapper");
    const header = widget?.querySelector(".widget-header");
    expect(header?.textContent).toContain("FakeWidget");
    const body = widget?.querySelector(".widget-body");
    expect(body?.textContent).toContain("Widget load failed.");
  });

  it("renders widget fallback with help text", () => {
    const p = fakeProps();
    p.helpText = "This is a fake widget.";
    const { container } = render(<FallbackWidget {...p} />);
    const help = container.querySelector(`[aria-label="${p.helpText}"]`)
      || container.querySelector("[data-testid='help-links']");
    expect(help).toBeTruthy();
  });
});
