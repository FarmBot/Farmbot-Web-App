import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Link } from "../link";

describe("<Link/>", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders child elements", () => {
    function Child(_: unknown) { return <p>Hey!</p>; }
    render(<Link to="/wherever"><Child /></Link>);
    expect(screen.getByText("Hey!")).toBeInTheDocument();
  });

  it("navigates", () => {
    const { container } = render(<Link to="/tools" />);
    const anchor = container.querySelector("a");
    expect(anchor).toBeTruthy();
    anchor && fireEvent.click(anchor);
    expect(mockNavigate).toHaveBeenCalledWith("/tools");
  });

  it("doesn't navigate when disabled", () => {
    const { container } = render(<Link to="/tools" disabled={true} />);
    const anchor = container.querySelector("a");
    expect(anchor).toBeTruthy();
    anchor && fireEvent.click(anchor);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
