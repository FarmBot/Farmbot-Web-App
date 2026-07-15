import React from "react";
import { render } from "@testing-library/react";
import {
  applyViewRequest, consumeViewRequest, ThreeDGardenProps, ThreeDGarden,
} from "../index";
import { VIEW_PRISM_VIEWPORT_SIZE } from "../garden_model";
import * as reactThreeFiber from "@react-three/fiber";
import { INITIAL, INITIAL_POSITION } from "../config";
import { clone } from "lodash";
import { fakeAddPlantProps } from "../../__test_support__/fake_props";
import { Actions } from "../../constants";

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

  it("applies palette camera requests through the view prism bridge", () => {
    const selectDirection = jest.fn();
    const bridgeRef = { current: { selectDirection } };
    expect(applyViewRequest(
      bridgeRef, { direction: [1, 0, 1], nonce: 1 })).toEqual(true);
    expect(selectDirection).toHaveBeenCalledWith([1, 0, 1]);
    expect(applyViewRequest(bridgeRef, undefined)).toEqual(false);
    expect(applyViewRequest({ current: {} }, {
      direction: [1, 0, 1], nonce: 2,
    })).toEqual(false);
    expect(selectDirection).toHaveBeenCalledTimes(1);
  });

  it("clears palette camera requests after applying them", () => {
    const dispatch = jest.fn();
    const selectDirection = jest.fn();
    const bridgeRef = { current: { selectDirection } };
    expect(consumeViewRequest(bridgeRef, {
      direction: [-1, 1, 1], nonce: 1,
    }, dispatch)).toEqual(true);
    expect(selectDirection).toHaveBeenCalledWith([-1, 1, 1]);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_VIEW,
      payload: undefined,
    });
    expect(consumeViewRequest(bridgeRef, undefined, dispatch)).toEqual(false);
    expect(dispatch).toHaveBeenCalledTimes(1);
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
