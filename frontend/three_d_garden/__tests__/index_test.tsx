import React from "react";
import { render } from "@testing-library/react";
import { ThreeDGardenProps, ThreeDGarden } from "../index";
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
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
    addPlantProps: fakeAddPlantProps(),
    mapPoints: [],
    weeds: [],
    threeDPlants: [],
  });

  it("renders", () => {
    const { container } = render(<ThreeDGarden {...fakeProps()} />);
    expect(container).toContainHTML("three-d-garden");
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
