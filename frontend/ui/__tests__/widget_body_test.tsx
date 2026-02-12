import React from "react";
import { render } from "@testing-library/react";
import { WidgetBody } from "../widget_body";

describe("<WidgetBody />", () => {
  it("renders body", () => {
    const { container } = render(<WidgetBody>content</WidgetBody>);
    expect(container.textContent).toContain("content");
  });
});
