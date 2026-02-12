import React from "react";
import { Header, HeaderProps } from "../header";
import { fireEvent, render, screen } from "@testing-library/react";
import { DeviceSetting, Actions } from "../../../constants";

describe("<Header />", () => {
  const fakeProps = (): HeaderProps => ({
    dispatch: jest.fn(),
    panel: "motors",
    title: DeviceSetting.motors,
    expanded: true,
  });

  it("renders", () => {
    const { container } = render(<Header {...fakeProps()} />);
    expect((container.textContent || "").toLowerCase()).toContain("motors");
    expect(container.querySelectorAll(".fa-minus").length).toBe(1);
  });

  it("handles click", () => {
    const p = fakeProps();
    render(<Header {...p} />);
    fireEvent.click(screen.getByText(/motors/i));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_SETTINGS_PANEL_OPTION,
      payload: "motors",
    });
  });
});
