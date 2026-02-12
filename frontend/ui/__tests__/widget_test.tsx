import { Widget } from "../widget";
import { render } from "@testing-library/react";

describe("<Widget />", () => {
  const params = { children: "wow", className: "k" };

  it("renders correct children", () => {
    const { container } = render(Widget(params));
    expect(container.innerHTML).toContain("wow");
  });

  it("renders correct classnames", () => {
    const { container } = render(Widget(params));
    const element = container.querySelector(".k") as HTMLDivElement;
    expect(element.classList.contains("k")).toBeTruthy();
    expect(element.classList.contains("widget-wrapper")).toBeTruthy();
  });
});
