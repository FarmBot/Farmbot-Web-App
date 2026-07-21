import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThreeDCameraControls } from "../three_d_camera_controls";
import { fakeDesignerState } from
  "../../__test_support__/fake_designer_state";
import {
  Actions, CAMERA_FOLLOW_PERSPECTIVE_REQUIRED,
} from "../../constants";
import * as toast from "../../toast/toast";

describe("<ThreeDCameraControls />", () => {
  it("toggles perspective", () => {
    const dispatch = jest.fn();
    const designer = fakeDesignerState();
    render(<ThreeDCameraControls
      designer={designer}
      dispatch={dispatch} />);
    const button = screen.getByRole("button", { name: "PERSPECTIVE ON" });
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
    const button = screen.getByRole("button", { name: "PERSPECTIVE OFF" });
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
    const button = screen.getByRole("button", { name: "PERSPECTIVE ON" });
    expect(button).toHaveClass("active");
    fireEvent.click(button);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_PERSPECTIVE,
      payload: false,
    });
  });

  it("toggles following the FarmBot camera", () => {
    const info = jest.spyOn(toast, "info").mockImplementation(jest.fn());
    const designer = fakeDesignerState();
    const dispatch = jest.fn();
    const { container, rerender } = render(<ThreeDCameraControls
      designer={designer}
      dispatch={dispatch} />);
    const follow = screen.getByRole("button", {
      name: "FOLLOW CAMERA VIEW",
    });
    expect(follow).toHaveAttribute("aria-pressed", "false");
    expect(container.querySelector(".three-d-camera-follow-control img"))
      .toBeTruthy();
    fireEvent.click(follow);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_CAMERA_FOLLOW,
      payload: true,
    });

    designer.threeDCameraFollow = true;
    rerender(<ThreeDCameraControls
      designer={designer}
      dispatch={dispatch} />);
    const stop = screen.getByRole("button", {
      name: "STOP FOLLOWING CAMERA VIEW",
    });
    expect(stop).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".three-d-camera-follow-control .fa-times"))
      .toBeTruthy();
    const dispatchCount = dispatch.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "PERSPECTIVE ON" }));
    expect(info).toHaveBeenCalledWith(CAMERA_FOLLOW_PERSPECTIVE_REQUIRED);
    expect(dispatch).toHaveBeenCalledTimes(dispatchCount);
    fireEvent.click(stop);
    expect(dispatch).toHaveBeenLastCalledWith({
      type: Actions.SET_3D_CAMERA_FOLLOW,
      payload: false,
    });
    info.mockRestore();
  });
});
