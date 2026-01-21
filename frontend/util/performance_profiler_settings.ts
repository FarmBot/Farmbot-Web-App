export const PERFORMANCE_PROFILER_KEY = "fb_perf_profiler";
const PERF_QUERY_KEY = "perf";

export const shouldEnableProfiler = () => {
  if (typeof window === "undefined") {
    return false;
  }
  const params = new URLSearchParams(window.location.search);
  if (params.has(PERF_QUERY_KEY)) {
    const value = params.get(PERF_QUERY_KEY);
    return value !== "0" && value !== "false";
  }
  try {
    return localStorage.getItem(PERFORMANCE_PROFILER_KEY) === "true";
  } catch {
    return false;
  }
};
