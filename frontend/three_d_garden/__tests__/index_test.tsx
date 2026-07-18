import React from "react";
import { act, render } from "@testing-library/react";
import { ThreeDGardenProps, ThreeDGarden } from "../index";
import { VIEW_PRISM_VIEWPORT_SIZE } from "../garden_model";
import * as reactThreeFiber from "@react-three/fiber";
import { INITIAL, INITIAL_POSITION } from "../config";
import { clone } from "lodash";
import { fakeAddPlantProps } from "../../__test_support__/fake_props";
import { createPanelCameraStore } from "../panel_camera";
import { filterSectionIntersections } from "../section";

const useThreeImplementation =
  (reactThreeFiber.useThree as jest.Mock).getMockImplementation();

beforeEach(() => {
  console.log = jest.fn();
  window.localStorage.clear();
  delete window.__fbPerf;
  jest.spyOn(reactThreeFiber, "useThree")
    .mockImplementation(useThreeImplementation);
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
    panelCameraStore: createPanelCameraStore(true),
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
    expect(canvasSpy).toHaveBeenCalledTimes(2);
    expect(canvasSpy.mock.calls[0][0].events).toEqual(expect.any(Function));
    const store = {} as never;
    expect(canvasSpy.mock.calls[0][0].events?.(store)).toEqual({
      enabled: true,
      filter: filterSectionIntersections,
    });
    expect(reactThreeFiber.events).toHaveBeenCalledWith(store);
    expect(canvasSpy.mock.calls[0][0]).toEqual(expect.objectContaining({
      gl: { alpha: true },
      style: { backgroundColor: "#2c362f" },
    }));
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

  it("isolates panel camera store updates", () => {
    window.localStorage.setItem("FB_PERF_BENCHMARK", "true");
    const p = fakeProps();
    render(<ThreeDGarden {...p} />);

    act(() => p.panelCameraStore.setOpen(false));

    expect(p.panelCameraStore.getSnapshot()).toBeFalsy();
    expect(window.__fbPerf?.counts["render.ThreeDGarden"]).toEqual(1);
  });
});
