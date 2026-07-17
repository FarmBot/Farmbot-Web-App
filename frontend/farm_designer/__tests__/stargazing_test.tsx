import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  setSpaceflightMode, setStargazingFov, setStargazingMode,
  StargazingControls,
} from "../stargazing";
import { Actions } from "../../constants";
import { CROP_SLUGS } from "../../crops/metadata";
import { STARGAZING_PROGRESS_STORAGE_KEY } from
  "../stargazing_progress_key";

const setFoundConstellations = (count: number) => localStorage.setItem(
  STARGAZING_PROGRESS_STORAGE_KEY,
  JSON.stringify(CROP_SLUGS.slice(0, count)),
);

const updateFoundConstellations = (count: number) => {
  setFoundConstellations(count);
  act(() => window.dispatchEvent(new StorageEvent("storage", {
    key: STARGAZING_PROGRESS_STORAGE_KEY,
  })));
};

describe("<StargazingControls />", () => {
  it("shows controls only while stargazing", () => {
    const dispatch = jest.fn();
    const { container, rerender } = render(<StargazingControls
      mode={"normal"}
      fov={90}
      dispatch={dispatch} />);
    const button = screen.getByRole("button", {
      hidden: true,
      name: "Exit stargazing",
    });
    const controls = container.querySelector(".stargazing-controls");
    const hud = container.querySelector(".stargazing-hud");
    expect(controls).toHaveAttribute("aria-hidden", "true");
    expect(hud).toHaveAttribute("aria-hidden", "true");
    expect(hud).toHaveTextContent(
      `Crop constellations found: 0 of ${CROP_SLUGS.length}`,
    );
    expect(document.body).not.toHaveClass("stargazing-active");

    rerender(<StargazingControls mode={"stargazing"} fov={90}
      dispatch={dispatch} />);
    expect(button).toHaveAttribute("aria-label", "Exit stargazing");
    expect(button).not.toHaveTextContent("Esc");
    expect(controls?.querySelector(".stargazing-exit-key"))
      .toHaveTextContent("Esc");
    expect(document.body).toHaveClass("stargazing-active");
    expect(hud).toHaveClass("active");
  });

  it("exits from the button", () => {
    setFoundConstellations(25);
    const dispatch = jest.fn();
    render(<StargazingControls mode={"stargazing"} fov={90}
      dispatch={dispatch} />);
    const button = screen.getByRole("button", { name: "Exit stargazing" });
    fireEvent.click(button);

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_VIEW_MODE,
      payload: "normal",
    });
  });

  it("exits from Escape", () => {
    setFoundConstellations(25);
    const addEventListener = jest.spyOn(window, "addEventListener");
    const dispatch = jest.fn();
    render(<StargazingControls mode={"stargazing"} fov={90}
      dispatch={dispatch} />);
    const keydown = addEventListener.mock.calls
      .find(([event]) => event == "keydown")?.[1] as EventListener;

    keydown(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(dispatch).not.toHaveBeenCalled();
    keydown(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_VIEW_MODE,
      payload: "normal",
    });
  });

  it("adjusts the field of view from the arrow keys", () => {
    setFoundConstellations(25);
    const dispatch = jest.fn();
    render(<StargazingControls mode={"stargazing"} fov={35}
      dispatch={dispatch} />);

    fireEvent.keyDown(window, { key: "ArrowUp" });
    expect(dispatch).toHaveBeenLastCalledWith(setStargazingFov(25));

    fireEvent.keyDown(window, { key: "ArrowDown" });
    expect(dispatch).toHaveBeenLastCalledWith(setStargazingFov(35));
  });

  it("clamps arrow-key field-of-view adjustments", () => {
    setFoundConstellations(25);
    const dispatch = jest.fn();
    const { rerender } = render(<StargazingControls
      mode={"stargazing"} fov={25}
      dispatch={dispatch} />);

    fireEvent.keyDown(window, { key: "ArrowUp" });
    expect(dispatch).toHaveBeenLastCalledWith(setStargazingFov(20));

    rerender(<StargazingControls mode={"stargazing"} fov={85}
      dispatch={dispatch} />);
    fireEvent.keyDown(window, { key: "ArrowDown" });
    expect(dispatch).toHaveBeenLastCalledWith(setStargazingFov(90));
  });

  it("zooms the field of view with the mouse wheel", () => {
    setFoundConstellations(25);
    const dispatch = jest.fn();
    render(<StargazingControls mode={"stargazing"} fov={50}
      dispatch={dispatch} />);

    fireEvent.wheel(window, { deltaY: -100 });
    expect(dispatch).toHaveBeenLastCalledWith(setStargazingFov(48));

    fireEvent.wheel(window, { deltaY: -100 });
    expect(dispatch).toHaveBeenLastCalledWith(setStargazingFov(46));

    fireEvent.wheel(window, { deltaY: 100 });
    expect(dispatch).toHaveBeenLastCalledWith(setStargazingFov(48));
  });

  it("sets the stargazing field of view", () => {
    setFoundConstellations(25);
    const dispatch = jest.fn();
    const { rerender } = render(<StargazingControls
      mode={"stargazing"} fov={90}
      dispatch={dispatch} />);
    const slider = screen.getByRole("slider", { name: "Zoom" });
    expect(slider).toHaveAttribute("min", "20");
    expect(slider).toHaveAttribute("max", "90");
    expect(slider).toHaveAttribute("step", "0.5");
    expect(slider.style.getPropertyValue("--stargazing-fov-position"))
      .toEqual("100%");

    rerender(<StargazingControls mode={"stargazing"} fov={20}
      dispatch={dispatch} />);
    expect(slider.style.getPropertyValue("--stargazing-fov-position"))
      .toEqual("0%");

    fireEvent.change(slider, { target: { value: "35" } });

    expect(dispatch).toHaveBeenCalledWith(setStargazingFov(35));
  });

  it("toggles spaceflight and disables zoom input", () => {
    setFoundConstellations(50);
    const dispatch = jest.fn();
    const { container, rerender } = render(<StargazingControls
      mode={"stargazing"} fov={50} dispatch={dispatch} />);
    const button = screen.getByRole("button", { name: "Spaceflight" });
    expect(button.querySelector("i")).toHaveClass("fa-rocket");

    fireEvent.click(button);
    expect(dispatch).toHaveBeenCalledWith(setSpaceflightMode(true));

    dispatch.mockClear();
    rerender(<StargazingControls
      mode={"spaceflight"} fov={50} dispatch={dispatch} />);
    const returnButton = screen.getByRole("button", {
      name: "Return to stargazing",
    });
    expect(returnButton.querySelector("i")).toHaveClass("fa-globe");
    expect(container.querySelector(".stargazing-controls"))
      .toHaveClass("spaceflight");
    expect(container.querySelector(".stargazing-hud")).toHaveClass("active");
    expect(screen.getByRole("slider", { name: "Zoom" })).toBeDisabled();

    fireEvent.keyDown(window, { key: "ArrowUp" });
    fireEvent.wheel(window, { deltaY: -100 });
    expect(dispatch).not.toHaveBeenCalled();

    fireEvent.click(returnButton);
    expect(dispatch).toHaveBeenCalledWith(setSpaceflightMode(false));
  });

  it("locks zoom and spaceflight before discoveries", () => {
    const dispatch = jest.fn();
    const { container } = render(<StargazingControls
      mode={"stargazing"} fov={20} dispatch={dispatch} />);
    const spaceflightButton = screen.getByRole("button", {
      name: "Spaceflight locked: find 50 more constellations",
    });
    expect(spaceflightButton).toBeDisabled();
    expect(spaceflightButton.querySelector("i")).toHaveClass("fa-lock");
    expect(screen.getByRole("slider", { name: "Zoom" })).toBeDisabled();
    expect(container.querySelector(".stargazing-zoom-lock i"))
      .toHaveClass("fa-lock");
    const lock = container.querySelector(
      ".stargazing-zoom-lock",
    ) as HTMLElement;
    expect(lock.style.getPropertyValue("--stargazing-lock-start"))
      .toEqual("0");
    expect(lock).toHaveClass("fully-locked");

    fireEvent.click(spaceflightButton);
    fireEvent.keyDown(window, { key: "ArrowDown" });
    fireEvent.wheel(window, { deltaY: 100 });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("caps zoom at the unlocked fraction", () => {
    setFoundConstellations(5);
    const dispatch = jest.fn();
    const { container } = render(<StargazingControls
      mode={"stargazing"} fov={20} dispatch={dispatch} />);
    const slider = screen.getByRole("slider", { name: "Zoom" });
    expect(slider).toBeEnabled();
    const lock = container.querySelector(
      ".stargazing-zoom-lock",
    ) as HTMLElement;
    expect(lock).not.toHaveClass("fully-locked");
    expect(lock.style.getPropertyValue("--stargazing-lock-start"))
      .toEqual("5.2em");

    fireEvent.change(slider, { target: { value: "90" } });
    expect(dispatch).toHaveBeenCalledWith(setStargazingFov(37.5));
  });

  it("pulses the zoom slider when each zoom level unlocks", () => {
    setFoundConstellations(4);
    const { container } = render(<StargazingControls
      mode={"stargazing"} fov={20} dispatch={jest.fn()} />);
    const slider = container.querySelector(".stargazing-zoom-slider");
    expect(slider).not.toHaveClass("pulse");

    updateFoundConstellations(5);
    expect(slider).toHaveClass("pulse");
    fireEvent.animationEnd(slider!);
    expect(slider).not.toHaveClass("pulse");

    updateFoundConstellations(15);
    expect(slider).toHaveClass("pulse");
    fireEvent.animationEnd(slider!);
    updateFoundConstellations(25);
    expect(slider).toHaveClass("pulse");
  });

  it("pulses the spaceflight button when spaceflight unlocks", () => {
    setFoundConstellations(49);
    render(<StargazingControls
      mode={"stargazing"} fov={20} dispatch={jest.fn()} />);
    const lockedButton = screen.getByRole("button", {
      name: "Spaceflight locked: find 1 more constellations",
    });
    expect(lockedButton).not.toHaveClass("pulse");

    updateFoundConstellations(50);
    const button = screen.getByRole("button", { name: "Spaceflight" });
    expect(button).toHaveClass("pulse");
    fireEvent.animationEnd(button);
    expect(button).not.toHaveClass("pulse");
  });

  it("shows found crop icons in discovery order", () => {
    localStorage.setItem(
      STARGAZING_PROGRESS_STORAGE_KEY,
      JSON.stringify(["beet", "apple"]),
    );
    render(<StargazingControls
      mode={"spaceflight"} fov={20} dispatch={jest.fn()} />);

    const items = screen.getAllByRole("listitem");
    expect(items.map(item => item.getAttribute("aria-label")))
      .toEqual(["Beet", "Apple"]);
    expect(items[0].querySelector("img"))
      .toHaveAttribute("src", "/crops/icons/beet.avif");
    expect(items[0].querySelector(".stargazing-hud-icon-label"))
      .toHaveTextContent("Beet");
  });

  it("builds a stargazing action", () => {
    expect(setStargazingMode(true)).toEqual({
      type: Actions.SET_3D_VIEW_MODE,
      payload: "stargazing",
    });
    expect(setStargazingFov(45)).toEqual({
      type: Actions.SET_3D_STARGAZING_FOV,
      payload: 45,
    });
    expect(setSpaceflightMode(true)).toEqual({
      type: Actions.SET_3D_VIEW_MODE,
      payload: "spaceflight",
    });
    expect(setSpaceflightMode(false)).toEqual({
      type: Actions.SET_3D_VIEW_MODE,
      payload: "stargazing",
    });
  });
});
