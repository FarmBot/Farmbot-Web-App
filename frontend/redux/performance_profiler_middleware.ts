import { Middleware } from "redux";
import {
  shouldEnableProfiler,
} from "../util/performance_profiler_settings";

export type ActionStatsSnapshot = {
  total: number;
  byType: Record<string, number>;
  totalDuration: number;
  lastDuration: number;
  durationByType: Record<string, number>;
};

const emptySnapshot = (): ActionStatsSnapshot => ({
  total: 0,
  byType: {},
  totalDuration: 0,
  lastDuration: 0,
  durationByType: {},
});

let actionStats = emptySnapshot();

const getActionType = (action: { type?: unknown }) =>
  typeof action.type === "string" ? action.type : "unknown";

const nowMs = () =>
  typeof performance === "undefined" ? Date.now() : performance.now();

export const drainActionStats = (): ActionStatsSnapshot => {
  const snapshot = actionStats;
  actionStats = emptySnapshot();
  return snapshot;
};

export const resetActionStats = () => {
  actionStats = emptySnapshot();
};

export const performanceProfilerMiddleware: Middleware = () => {
  const enabled = shouldEnableProfiler();
  if (!enabled) {
    return next => action => next(action);
  }
  return next => action => {
    const start = nowMs();
    const result = next(action);
    const duration = nowMs() - start;
    const type = getActionType(action as { type?: unknown });
    actionStats.total += 1;
    actionStats.byType[type] = (actionStats.byType[type] || 0) + 1;
    actionStats.totalDuration += duration;
    actionStats.lastDuration = duration;
    actionStats.durationByType[type] =
      (actionStats.durationByType[type] || 0) + duration;
    return result;
  };
};
