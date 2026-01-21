import React from "react";
import { render } from "@testing-library/react";
import { ThreeDPerformanceMonitor } from "../performance_monitor";
import {
  updateThreeStats,
} from "../../util/performance_profiler_metrics";

jest.mock("../../util/performance_profiler_metrics", () => ({
  ...jest.requireActual("../../util/performance_profiler_metrics"),
  updateThreeStats: jest.fn(),
}));

describe("<ThreeDPerformanceMonitor />", () => {
  beforeEach(() => {
    (updateThreeStats as jest.Mock).mockClear();
  });

  it("reports renderer stats", () => {
    const nowSpy = jest.spyOn(performance, "now").mockReturnValue(1000);
    render(<ThreeDPerformanceMonitor />);
    expect(updateThreeStats).toHaveBeenCalled();
    nowSpy.mockRestore();
  });

  it("skips samples before interval", () => {
    const nowSpy = jest.spyOn(performance, "now").mockReturnValue(0);
    render(<ThreeDPerformanceMonitor />);
    expect(updateThreeStats).not.toHaveBeenCalled();
    nowSpy.mockRestore();
  });
});
