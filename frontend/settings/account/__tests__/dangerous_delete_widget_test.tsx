interface MockRef {
  current: { value: string } | undefined;
}
let mockRef: MockRef = { current: { value: "" } };
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useRef: () => mockRef,
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DangerousDeleteWidget } from "../dangerous_delete_widget";
import { DangerousDeleteProps } from "../interfaces";

describe("<DangerousDeleteWidget />", () => {
  const fakeProps = (): DangerousDeleteProps => ({
    title: "Delete something important",
    warning: "This will remove data.",
    confirmation: "Type to confirm.",
    dispatch: jest.fn(),
    onClick: jest.fn(),
  });

  it("renders", () => {
    const p = fakeProps();
    render(<DangerousDeleteWidget {...p} />);
    [p.title, p.warning, p.confirmation].map(string =>
      expect(screen.getAllByText(RegExp(string, "i"))[0]).toBeInTheDocument());
  });

  it("executes deletion", () => {
    const p = fakeProps();
    render(<DangerousDeleteWidget {...p} />);
    const input = screen.getByLabelText("Enter Password");
    fireEvent.blur(input, { target: { value: "password" } });
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(p.onClick).toHaveBeenCalledTimes(1);
    expect(p.onClick).toHaveBeenCalledWith({ password: "password" });
    expect(p.dispatch).toHaveBeenCalled();
  });

  it("handles missing ref", () => {
    mockRef = { current: undefined };
    const p = fakeProps();
    render(<DangerousDeleteWidget {...p} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(p.onClick).toHaveBeenCalledWith({ password: "" });
  });
});
