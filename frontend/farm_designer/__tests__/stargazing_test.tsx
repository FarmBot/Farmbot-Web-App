import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  setStargazingFov, setStargazingMode, StargazingControls,
} from "../stargazing";
import { Actions } from "../../constants";

describe("<StargazingControls />", () => {
  it("shows controls only while stargazing", () => {
    const dispatch = jest.fn();
    const { container, rerender } = render(<StargazingControls
      active={false}
      fov={90}
      dispatch={dispatch} />);
    const button = screen.getByRole("button", { hidden: true });
    const controls = container.querySelector(".stargazing-controls");
    expect(controls).toHaveAttribute("aria-hidden", "true");
    expect(document.body).not.toHaveClass("stargazing-active");

    rerender(<StargazingControls active={true} fov={90}
      dispatch={dispatch} />);
    expect(button).toHaveAttribute("aria-label", "Exit stargazing");
    expect(button).not.toHaveTextContent("Esc");
    expect(controls?.querySelector(".stargazing-exit-key"))
      .toHaveTextContent("Esc");
    expect(document.body).toHaveClass("stargazing-active");
  });

  it("exits from the button", () => {
    const dispatch = jest.fn();
    render(<StargazingControls active={true} fov={90}
      dispatch={dispatch} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_STARGAZING_MODE,
      payload: false,
    });
  });

  it("exits from Escape", () => {
    const addEventListener = jest.spyOn(window, "addEventListener");
    const dispatch = jest.fn();
    render(<StargazingControls active={true} fov={90}
      dispatch={dispatch} />);
    const keydown = addEventListener.mock.calls
      .find(([event]) => event == "keydown")?.[1] as EventListener;

    keydown(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(dispatch).not.toHaveBeenCalled();
    keydown(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_STARGAZING_MODE,
      payload: false,
    });
  });

  it("adjusts the field of view from the arrow keys", () => {
    const dispatch = jest.fn();
    render(<StargazingControls active={true} fov={35}
      dispatch={dispatch} />);

    fireEvent.keyDown(window, { key: "ArrowUp" });
    expect(dispatch).toHaveBeenLastCalledWith(setStargazingFov(25));

    fireEvent.keyDown(window, { key: "ArrowDown" });
    expect(dispatch).toHaveBeenLastCalledWith(setStargazingFov(35));
  });

  it("clamps arrow-key field-of-view adjustments", () => {
    const dispatch = jest.fn();
    const { rerender } = render(<StargazingControls active={true} fov={25}
      dispatch={dispatch} />);

    fireEvent.keyDown(window, { key: "ArrowUp" });
    expect(dispatch).toHaveBeenLastCalledWith(setStargazingFov(20));

    rerender(<StargazingControls active={true} fov={85}
      dispatch={dispatch} />);
    fireEvent.keyDown(window, { key: "ArrowDown" });
    expect(dispatch).toHaveBeenLastCalledWith(setStargazingFov(90));
  });

  it("zooms the field of view with the mouse wheel", () => {
    const dispatch = jest.fn();
    render(<StargazingControls active={true} fov={50}
      dispatch={dispatch} />);

    fireEvent.wheel(window, { deltaY: -100 });
    expect(dispatch).toHaveBeenLastCalledWith(setStargazingFov(48));

    fireEvent.wheel(window, { deltaY: -100 });
    expect(dispatch).toHaveBeenLastCalledWith(setStargazingFov(46));

    fireEvent.wheel(window, { deltaY: 100 });
    expect(dispatch).toHaveBeenLastCalledWith(setStargazingFov(48));
  });

  it("sets the stargazing field of view", () => {
    const dispatch = jest.fn();
    const { rerender } = render(<StargazingControls active={true} fov={90}
      dispatch={dispatch} />);
    const slider = screen.getByRole("slider", { name: "Zoom" });
    expect(slider).toHaveAttribute("min", "20");
    expect(slider).toHaveAttribute("max", "90");
    expect(slider).toHaveAttribute("step", "1");
    expect(slider.style.getPropertyValue("--stargazing-fov-position"))
      .toEqual("100%");

    rerender(<StargazingControls active={true} fov={20}
      dispatch={dispatch} />);
    expect(slider.style.getPropertyValue("--stargazing-fov-position"))
      .toEqual("0%");

    fireEvent.change(slider, { target: { value: "35" } });

    expect(dispatch).toHaveBeenCalledWith(setStargazingFov(35));
  });

  it("builds a stargazing action", () => {
    expect(setStargazingMode(true)).toEqual({
      type: Actions.SET_3D_STARGAZING_MODE,
      payload: true,
    });
    expect(setStargazingFov(45)).toEqual({
      type: Actions.SET_3D_STARGAZING_FOV,
      payload: 45,
    });
  });
});
