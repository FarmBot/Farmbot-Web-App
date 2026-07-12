import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  effectiveProfileCenter, manualProfileCenter, normalizeProfileValue,
  profileCenterMax, ProfileValueControl, ThreeDProfileHUD,
} from "../three_d_profile";
import { fakeDesignerState } from
  "../../__test_support__/fake_designer_state";
import { Actions } from "../../constants";

describe("3D profile helpers", () => {
  it("normalizes profile values", () => {
    expect(normalizeProfileValue(49, 50, 1000)).toEqual(50);
    expect(normalizeProfileValue(149.6, 50, 1000)).toEqual(150);
    expect(normalizeProfileValue(-1, 0, 1200)).toEqual(0);
    expect(normalizeProfileValue(2000, 0, 1200)).toEqual(1200);
    expect(profileCenterMax(1230.9)).toEqual(1230);
  });

  it("uses stored, midpoint, and followed centers", () => {
    const designer = fakeDesignerState();
    designer.threeDProfileAxis = "x";
    const size = { x: 3000, y: 1200 };
    expect(manualProfileCenter(designer, size)).toEqual(1500);
    designer.threeDProfileCenter.x = 700;
    expect(manualProfileCenter(designer, size)).toEqual(700);
    designer.threeDProfileFollowBot = true;
    expect(effectiveProfileCenter(designer, size, { x: 321, y: 0, z: 0 }))
      .toEqual(321);
    expect(effectiveProfileCenter(designer, size, undefined)).toEqual(700);
    expect(effectiveProfileCenter(
      designer, size, { x: 4000, y: 0, z: 0 }))
      .toEqual(3000);
  });
});

describe("<ProfileValueControl />", () => {
  it("uses carets and slider", () => {
    const onChange = jest.fn();
    const { container } = render(<ProfileValueControl
      label={"WIDTH"}
      value={500}
      min={50}
      max={1000}
      onChange={onChange} />);
    fireEvent.click(screen.getByTitle("increase WIDTH"));
    fireEvent.click(screen.getByTitle("decrease WIDTH"));
    fireEvent.change(container.querySelector("input[type='range']") as Element, {
      target: { value: "849" },
    });
    const numberInput = container.querySelector("input[type='number']") as Element;
    fireEvent.focus(numberInput);
    fireEvent.change(numberInput, { target: { value: "951" } });
    fireEvent.blur(numberInput);
    expect(onChange).toHaveBeenNthCalledWith(1, 501);
    expect(onChange).toHaveBeenNthCalledWith(2, 499);
    expect(onChange).toHaveBeenNthCalledWith(3, 849);
    expect(onChange).toHaveBeenNthCalledWith(4, 951);
  });

  it("disables all controls", () => {
    const { container } = render(<ProfileValueControl
      label={"CENTER"}
      value={500}
      min={0}
      max={1000}
      disabled={true}
      onChange={jest.fn()} />);
    expect(container.querySelectorAll(":disabled")).toHaveLength(4);
    expect(container.querySelector(".three-d-profile-value"))
      .toHaveClass("disabled");
  });
});

describe("<ThreeDProfileHUD />", () => {
  it("moves between closed and open states", () => {
    const designer = fakeDesignerState();
    const { container, rerender } = render(<ThreeDProfileHUD
      designer={designer}
      dispatch={jest.fn()}
      gardenSize={{ x: 3000, y: 1200 }} />);
    expect(container.firstChild).toHaveClass("closed");
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");

    designer.threeDProfileOpen = true;
    rerender(<ThreeDProfileHUD
      designer={designer}
      dispatch={jest.fn()}
      gardenSize={{ x: 3000, y: 1200 }} />);
    expect(container.firstChild).toHaveClass("open");
    expect(container.firstChild).toHaveAttribute("aria-hidden", "false");

    designer.threeDProfileOpen = false;
    rerender(<ThreeDProfileHUD
      designer={designer}
      dispatch={jest.fn()}
      gardenSize={{ x: 3000, y: 1200 }} />);
    expect(container.firstChild).toHaveClass("closed");
  });

  it("renders controls and updates profile settings", () => {
    const designer = fakeDesignerState();
    designer.threeDProfileOpen = true;
    designer.threeDProfileFollowBot = false;
    const dispatch = jest.fn();
    const { container } = render(<ThreeDProfileHUD
      designer={designer}
      dispatch={dispatch}
      gardenSize={{ x: 3000, y: 1200 }} />);
    expect(container.textContent).toContain("AXIS");
    expect(container.textContent).toContain("FOLLOW");
    expect(container.querySelector(".three-d-profile-toggles"))
      .toHaveClass("grid");
    expect(container.querySelector("input[type='range']"))
      .toHaveAttribute("min", "50");
    fireEvent.click(screen.getByTitle("AXIS"));
    fireEvent.click(screen.getByTitle("increase WIDTH"));
    fireEvent.click(screen.getByTitle("decrease CENTER"));
    fireEvent.click(screen.getByTitle("FOLLOW"));
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_PROFILE_AXIS,
      payload: "y",
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_PROFILE_WIDTH,
      payload: 101,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_PROFILE_CENTER,
      payload: { x: 1499, y: undefined },
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_PROFILE_FOLLOW_BOT,
      payload: true,
    });
  });
});
