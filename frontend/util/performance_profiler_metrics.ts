export type ReactStat = {
  commits: number;
  total: number;
  last: number;
};

export type ReactStatsSnapshot = {
  total: number;
  byId: Record<string, ReactStat>;
};

const emptyReactStats = (): ReactStatsSnapshot => ({
  total: 0,
  byId: {},
});

let reactStats = emptyReactStats();

export const recordReactCommit = (id: string, duration: number) => {
  const existing = reactStats.byId[id];
  if (existing) {
    existing.commits += 1;
    existing.total += duration;
    existing.last = duration;
  } else {
    reactStats.byId[id] = {
      commits: 1,
      total: duration,
      last: duration,
    };
  }
  reactStats.total += 1;
};

export const drainReactStats = (): ReactStatsSnapshot => {
  const snapshot = reactStats;
  reactStats = emptyReactStats();
  return snapshot;
};

export const resetReactStats = () => {
  reactStats = emptyReactStats();
};

export type ThreeRenderStats = {
  calls: number;
  triangles: number;
  lines: number;
  points: number;
};

export type ThreeMemoryStats = {
  geometries: number;
  textures: number;
  programs: number;
};

export type ThreeStatsSnapshot = {
  render: ThreeRenderStats;
  memory: ThreeMemoryStats;
};

const emptyThreeStats = (): ThreeStatsSnapshot => ({
  render: {
    calls: 0,
    triangles: 0,
    lines: 0,
    points: 0,
  },
  memory: {
    geometries: 0,
    textures: 0,
    programs: 0,
  },
});

let threeStats = emptyThreeStats();

export const updateThreeStats = (snapshot: ThreeStatsSnapshot) => {
  threeStats = snapshot;
};

export const readThreeStats = (): ThreeStatsSnapshot => threeStats;

export const resetThreeStats = () => {
  threeStats = emptyThreeStats();
};
