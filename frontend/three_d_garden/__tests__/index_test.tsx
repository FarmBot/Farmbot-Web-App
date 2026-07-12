import React from "react";
import { render } from "@testing-library/react";
import {
  ThreeDGardenProps, ThreeDGarden, viewPrismViewportClassName,
} from "../index";
import { VIEW_PRISM_VIEWPORT_SIZE } from "../garden_model";
import * as reactThreeFiber from "@react-three/fiber";
import { INITIAL, INITIAL_POSITION } from "../config";
import { clone } from "lodash";
import { fakeAddPlantProps } from "../../__test_support__/fake_props";

beforeEach(() => {
  console.log = jest.fn();
  window.localStorage.clear();
  delete window.__fbPerf;
});

afterEach(() => {
  window.localStorage.clear();
  delete window.__fbPerf;
  jest.restoreAllMocks();
});

describe("<ThreeDGarden />", () => {
  const fakeProps = (): ThreeDGardenProps => ({
    config: { ...clone(INITIAL), viewCube: true },
    configPosition: clone(INITIAL_POSITION),
    addPlantProps: fakeAddPlantProps(),
    mapPoints: [],
    weeds: [],
    threeDPlants: [],
    sceneObjects: [],
  });

  it("renders", () => {
    const canvasSpy = jest.spyOn(reactThreeFiber, "Canvas");
    const { container } = render(<ThreeDGarden {...fakeProps()} />);
    expect(container).toContainHTML("three-d-garden");
    const viewport = container.querySelector(".view-prism-viewport");
    expect(viewport).toHaveStyle({
      width: `${VIEW_PRISM_VIEWPORT_SIZE}px`,
      height: `${VIEW_PRISM_VIEWPORT_SIZE}px`,
    });
    expect(viewport).not.toHaveClass("profile-open");
    expect(canvasSpy).toHaveBeenCalledTimes(2);
    expect(canvasSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        gl: { alpha: true },
        camera: expect.objectContaining({
          position: [0, 0, expect.any(Number)],
          fov: 40,
        }),
      }),
      undefined,
    );
  });

  it("marks the view prism viewport when the profile HUD is open", () => {
    expect(viewPrismViewportClassName(true))
      .toEqual("view-prism-viewport profile-open");
  });

  it("disables canvas shadows in low-detail mode", () => {
    const canvasSpy = jest.spyOn(reactThreeFiber, "Canvas");
    const p = fakeProps();
    p.config.lowDetail = true;
    render(<ThreeDGarden {...p} />);
    expect(canvasSpy).toHaveBeenCalledWith(
      expect.objectContaining({ shadows: false }),
      undefined);
    canvasSpy.mockRestore();
  });

  it("hides the product view prism when disabled", () => {
    const canvasSpy = jest.spyOn(reactThreeFiber, "Canvas");
    const p = fakeProps();
    p.config.viewCube = false;
    const { container } = render(<ThreeDGarden {...p} />);
    expect(container.querySelector(".view-prism-viewport")).toBeFalsy();
    expect(canvasSpy).toHaveBeenCalledTimes(1);
  });

  it("counts benchmark renders", () => {
    window.localStorage.setItem("FB_PERF_BENCHMARK", "true");
    render(<ThreeDGarden {...fakeProps()} />);
    expect(window.__fbPerf?.counts["render.ThreeDGarden"]).toEqual(1);
    expect(window.__fbPerf?.marks.three_d_garden_mounted.length).toEqual(1);
  });

  it("skips rerenders when canvas props are unchanged", () => {
    window.localStorage.setItem("FB_PERF_BENCHMARK", "true");
    const p = fakeProps();
    const { rerender } = render(<ThreeDGarden {...p} />);
    rerender(<ThreeDGarden {...p} />);
    expect(window.__fbPerf?.counts["render.ThreeDGarden"]).toEqual(1);
  });
});
