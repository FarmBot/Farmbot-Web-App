import React from "react";
import { Store } from "redux";
import {
  ActionStatsSnapshot,
  drainActionStats,
} from "../redux/performance_profiler_middleware";
import {
  drainReactStats,
  readThreeStats,
  recordReactCommit,
  ReactStatsSnapshot,
  ThreeStatsSnapshot,
} from "./performance_profiler_metrics";

interface PerformanceProfilerProps {
  store: Store;
  children: React.ReactNode;
}

type RenderStats = {
  commits: number;
  total: number;
  last: number;
};

type DisplayStats = {
  fps: number;
  frameMs: number;
  commitsPerSecond: number;
  commitAvgMs: number;
  commitLastMs: number;
  storeUpdatesPerSecond: number;
};

type ActionSummary = {
  type: string;
  count: number;
};

type ActionDurationSummary = {
  type: string;
  duration: number;
  avg: number;
};

type ActionStats = {
  total: number;
  avgMs: number;
  lastMs: number;
  topCounts: ActionSummary[];
  topDurations: ActionDurationSummary[];
};

type ReactSummary = {
  id: string;
  commits: number;
  total: number;
  avg: number;
};

type ReactStats = {
  top: ReactSummary[];
};

type LongTaskStats = {
  count: number;
  avgMs: number;
  maxMs: number;
};

type MemoryStats = {
  usedMb?: number;
  limitMb?: number;
};

const MB = 1024 * 1024;

const INITIAL_STATS: DisplayStats = {
  fps: 0,
  frameMs: 0,
  commitsPerSecond: 0,
  commitAvgMs: 0,
  commitLastMs: 0,
  storeUpdatesPerSecond: 0,
};

const INITIAL_ACTION_STATS: ActionStats = {
  total: 0,
  avgMs: 0,
  lastMs: 0,
  topCounts: [],
  topDurations: [],
};

const INITIAL_REACT_STATS: ReactStats = {
  top: [],
};

const INITIAL_LONG_TASK_STATS: LongTaskStats = {
  count: 0,
  avgMs: 0,
  maxMs: 0,
};

const INITIAL_MEMORY_STATS: MemoryStats = {
  usedMb: undefined,
  limitMb: undefined,
};

// Memoized to avoid re-rendering the app tree on profiler updates.
const ProfilerBoundary = React.memo((props: {
  onRender: React.ProfilerOnRenderCallback;
  children: React.ReactNode;
}) => {
  return <React.Profiler id={"app"} onRender={props.onRender}>
    {props.children}
  </React.Profiler>;
});

const nowMs = () =>
  typeof performance === "undefined" ? Date.now() : performance.now();

const formatInt = (value: number) => Math.round(value);
const formatMs = (value: number) => value.toFixed(1);
const formatMb = (value: number | undefined) =>
  typeof value === "number" ? value.toFixed(0) : "n/a";

const summarizeActionCounts = (snapshot: ActionStatsSnapshot) =>
  Object.entries(snapshot.byType)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([type, count]) => ({ type, count }));

const summarizeActionDurations = (snapshot: ActionStatsSnapshot) =>
  Object.entries(snapshot.durationByType)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([type, duration]) => ({
      type,
      duration,
      avg: snapshot.byType[type]
        ? duration / snapshot.byType[type]
        : 0,
    }));

const summarizeReact = (snapshot: ReactStatsSnapshot) =>
  Object.entries(snapshot.byId)
    .sort((left, right) => right[1].total - left[1].total)
    .slice(0, 3)
    .map(([id, stats]) => ({
      id,
      commits: stats.commits,
      total: stats.total,
      avg: stats.commits > 0 ? stats.total / stats.commits : 0,
    }));

const toMemoryStats = (): MemoryStats => {
  const memory = (performance as Performance & {
    memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number };
  }).memory;
  if (!memory) {
    return { usedMb: undefined, limitMb: undefined };
  }
  return {
    usedMb: memory.usedJSHeapSize / MB,
    limitMb: memory.jsHeapSizeLimit / MB,
  };
};

export const PerformanceProfiler = (props: PerformanceProfilerProps) => {
  const [stats, setStats] = React.useState<DisplayStats>(INITIAL_STATS);
  const [actionStats, setActionStats] = React.useState<ActionStats>(
    INITIAL_ACTION_STATS,
  );
  const [reactStats, setReactStats] = React.useState<ReactStats>(
    INITIAL_REACT_STATS,
  );
  const [threeStats, setThreeStats] = React.useState<ThreeStatsSnapshot>(
    readThreeStats(),
  );
  const [longTaskStats, setLongTaskStats] = React.useState<LongTaskStats>(
    INITIAL_LONG_TASK_STATS,
  );
  const [memoryStats, setMemoryStats] = React.useState<MemoryStats>(
    INITIAL_MEMORY_STATS,
  );
  const renderStats = React.useRef<RenderStats>({
    commits: 0,
    total: 0,
    last: 0,
  });
  const storeUpdates = React.useRef(0);
  const longTasks = React.useRef({ count: 0, total: 0, max: 0 });

  React.useEffect(() => {
    const unsubscribe = props.store.subscribe(() => {
      storeUpdates.current += 1;
    });
    return unsubscribe;
  }, [props.store]);

  React.useEffect(() => {
    if (typeof PerformanceObserver === "undefined") {
      return;
    }
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        longTasks.current.count += 1;
        longTasks.current.total += entry.duration;
        longTasks.current.max = Math.max(
          longTasks.current.max,
          entry.duration,
        );
      });
    });
    try {
      observer.observe({ entryTypes: ["longtask"] });
    } catch {
      return;
    }
    return () => observer.disconnect();
  }, []);

  const onRender = React.useCallback<React.ProfilerOnRenderCallback>((
    id,
    _phase,
    actualDuration,
  ) => {
    renderStats.current.commits += 1;
    renderStats.current.total += actualDuration;
    renderStats.current.last = actualDuration;
    recordReactCommit(id, actualDuration);
  }, []);

  React.useEffect(() => {
    let rafId = 0;
    let lastFrameTime = nowMs();
    let sampleStart = nowMs();
    let frames = 0;
    let frameMsTotal = 0;

    const requestFrame = window.requestAnimationFrame
      ? window.requestAnimationFrame.bind(window)
      : (cb: FrameRequestCallback) =>
        window.setTimeout(() => cb(nowMs()), 16);

    const cancelFrame = window.cancelAnimationFrame
      ? window.cancelAnimationFrame.bind(window)
      : window.clearTimeout.bind(window);

    const onFrame = (time: number) => {
      frames += 1;
      const delta = time - lastFrameTime;
      frameMsTotal += delta;
      lastFrameTime = time;
      rafId = requestFrame(onFrame);
    };

    rafId = requestFrame(onFrame);

    const intervalId = window.setInterval(() => {
      const now = nowMs();
      const elapsed = now - sampleStart;
      const fps = elapsed > 0 ? (frames * 1000) / elapsed : 0;
      const frameMs = frames > 0 ? frameMsTotal / frames : 0;
      const commitCount = renderStats.current.commits;
      const commitAvg = commitCount > 0
        ? renderStats.current.total / commitCount
        : 0;
      const actionSnapshot = drainActionStats();
      const reactSnapshot = drainReactStats();
      const threeSnapshot = readThreeStats();
      const memorySnapshot = toMemoryStats();
      const longTaskSnapshot = longTasks.current;
      const longTaskCount = longTaskSnapshot.count;
      const longTaskAvg = longTaskCount > 0
        ? longTaskSnapshot.total / longTaskCount
        : 0;
      const actionAvg = actionSnapshot.total > 0
        ? actionSnapshot.totalDuration / actionSnapshot.total
        : 0;

      setStats({
        fps,
        frameMs,
        commitsPerSecond: commitCount,
        commitAvgMs: commitAvg,
        commitLastMs: renderStats.current.last,
        storeUpdatesPerSecond: storeUpdates.current,
      });
      setActionStats({
        total: actionSnapshot.total,
        avgMs: actionAvg,
        lastMs: actionSnapshot.lastDuration,
        topCounts: summarizeActionCounts(actionSnapshot),
        topDurations: summarizeActionDurations(actionSnapshot),
      });
      setReactStats({ top: summarizeReact(reactSnapshot) });
      setThreeStats(threeSnapshot);
      setLongTaskStats({
        count: longTaskCount,
        avgMs: longTaskAvg,
        maxMs: longTaskSnapshot.max,
      });
      setMemoryStats(memorySnapshot);

      sampleStart = now;
      frames = 0;
      frameMsTotal = 0;
      renderStats.current.commits = 0;
      renderStats.current.total = 0;
      storeUpdates.current = 0;
      longTasks.current = { count: 0, total: 0, max: 0 };
    }, 1000);

    return () => {
      cancelFrame(rafId);
      window.clearInterval(intervalId);
    };
  }, []);

  const heapText = memoryStats.usedMb !== undefined
    && memoryStats.limitMb !== undefined
    ? `${formatMb(memoryStats.usedMb)}/${formatMb(memoryStats.limitMb)} MB`
    : "n/a";

  return <>
    <ProfilerBoundary onRender={onRender}>
      {props.children}
    </ProfilerBoundary>
    <div className={"performance-profiler"}
      data-testid={"performance-profiler"}>
      <div className={"performance-profiler__title"}>
        Performance
      </div>
      <div className={"performance-profiler__section"}>
        <div className={"performance-profiler__section-title"}>
          Frame
        </div>
        <div className={"performance-profiler__metric"}>
          <span>FPS</span>
          <span>{formatInt(stats.fps)}</span>
        </div>
        <div className={"performance-profiler__metric"}>
          <span>Frame</span>
          <span>{formatMs(stats.frameMs)} ms</span>
        </div>
      </div>
      <div className={"performance-profiler__section"}>
        <div className={"performance-profiler__section-title"}>
          React
        </div>
        <div className={"performance-profiler__metric"}>
          <span>Commits</span>
          <span>{formatInt(stats.commitsPerSecond)}/s</span>
        </div>
        <div className={"performance-profiler__metric"}>
          <span>Avg</span>
          <span>{formatMs(stats.commitAvgMs)} ms</span>
        </div>
        <div className={"performance-profiler__metric"}>
          <span>Last</span>
          <span>{formatMs(stats.commitLastMs)} ms</span>
        </div>
        <div className={"performance-profiler__subhead"}>
          Top components
        </div>
        <div className={"performance-profiler__list"}
          data-testid={"performance-profiler-react"}>
          {reactStats.top.length > 0
            ? reactStats.top.map(item =>
              <div key={item.id} className={"performance-profiler__row"}>
                <span>{item.id}</span>
                <span>{formatMs(item.avg)} ms</span>
              </div>)
            : <div className={"performance-profiler__empty"}>
              No commits
            </div>}
        </div>
      </div>
      <div className={"performance-profiler__section"}>
        <div className={"performance-profiler__section-title"}>
          Redux
        </div>
        <div className={"performance-profiler__metric"}>
          <span>Store updates</span>
          <span>{formatInt(stats.storeUpdatesPerSecond)}/s</span>
        </div>
        <div className={"performance-profiler__metric"}>
          <span>Actions</span>
          <span>{formatInt(actionStats.total)}/s</span>
        </div>
        <div className={"performance-profiler__metric"}>
          <span>Action avg</span>
          <span>{formatMs(actionStats.avgMs)} ms</span>
        </div>
        <div className={"performance-profiler__metric"}>
          <span>Action last</span>
          <span>{formatMs(actionStats.lastMs)} ms</span>
        </div>
        <div className={"performance-profiler__subhead"}>
          Top actions
        </div>
        <div className={"performance-profiler__list"}
          data-testid={"performance-profiler-actions"}>
          {actionStats.topCounts.length > 0
            ? actionStats.topCounts.map(action =>
              <div key={action.type} className={"performance-profiler__row"}>
                <span>{action.type}</span>
                <span>{action.count}</span>
              </div>)
            : <div className={"performance-profiler__empty"}>
              No actions
            </div>}
        </div>
        <div className={"performance-profiler__subhead"}>
          Top action time
        </div>
        <div className={"performance-profiler__list"}
          data-testid={"performance-profiler-action-time"}>
          {actionStats.topDurations.length > 0
            ? actionStats.topDurations.map(action =>
              <div key={action.type} className={"performance-profiler__row"}>
                <span>{action.type}</span>
                <span>{formatMs(action.avg)} ms</span>
              </div>)
            : <div className={"performance-profiler__empty"}>
              No action timing
            </div>}
        </div>
      </div>
      <div className={"performance-profiler__section"}>
        <div className={"performance-profiler__section-title"}>
          Three
        </div>
        <div className={"performance-profiler__metric"}>
          <span>Calls</span>
          <span>{formatInt(threeStats.render.calls)}</span>
        </div>
        <div className={"performance-profiler__metric"}>
          <span>Triangles</span>
          <span>{formatInt(threeStats.render.triangles)}</span>
        </div>
        <div className={"performance-profiler__metric"}>
          <span>Geometries</span>
          <span>{formatInt(threeStats.memory.geometries)}</span>
        </div>
        <div className={"performance-profiler__metric"}>
          <span>Textures</span>
          <span>{formatInt(threeStats.memory.textures)}</span>
        </div>
        <div className={"performance-profiler__metric"}>
          <span>Programs</span>
          <span>{formatInt(threeStats.memory.programs)}</span>
        </div>
      </div>
      <div className={"performance-profiler__section"}>
        <div className={"performance-profiler__section-title"}>
          Main thread
        </div>
        <div className={"performance-profiler__metric"}>
          <span>Long tasks</span>
          <span>{formatInt(longTaskStats.count)}/s</span>
        </div>
        <div className={"performance-profiler__metric"}>
          <span>Long avg</span>
          <span>{formatMs(longTaskStats.avgMs)} ms</span>
        </div>
        <div className={"performance-profiler__metric"}>
          <span>Long max</span>
          <span>{formatMs(longTaskStats.maxMs)} ms</span>
        </div>
      </div>
      <div className={"performance-profiler__section"}>
        <div className={"performance-profiler__section-title"}>
          Memory
        </div>
        <div className={"performance-profiler__metric"}>
          <span>Heap</span>
          <span>{heapText}</span>
        </div>
      </div>
    </div>
  </>;
};
