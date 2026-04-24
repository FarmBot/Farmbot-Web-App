import {
  PerfMark, perfCount, perfEnabled, perfMark, perfSample, perfStore,
  usePerfRenderCount,
} from "../perf";
import React from "react";
import { render } from "@testing-library/react";

describe("perf helpers", () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete window.__fbPerf;
    history.pushState({}, "", "/app/designer");
  });

  afterEach(() => {
    window.localStorage.clear();
    delete window.__fbPerf;
  });

  it("stays disabled by default", () => {
    expect(perfEnabled()).toBe(false);
    expect(perfStore()).toBeUndefined();
    perfMark("test");
    expect(window.__fbPerf).toBeUndefined();
  });

  it("can be enabled by localStorage", () => {
    window.localStorage.setItem("FB_PERF_BENCHMARK", "true");
    perfMark("ready");
    perfCount("render.Test");
    perfSample("fps", 60);
    expect(perfStore()?.marks.ready.length).toEqual(1);
    expect(perfStore()?.counts["render.Test"]).toEqual(1);
    expect(perfStore()?.samples.fps).toEqual([60]);
  });

  it("counts renders", () => {
    window.localStorage.setItem("FB_PERF_BENCHMARK", "true");
    const TestComponent = () => {
      usePerfRenderCount("TestComponent");
      return <PerfMark name={"component_rendered"} />;
    };
    render(<TestComponent />);
    expect(perfStore()?.counts["render.TestComponent"]).toEqual(1);
    expect(perfStore()?.marks.component_rendered.length).toEqual(1);
  });
});
