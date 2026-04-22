import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { ProfileOptions } from "../options";
import { ProfileOptionsProps } from "../interfaces";
import { Actions } from "../../../../constants";
import {
  fakeDesignerState,
} from "../../../../__test_support__/fake_designer_state";

describe("<ProfileOptions />", () => {
  const fakeProps = (): ProfileOptionsProps => ({
    dispatch: jest.fn(),
    designer: fakeDesignerState(),
    expanded: false,
    setExpanded: jest.fn(),
  });

  it("changes axis to y", () => {
    const p = fakeProps();
    p.designer.profileAxis = "x";
    const { container } = render(<ProfileOptions {...p} />);
    fireEvent.click(container.querySelector("button") as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PROFILE_AXIS,
      payload: "y",
    });
  });

  it("changes axis to x", () => {
    const p = fakeProps();
    p.designer.profileAxis = "y";
    const { container } = render(<ProfileOptions {...p} />);
    fireEvent.click(container.querySelector("button") as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PROFILE_AXIS,
      payload: "x",
    });
  });

  it("changes width", () => {
    const p = fakeProps();
    const { container } = render(<ProfileOptions {...p} />);
    fireEvent.change(container.querySelector("input") as Element, {
      target: { value: "200" },
      currentTarget: { value: "200" },
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PROFILE_WIDTH,
      payload: 200,
    });
  });

  it("expands profile", () => {
    const p = fakeProps();
    const { container } = render(<ProfileOptions {...p} />);
    fireEvent.click(container.querySelector("i") as Element);
    expect(p.setExpanded).toHaveBeenCalledWith(true);
  });

  it("changes follow bot setting", () => {
    const p = fakeProps();
    const { container } = render(<ProfileOptions {...p} />);
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[buttons.length - 1]);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PROFILE_FOLLOW_BOT,
      payload: true,
    });
  });
});
