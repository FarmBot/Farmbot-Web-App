import React from "react";
import { svgMount } from "../../../../__test_support__/svg_mount";
import { chooseProfile, ProfileLine } from "../map_line";
import { ProfileLineProps } from "../interfaces";
import {
  fakeDesignerState,
} from "../../../../__test_support__/fake_designer_state";
import {
  fakeMapTransformProps,
} from "../../../../__test_support__/map_transform_props";
import { Actions } from "../../../../constants";

describe("<ProfileLine />", () => {
  const rectProps = (container: HTMLElement) => {
    const rect = container.querySelector("rect");
    if (!rect) { return undefined; }
    return {
      x: Number(rect.getAttribute("x")),
      y: Number(rect.getAttribute("y")),
      height: Number(rect.getAttribute("height")),
      width: Number(rect.getAttribute("width")),
    };
  };

  const fakeProps = (): ProfileLineProps => ({
    designer: fakeDesignerState(),
    plantAreaOffset: { x: 10, y: 10 },
    botPosition: { x: undefined, y: undefined, z: undefined },
    mapTransformProps: fakeMapTransformProps(),
  });

  it("renders when viewer is closed", () => {
    const { container } = svgMount(<ProfileLine {...fakeProps()} />);
    expect(container.querySelector("rect")).toBeNull();
  });

  it("renders when viewer is open: follow", () => {
    const p = fakeProps();
    p.designer.profileOpen = true;
    p.designer.profileAxis = "x";
    p.designer.profileFollowBot = true;
    p.botPosition = { x: 1, y: 2, z: 3 };
    const { container } = svgMount(<ProfileLine {...p} />);
    expect(rectProps(container)).toEqual({
      x: -50, y: -10, height: 1520, width: 100,
    });
  });

  it("renders when viewer is open: follow (map rotated)", () => {
    const p = fakeProps();
    p.designer.profileOpen = true;
    p.designer.profileAxis = "x";
    p.designer.profileFollowBot = true;
    p.mapTransformProps.xySwap = true;
    p.botPosition = { x: 1, y: 2, z: 3 };
    const { container } = svgMount(<ProfileLine {...p} />);
    expect(rectProps(container)).toEqual({
      x: -10, y: -50, height: 100, width: 1520,
    });
  });

  it("renders when viewer is open: x-axis = 2000", () => {
    const p = fakeProps();
    p.designer.profileOpen = true;
    p.designer.profileAxis = "x";
    p.designer.profilePosition = { x: 2000, y: 1000 };
    const { container } = svgMount(<ProfileLine {...p} />);
    expect(rectProps(container)).toEqual({
      x: 1950, y: -10, height: 1520, width: 100,
    });
  });

  it("renders when viewer is open: y-axis = 1000", () => {
    const p = fakeProps();
    p.designer.profileOpen = true;
    p.designer.profilePosition = { x: 2000, y: 1000 };
    p.designer.profileAxis = "y";
    const { container } = svgMount(<ProfileLine {...p} />);
    expect(rectProps(container)).toEqual({
      x: -10, y: 950, height: 100, width: 3020,
    });
  });
});

describe("chooseProfile()", () => {
  it("updates chosen coordinates", () => {
    const dispatch = jest.fn();
    chooseProfile({ dispatch, gardenCoords: { x: 1, y: 2 } });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PROFILE_POSITION,
      payload: { x: 1, y: 2, z: 0 }
    });
  });

  it("doesn't update coordinates", () => {
    const dispatch = jest.fn();
    chooseProfile({ dispatch, gardenCoords: undefined });
    expect(dispatch).not.toHaveBeenCalled();
  });
});
