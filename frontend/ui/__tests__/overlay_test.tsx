import React from "react";
import { render, screen } from "@testing-library/react";
import { Overlay } from "../overlay";

describe("<Overlay />", () => {
  it("renders overlay", () => {
    render(<Overlay isOpen={true}>Overlay content</Overlay>);
    expect(screen.getByText("Overlay content")).toBeInTheDocument();
  });
});
