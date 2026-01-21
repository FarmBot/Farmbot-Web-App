import React from "react";
import { act, render, screen, within } from "@testing-library/react";
import { applyMiddleware, createStore } from "redux";
import { PerformanceProfiler } from "../util/performance_profiler";
import {
  performanceProfilerMiddleware,
  resetActionStats,
} from "../redux/performance_profiler_middleware";
import {
  PERFORMANCE_PROFILER_KEY,
  shouldEnableProfiler,
} from "../util/performance_profiler_settings";
import {
  recordReactCommit,
  resetReactStats,
  resetThreeStats,
  updateThreeStats,
} from "../util/performance_profiler_metrics";

const createTestStore = () => createStore((state = {}) => state);
const createProfiledStore = () => createStore(
  (state = {}) => state,
  applyMiddleware(performanceProfilerMiddleware),
);

describe("shouldEnableProfiler()", () => {
  beforeEach(() => {
    window.location.search = "";
    localStorage.clear();
    resetActionStats();
  });

  it("defaults to false", () => {
    expect(shouldEnableProfiler()).toBe(false);
  });

  it("uses query param when present", () => {
    window.location.search = "?perf=1";
    expect(shouldEnableProfiler()).toBe(true);
  });

  it("query param overrides localStorage", () => {
    localStorage.setItem(PERFORMANCE_PROFILER_KEY, "true");
    window.location.search = "?perf=0";
    expect(shouldEnableProfiler()).toBe(false);
  });

  it("falls back to localStorage", () => {
    localStorage.setItem(PERFORMANCE_PROFILER_KEY, "true");
    expect(shouldEnableProfiler()).toBe(true);
  });
});

describe("<PerformanceProfiler />", () => {
  const originalRaf = window.requestAnimationFrame;
  const originalCancel = window.cancelAnimationFrame;
  const originalObserver = window.PerformanceObserver;
  const originalMemory = (performance as { memory?: unknown }).memory;

  beforeEach(() => {
    jest.useFakeTimers();
    window.location.search = "";
    localStorage.clear();
    resetActionStats();
    resetReactStats();
    resetThreeStats();
    window.PerformanceObserver = undefined as unknown as typeof PerformanceObserver;
    let rafCalls = 0;
    window.requestAnimationFrame = jest.fn((cb: FrameRequestCallback) => {
      rafCalls += 1;
      if (rafCalls === 1) {
        cb(0);
      }
      return 0;
    }) as typeof window.requestAnimationFrame;
    window.cancelAnimationFrame = jest.fn() as
      typeof window.cancelAnimationFrame;
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    window.requestAnimationFrame = originalRaf;
    window.cancelAnimationFrame = originalCancel;
    window.PerformanceObserver = originalObserver;
    Object.defineProperty(performance, "memory", {
      value: originalMemory,
      configurable: true,
    });
    localStorage.clear();
    resetActionStats();
    resetReactStats();
    resetThreeStats();
  });

  it("renders overlay and children", () => {
    const store = createTestStore();
    render(<PerformanceProfiler store={store}>
      <div>Child</div>
    </PerformanceProfiler>);
    expect(screen.getByTestId("performance-profiler"))
      .toBeInTheDocument();
    expect(screen.getByText("Child")).toBeInTheDocument();
  });

  it("doesn't track actions when disabled", () => {
    const store = createProfiledStore();
    render(<PerformanceProfiler store={store}>
      <div>Child</div>
    </PerformanceProfiler>);
    act(() => {
      store.dispatch({ type: "PING" });
      jest.advanceTimersByTime(1000);
    });
    const actions = screen.getByTestId("performance-profiler-actions");
    expect(within(actions).getByText("No actions")).toBeInTheDocument();
  });

  it("shows action, react, and three stats", () => {
    localStorage.setItem(PERFORMANCE_PROFILER_KEY, "true");
    const store = createProfiledStore();
    render(<PerformanceProfiler store={store}>
      <div>Child</div>
    </PerformanceProfiler>);
    act(() => {
      recordReactCommit("NavBar", 8);
      updateThreeStats({
        render: { calls: 2, triangles: 3, lines: 1, points: 0 },
        memory: { geometries: 4, textures: 5, programs: 2 },
      });
      store.dispatch({ type: "PING" });
      jest.advanceTimersByTime(1000);
    });
    const actions = screen.getByTestId("performance-profiler-actions");
    expect(within(actions).getByText("PING")).toBeInTheDocument();
    const react = screen.getByTestId("performance-profiler-react");
    expect(within(react).getByText("NavBar")).toBeInTheDocument();
    expect(screen.getByText("Three")).toBeInTheDocument();
  });

  it("reports long tasks and memory", () => {
    localStorage.setItem(PERFORMANCE_PROFILER_KEY, "true");
    const entries = [{ duration: 60 }];
    class MockObserver {
      static instance: MockObserver | undefined = undefined;
      callback: PerformanceObserverCallback;
      observe = jest.fn();
      disconnect = jest.fn();
      constructor(callback: PerformanceObserverCallback) {
        this.callback = callback;
        MockObserver.instance = this;
      }
    }
    window.PerformanceObserver = MockObserver as unknown as
      typeof PerformanceObserver;
    Object.defineProperty(performance, "memory", {
      value: { usedJSHeapSize: 20 * 1024 * 1024, jsHeapSizeLimit: 50 * 1024 * 1024 },
      configurable: true,
    });
    const store = createTestStore();
    const { unmount } = render(<PerformanceProfiler store={store}>
      <div>Child</div>
    </PerformanceProfiler>);
    const observer = MockObserver.instance as MockObserver;
    act(() => {
      observer.callback({
        getEntries: () => entries as PerformanceEntry[],
      } as PerformanceObserverEntryList, observer as never);
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText("Main thread")).toBeInTheDocument();
    expect(screen.getByText("Memory")).toBeInTheDocument();
    unmount();
  });

  it("handles unsupported long task observers", () => {
    class ThrowObserver {
      observe = () => { throw new Error("unsupported"); };
      disconnect = jest.fn();
      constructor(_callback: PerformanceObserverCallback) {
        void _callback;
      }
    }
    window.PerformanceObserver = ThrowObserver as unknown as
      typeof PerformanceObserver;
    const store = createTestStore();
    render(<PerformanceProfiler store={store}>
      <div>Child</div>
    </PerformanceProfiler>);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId("performance-profiler"))
      .toBeInTheDocument();
  });
});
