import React from "react";
import { render, screen } from "@testing-library/react";
import { UpdateRow } from "../update_row";
import { UpdateRowProps } from "../interfaces";

describe("<UpdateRow />", () => {
  const fakeProps = (): UpdateRowProps => ({
    version: "1.0.0",
    botOnline: true,
  });

  it("renders", () => {
    render(<UpdateRow {...fakeProps()} />);
    expect(screen.getByText(/1\.0\.0/)).toBeInTheDocument();
  });
});
