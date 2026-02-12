import { Page } from "../page";
import { render } from "@testing-library/react";

describe("<Page />", () => {
  it("renders text", () => {
    const { container } = render(Page({ children: "nice" }));
    expect(container.innerHTML).toContain("nice");
  });
  it("gets correct className", () => {
    const { container } = render(Page({ className: "some-class" }));
    const div = container.querySelector("div") as HTMLDivElement;
    expect(div.classList.contains("some-class")).toBeTruthy();
    expect(div.classList.contains("all-content-wrapper")).toBeTruthy();
  });
});
