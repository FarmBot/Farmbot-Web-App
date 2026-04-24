import React from "react";

export interface PerfStore {
  startedAt: number;
  marks: Record<string, number[]>;
  counts: Record<string, number>;
  samples: Record<string, number[]>;
}

const PERF_FLAG = "FB_PERF_BENCHMARK";

const hasWindow = () => typeof window !== "undefined";

export const perfEnabled = () => {
  if (!hasWindow()) { return false; }
  const params = new URLSearchParams(window.location.search);
  return params.get("fb_perf") == "1"
    || window.localStorage.getItem(PERF_FLAG) == "true";
};

const emptyStore = (): PerfStore => ({
  startedAt: performance.now(),
  marks: {},
  counts: {},
  samples: {},
});

export const perfStore = (): PerfStore | undefined => {
  if (!perfEnabled()) { return undefined; }
  window.__fbPerf ||= emptyStore();
  return window.__fbPerf;
};

export const perfMark = (name: string) => {
  const store = perfStore();
  if (!store) { return; }
  store.marks[name] ||= [];
  store.marks[name].push(performance.now() - store.startedAt);
};

export const perfCount = (name: string, by = 1) => {
  const store = perfStore();
  if (!store) { return; }
  store.counts[name] = (store.counts[name] || 0) + by;
};

export const perfSample = (name: string, value: number) => {
  const store = perfStore();
  if (!store) { return; }
  store.samples[name] ||= [];
  store.samples[name].push(value);
};

export const usePerfRenderCount = (name: string) => {
  perfCount(`render.${name}`);
};

export const PerfMark = ({ name }: { name: string }) => {
  React.useEffect(() => {
    perfMark(name);
  }, [name]);
  return undefined;
};
