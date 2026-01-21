import React from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { updateThreeStats } from "../util/performance_profiler_metrics";

const SAMPLE_INTERVAL_MS = 500;

const nowMs = () =>
  typeof performance === "undefined" ? Date.now() : performance.now();

export const ThreeDPerformanceMonitor = () => {
  const { gl } = useThree();
  const lastSample = React.useRef(0);

  useFrame(() => {
    const now = nowMs();
    if (now - lastSample.current < SAMPLE_INTERVAL_MS) {
      return;
    }
    lastSample.current = now;
    const info = gl.info;
    const render = info.render || { calls: 0, triangles: 0, lines: 0, points: 0 };
    const memory = info.memory || { geometries: 0, textures: 0 };
    updateThreeStats({
      render: {
        calls: render.calls || 0,
        triangles: render.triangles || 0,
        lines: render.lines || 0,
        points: render.points || 0,
      },
      memory: {
        geometries: memory.geometries || 0,
        textures: memory.textures || 0,
        programs: info.programs ? info.programs.length : 0,
      },
    });
  });

  return null;
};
