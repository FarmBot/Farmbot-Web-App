type Counts = Record<string, number>;

interface PanelPerformance {
  renderDeltas?: Counts;
  causeDeltas?: Counts;
}

interface StressMetrics {
  countDeltas(
    before: Counts,
    after: Counts,
    prefixes: string[],
  ): Counts;
  median(values: number[]): number | undefined;
  medianObjectMetric(
    runs: Record<string, unknown>[],
    key: string,
  ): Counts;
  panelRenderMetrics(panelPerformance?: PanelPerformance):
    Record<string, unknown>;
  renderCountDeltas(before: Counts, after: Counts): Counts;
  renderCounts(counts: Counts): Counts;
  sourceProvenance(runGit?: (args: string[]) => string | undefined): {
    gitHead: string | undefined;
    gitBranch: string | undefined;
    gitDirty: boolean | undefined;
  };
  summary(runs: Record<string, unknown>[]): Record<string, unknown>;
}

const metrics = jest.requireActual<StressMetrics>(
  "../../scripts/perf/stress_1000_3d_metrics.js",
);

describe("stress 1000 3D metrics", () => {
  it("normalizes render counts to the benchmark schema", () => {
    expect(metrics.renderCounts({
      "render.ThreeDGardenMap": 5,
      "render.GardenCameraRig": 3,
      "render.Unrelated": 99,
    })).toEqual({
      ThreeDGardenMap: 5,
      ThreeDGarden: 0,
      GardenModel: 0,
      GardenCameraRig: 3,
      PanelCameraController: 0,
    });
  });

  it("calculates render deltas without hiding counter decreases", () => {
    expect(metrics.renderCountDeltas({
      "render.ThreeDGardenMap": 5,
      "render.GardenModel": 4,
    }, {
      "render.ThreeDGardenMap": 2,
      "render.GardenModel": 7,
    })).toEqual({
      ThreeDGardenMap: -3,
      ThreeDGarden: 0,
      GardenModel: 3,
      GardenCameraRig: 0,
      PanelCameraController: 0,
    });
  });

  it("filters cause deltas by prefix and omits unchanged counters", () => {
    expect(metrics.countDeltas({
      "change.foo": 4,
      "panelCamera.frames": 1,
      unrelated: 9,
    }, {
      "change.foo": 1,
      "gardenCamera.springFrame": 2,
      "panelCamera.frames": 1,
      unrelated: 1,
    }, [
      "change.",
      "gardenCamera.",
      "panelCamera.",
    ])).toEqual({
      "change.foo": -3,
      "gardenCamera.springFrame": 2,
    });
  });

  it("uses zero for a missing object metric in a benchmark run", () => {
    expect(metrics.medianObjectMetric([
      { panelRenderCauses: { route: 2 } },
      { panelRenderCauses: { route: 6, spring: 4 } },
      { panelRenderCauses: { route: 4, spring: 8 } },
    ], "panelRenderCauses")).toEqual({
      route: 4,
      spring: 4,
    });
  });

  it("summarizes scalar and nested panel metrics", () => {
    expect(metrics.summary([
      {
        fpsMedian: 10,
        panelRenderCauses: { route: 2 },
        panelAttributableRenders: { GardenModel: 2 },
      },
      {
        fpsMedian: 30,
        panelRenderCauses: { route: 6, spring: 4 },
        panelAttributableRenders: {
          GardenModel: 6,
          GardenCameraRig: 4,
        },
      },
      {
        fpsMedian: 20,
        panelRenderCauses: { route: 4, spring: 8 },
        panelAttributableRenders: { GardenModel: 4 },
      },
    ])).toMatchObject({
      fpsMedian: 20,
      panelRenderCauses: { route: 4, spring: 4 },
      panelAttributableRenders: {
        GardenModel: 4,
        GardenCameraRig: 0,
      },
    });
  });

  it("records reproducible source provenance", () => {
    const output: Record<string, string | undefined> = {
      "status --porcelain": " M scripts/perf/stress_1000_3d.js",
      "rev-parse HEAD": "abc123",
      "branch --show-current": "codex/stress-metrics",
    };
    const runGit = jest.fn((args: string[]) => output[args.join(" ")]);

    expect(metrics.sourceProvenance(runGit)).toEqual({
      gitHead: "abc123",
      gitBranch: "codex/stress-metrics",
      gitDirty: true,
    });
    expect(runGit.mock.calls).toEqual([
      [["status", "--porcelain"]],
      [["rev-parse", "HEAD"]],
      [["branch", "--show-current"]],
    ]);
  });

  it("distinguishes a clean tree from unavailable Git metadata", () => {
    expect(metrics.sourceProvenance(() => "")).toEqual({
      gitHead: "",
      gitBranch: "",
      gitDirty: false,
    });
    expect(metrics.sourceProvenance(() => undefined)).toEqual({
      gitHead: undefined,
      gitBranch: undefined,
      gitDirty: undefined,
    });
  });

  it("attributes panel renders and camera animation frames", () => {
    expect(metrics.panelRenderMetrics({
      renderDeltas: {
        ThreeDGardenMap: 1,
        ThreeDGarden: 2,
        GardenModel: 3,
        GardenCameraRig: 4,
        PanelCameraController: 5,
      },
      causeDeltas: {
        "change.ThreeDGardenMap.designer": 2,
        "change.GardenModel.route": 3,
        "change.GardenModel.viewport": 4,
        "change.GardenCameraRig.cameraRequest": 5,
        "panelCamera.springFrame": 6,
        "gardenCamera.springFrame": 7,
        unrelated: 8,
      },
    })).toEqual({
      panelThreeDGardenMapRenders: 1,
      panelGardenModelRenders: 3,
      panelThreeDGardenRenders: 2,
      panelGardenCameraRigRenders: 4,
      panelCameraControllerRenders: 5,
      panelCameraSpringFrames: 6,
      gardenCameraSpringFrames: 7,
      panelRenderCauses: {
        "change.ThreeDGardenMap.designer": 2,
        "change.GardenModel.route": 3,
        "change.GardenModel.viewport": 4,
        "change.GardenCameraRig.cameraRequest": 5,
        "panelCamera.springFrame": 6,
        "gardenCamera.springFrame": 7,
        unrelated: 8,
      },
      panelAttributableRenders: {
        ThreeDGardenMap: 2,
        ThreeDGarden: 2,
        GardenModel: 7,
        GardenCameraRig: 5,
      },
    });
  });

  it("keeps the panel metric schema when no counters are available", () => {
    expect(metrics.panelRenderMetrics()).toEqual({
      panelThreeDGardenMapRenders: undefined,
      panelGardenModelRenders: undefined,
      panelThreeDGardenRenders: undefined,
      panelGardenCameraRigRenders: undefined,
      panelCameraControllerRenders: undefined,
      panelCameraSpringFrames: 0,
      gardenCameraSpringFrames: 0,
      panelRenderCauses: {},
      panelAttributableRenders: {
        ThreeDGardenMap: 0,
        ThreeDGarden: 0,
        GardenModel: 0,
        GardenCameraRig: 0,
      },
    });
  });
});
