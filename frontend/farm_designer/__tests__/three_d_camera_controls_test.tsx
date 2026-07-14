import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThreeDCameraControls } from "../three_d_camera_controls";
import { fakeDesignerState } from
  "../../__test_support__/fake_designer_state";
import { Actions } from "../../constants";

describe("<ThreeDCameraControls />", () => {
  it("toggles perspective", () => {
    const dispatch = jest.fn();
    const designer = fakeDesignerState();
    render(<ThreeDCameraControls
      designer={designer}
      dispatch={dispatch} />);
    const button = screen.getByRole("button", { name: "PERSPECTIVE" });
    expect(button).toHaveClass("active");
    expect(button).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(button);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_PERSPECTIVE,
      payload: false,
    });
  });

  it("shows the inactive perspective state", () => {
    const designer = fakeDesignerState();
    designer.threeDPerspective = false;
    render(<ThreeDCameraControls
      designer={designer}
      dispatch={jest.fn()} />);
    const button = screen.getByRole("button", { name: "PERSPECTIVE" });
    expect(button).not.toHaveClass("active");
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("defaults to perspective on when transient state is unset", () => {
    const designer = fakeDesignerState();
    designer.threeDPerspective = undefined;
    const dispatch = jest.fn();
    render(<ThreeDCameraControls
      designer={designer}
      dispatch={dispatch} />);
    const button = screen.getByRole("button", { name: "PERSPECTIVE" });
    expect(button).toHaveClass("active");
    fireEvent.click(button);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_PERSPECTIVE,
      payload: false,
    });
  });
});
