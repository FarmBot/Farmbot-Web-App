import { WidgetFooter } from "../widget_footer";
import { render } from "@testing-library/react";

describe("<WidgetFooter />", () => {
  it("renders text", () => {
    const { container } = render(WidgetFooter({ children: "nice" }));
    expect(container.innerHTML).toContain("nice");
  });
});
