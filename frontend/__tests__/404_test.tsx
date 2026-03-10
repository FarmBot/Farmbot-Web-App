import React from "react";
import { render, screen } from "@testing-library/react";
import { FourOhFour } from "../404";

describe("<FourOhFour />", () => {
  it("renders helpful text", () => {
    render(<FourOhFour />);
    expect(screen.getByText("Not Found")).toBeInTheDocument();
  });
});
