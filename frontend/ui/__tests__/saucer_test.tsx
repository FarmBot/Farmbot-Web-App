import { Saucer } from "../saucer";
import { render } from "@testing-library/react";

describe("<Saucer />", () => {
  const params = { color: "blue", active: true };
  it("renders with correct classes", () => {
    const { container } = render(Saucer(params));
    const div = container.querySelector("div") as HTMLDivElement;
    expect(div.classList.contains("blue")).toBeTruthy();
    expect(div.classList.contains("active")).toBeTruthy();
  });
});
