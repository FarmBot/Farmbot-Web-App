import React from "react";
import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { Bounds, Center } from "@react-three/drei";
import { SceneObject } from "farmbot/dist/resources/api_resources";
import {
  DEFAULT_SCENE_OBJECT, SCENE_OBJECT_CATALOG_SCENES,
} from "../frontend/three_d_garden/scenes/scene_object_data";
import {
  SceneObjectPreview,
} from "../frontend/three_d_garden/scene_objects";
import { INITIAL } from "../frontend/three_d_garden/config";

const SCENES: Record<string, SceneObject[]> = {
  ...SCENE_OBJECT_CATALOG_SCENES,
};

const params = new URLSearchParams(window.location.search);
const scene = params.get("scene") || "custom";
const index = Number(params.get("index") || 0);
const rotation = Number(params.get("rotation") || 0) * Math.PI / 180;
const selected = scene == "custom"
  ? DEFAULT_SCENE_OBJECT
  : SCENES[scene]?.[index];

if (!selected) {
  throw new Error(`Unknown scene object: ${scene}/${index}`);
}

const previewObject: SceneObject = {
  ...selected,
  x_center: 0,
  y_center: 0,
  z_base: 0,
  x_origin: "world",
  y_origin: "world",
  z_origin: "world",
  rotation: 0,
};

const ThumbnailContent = () => {
  const [centerKey, setCenterKey] = React.useState(0);
  React.useEffect(() => {
    const timeout = window.setTimeout(() => setCenterKey(1), 100);
    return () => window.clearTimeout(timeout);
  }, []);

  return <>
    <color attach={"background"} args={["#f4f4f4"]} />
    <ambientLight intensity={1.5} />
    <directionalLight position={[4, 6, 5]} intensity={2} />
    <directionalLight position={[-4, 2, -3]} intensity={0.75} />
    <Bounds fit={true} clip={true} observe={true} margin={1.3}>
      <Center cacheKey={centerKey}>
        <group rotation={[0, 0, rotation]}>
          <SceneObjectPreview config={INITIAL} sceneObject={previewObject} />
        </group>
      </Center>
    </Bounds>
  </>;
};

const Thumbnail = () =>
  <Canvas
    dpr={1}
    camera={{ position: [4, 4, 4], fov: 35, up: [0, 0, 1] }}
    gl={{ antialias: true, preserveDrawingBuffer: true }}>
    <ThumbnailContent />
  </Canvas>;

createRoot(document.getElementById("root")!).render(<Thumbnail />);
