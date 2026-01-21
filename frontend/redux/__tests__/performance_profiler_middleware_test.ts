import {
  drainActionStats,
  performanceProfilerMiddleware,
  resetActionStats,
} from "../performance_profiler_middleware";
import {
  PERFORMANCE_PROFILER_KEY,
} from "../../util/performance_profiler_settings";

describe("performanceProfilerMiddleware", () => {
  const createInvoke = () => {
    const store = {
      getState: jest.fn(),
      dispatch: jest.fn(),
    };
    const next = jest.fn(action => action);
    return performanceProfilerMiddleware(store as never)(next);
  };

  beforeEach(() => {
    localStorage.clear();
    resetActionStats();
  });

  afterEach(() => {
    localStorage.clear();
    resetActionStats();
  });

  it("tracks actions when enabled", () => {
    localStorage.setItem(PERFORMANCE_PROFILER_KEY, "true");
    let calls = 0;
    const nowSpy = jest.spyOn(performance, "now").mockImplementation(() => {
      calls += 1;
      return calls === 1 ? 0 : 12;
    });
    const invoke = createInvoke();
    invoke({ type: "PING" });
    const snapshot = drainActionStats();
    expect(snapshot.total).toEqual(1);
    expect(snapshot.byType.PING).toEqual(1);
    expect(snapshot.totalDuration).toEqual(12);
    expect(snapshot.lastDuration).toEqual(12);
    expect(snapshot.durationByType.PING).toEqual(12);
    nowSpy.mockRestore();
  });

  it("no-ops when disabled", () => {
    const invoke = createInvoke();
    invoke({ type: "PING" });
    const snapshot = drainActionStats();
    expect(snapshot.total).toEqual(0);
  });
});
