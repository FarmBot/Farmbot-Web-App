import React from "react";
import { useFrame, useThree } from "@react-three/fiber";

type SceneObject = {
  isMesh?: boolean;
  isInstancedMesh?: boolean;
  type?: string;
  name?: string;
};

interface Scene {
  traverse: (callback: (object: SceneObject) => void) => void;
}

interface SceneObjectCounts {
  total: number;
  meshes: number;
  instancedMeshes: number;
  typeCounts: Record<string, number>;
  nameCounts: Record<string, number>;
}

export const countSceneObjects = (scene: Scene): SceneObjectCounts => {
  const typeCounts: Record<string, number> = {};
  const nameCounts: Record<string, number> = {};
  let total = 0;
  let meshes = 0;
  let instancedMeshes = 0;
  scene.traverse(object => {
    total += 1;
    const type = object.type || "Unknown";
    typeCounts[type] = (typeCounts[type] || 0) + 1;
    if (object.name) {
      nameCounts[object.name] = (nameCounts[object.name] || 0) + 1;
    }
    if (object.isMesh) { meshes += 1; }
    if (object.isInstancedMesh) { instancedMeshes += 1; }
  });
  return {
    total,
    meshes,
    instancedMeshes,
    typeCounts,
    nameCounts,
  };
};

const formatTopCounts = (
  counts: Record<string, number>,
  limit: number,
) => {
  const entries = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  return entries.map(([key, value]) => `${key}: ${value}`).join(", ");
};

export const FPSProbe = () => {
  const frameCount = React.useRef(0);
  const lastTime = React.useRef<number | undefined>(undefined);
  const { gl, scene } = useThree();

  React.useEffect(() => {
    window.__fps = 0;
    return () => {
      delete window.__fps;
    };
  }, []);

  useFrame(() => {
    const now = performance.now();
    if (lastTime.current === undefined) {
      lastTime.current = now;
      return;
    }
    frameCount.current += 1;
    if (now - lastTime.current >= 1000) {
      const elapsed = (now - lastTime.current) / 1000;
      const fps = frameCount.current / elapsed;
      const { calls, triangles, points, lines } = gl.info.render;
      const { geometries, textures } = gl.info.memory;
      const sceneCounts = countSceneObjects(scene as Scene);
      window.__fps = fps;
      const linesToLogObj: Record<string, number | string> = {
        epoch: Date.now(),
        FPS: fps.toFixed(2),
        Calls: calls,
        Triangles: triangles,
        Points: points,
        Lines: lines,
        Geometries: geometries,
        Textures: textures,
        Objects: sceneCounts.total,
        Meshes: sceneCounts.meshes,
        "Instanced meshes": sceneCounts.instancedMeshes,
      };
      window.__scene_metrics = Object.values(linesToLogObj).join(", ");
      const topTypes = formatTopCounts(sceneCounts.typeCounts, 8);
      const topNames = formatTopCounts(sceneCounts.nameCounts, 8);
      linesToLogObj["Scene types"] = topTypes;
      linesToLogObj["Scene names"] = topNames;
      const linesToLog = Object.entries(linesToLogObj)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
      console.log(linesToLog);
      frameCount.current = 0;
      lastTime.current = now;
    }
  });

  return undefined;
};
