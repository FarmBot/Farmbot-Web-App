import React from "react";
import { render } from "@testing-library/react";
import {
  InputLengthIndicatorProps, InputLengthIndicator,
} from "../input_length_indicator";
import { repeat } from "lodash";

describe("<InputLengthIndicator />", () => {
  const fakeProps = (): InputLengthIndicatorProps => ({
    field: "message",
    value: repeat(" ", 290),
  });

  it("shows indicator", () => {
    const { container } = render(<InputLengthIndicator {...fakeProps()} />);
    expect(container.textContent).toContain("290/300");
    expect((container.querySelector("span") as HTMLSpanElement).hidden)
      .toBeFalsy();
  });

  it("shows indicator for unknown field", () => {
    const p = fakeProps();
    p.field = "url";
    p.value = "url";
    const { container } = render(<InputLengthIndicator {...p} />);
    expect(container.textContent).toContain("5/3000");
    expect(container.querySelector("span")?.classList.contains("over"))
      .toBeFalsy();
  });

  it("shows indicator when over limit", () => {
    const p = fakeProps();
    p.value = repeat(" ", 301);
    const { container } = render(<InputLengthIndicator {...p} />);
    expect(container.textContent).toContain("301/300");
    expect(container.querySelector("span")?.classList.contains("over"))
      .toBeTruthy();
  });

  it("hides indicator", () => {
    const p = fakeProps();
    p.value = " ";
    const { container } = render(<InputLengthIndicator {...p} />);
    expect((container.querySelector("span") as HTMLSpanElement).hidden)
      .toBeTruthy();
  });
});
