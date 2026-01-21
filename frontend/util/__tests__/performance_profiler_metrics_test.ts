import {
  drainReactStats,
  readThreeStats,
  recordReactCommit,
  resetReactStats,
  resetThreeStats,
  updateThreeStats,
} from "../performance_profiler_metrics";

describe("performance profiler metrics", () => {
  afterEach(() => {
    resetReactStats();
    resetThreeStats();
  });

  it("records and drains react stats", () => {
    recordReactCommit("app", 4);
    recordReactCommit("app", 6);
    recordReactCommit("nav", 3);
    const snapshot = drainReactStats();
    expect(snapshot.total).toEqual(3);
    expect(snapshot.byId.app.commits).toEqual(2);
    expect(snapshot.byId.app.total).toEqual(10);
    expect(snapshot.byId.nav.commits).toEqual(1);
    const empty = drainReactStats();
    expect(empty.total).toEqual(0);
  });

  it("updates and reads three stats", () => {
    const stats = {
      render: { calls: 5, triangles: 10, lines: 2, points: 1 },
      memory: { geometries: 3, textures: 4, programs: 1 },
    };
    updateThreeStats(stats);
    expect(readThreeStats()).toEqual(stats);
    resetThreeStats();
    expect(readThreeStats().render.calls).toEqual(0);
  });
});
