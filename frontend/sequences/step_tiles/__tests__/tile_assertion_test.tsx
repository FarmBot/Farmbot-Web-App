import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { TileAssertion } from "../tile_assertion";
import { fakeAssertProps } from "../tile_assertion/test_fixtures";

describe("<TileAssertion />", () => {
  it("renders with sequence part", () => {
    const p = fakeAssertProps();
    p.currentStep.args.assertion_type = "recover";
    const { container } = render(<TileAssertion {...p} />);
    expect(container.querySelectorAll(".lua-input").length).toEqual(1);
    expect(container.querySelectorAll(".assertion-type").length).toEqual(1);
    expect(container.querySelectorAll(".assertion-sequence").length).toEqual(1);
  });

  it("renders without sequence part", () => {
    const p = fakeAssertProps();
    p.currentStep.args.assertion_type = "abort";
    const { container } = render(<TileAssertion {...p} />);
    expect(container.querySelectorAll(".lua-input").length).toEqual(1);
    expect(container.querySelectorAll(".assertion-type").length).toEqual(1);
    expect(container.querySelectorAll(".assertion-sequence").length).toEqual(0);
  });

  it("changes editor", async () => {
    const { container } = render(<TileAssertion {...fakeAssertProps()} />);
    const toggleIcon = container.querySelector(".fa-font");
    expect(toggleIcon).toBeTruthy();
    fireEvent.click(toggleIcon as Element);
    await waitFor(() =>
      expect(container.querySelector(".fallback-lua-editor")).toBeTruthy());
  });

  it("toggles expanded view", async () => {
    const { container } = render(<TileAssertion {...fakeAssertProps()} />);
    expect(container.querySelectorAll(".lua-editor.expanded").length).toEqual(0);
    const expandIcon = container.querySelector(".fa-expand");
    fireEvent.click(expandIcon as Element);
    await waitFor(() =>
      expect(container.querySelectorAll(".lua-editor.expanded").length)
        .toEqual(1));
  });
});
