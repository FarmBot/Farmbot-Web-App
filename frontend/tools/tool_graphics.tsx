import React from "react";
import { FirmwareHardware } from "farmbot";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import {
  Box3, DirectionalLight as ThreeDirectionalLight, Mesh as ThreeMesh,
  type MeshStandardMaterial, Object3D,
  PCFShadowMap, Vector3,
} from "three";
import { ToolPulloutDirection, ToolType } from
  "farmbot/dist/resources/api_resources";
import { INITIAL } from "../three_d_garden/config";
import {
  ASSETS, LIB_DIR, PartName, UTM_PREVIEW_Z_OFFSET,
} from "../three_d_garden/constants";
import {
  AmbientLight, DirectionalLight, Group, Mesh,
} from "../three_d_garden/components";
import { ToolModel } from "../three_d_garden/bot/components/tools";
import { safePointerEvents } from "../three_d_garden/pointer_events";
import { ErrorBoundary } from "../error_boundary";
import { t } from "../i18next_wrapper";
import { kitVersionFromFirmware } from "../three_d_garden/bot/bot_versions";
import { useToolMaterials } from "../three_d_garden/bot/tool_hardware";
import { ToolPreviewCamera } from "./tool_preview_camera";

export interface ToolGraphic3DProps {
  firmwareHardware?: FirmwareHardware;
  toolName?: string;
  toolType: ToolType | undefined;
  utmMountable?: boolean;
  mounted?: boolean;
  profile?: boolean;
  pulloutDirection?: ToolPulloutDirection;
}

const configurePreviewShadows = (
  container: Object3D,
  radius: number,
  light: ThreeDirectionalLight,
) => {
  if (!Number.isFinite(radius) || radius < 0) { return; }
  container.traverse(object => {
    if (object instanceof ThreeMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  const extent = Math.max(1, radius * 1.05);
  const distance = light.position.length();
  const camera = light.shadow.camera;
  camera.left = -extent;
  camera.right = extent;
  camera.top = extent;
  camera.bottom = -extent;
  camera.near = Math.max(0.1, distance - extent);
  camera.far = distance + extent;
  camera.updateProjectionMatrix();
  light.shadow.autoUpdate = false;
  light.shadow.needsUpdate = true;
};

export const MountedToolUTM = (props: { kitVersion: string }) => {
  const model = useGLTF(ASSETS.models.utm, LIB_DIR) as unknown as GLTF & {
    nodes: { [PartName.utm]: ThreeMesh };
    materials: { PaletteMaterial001: MeshStandardMaterial };
  };
  const { material } = useToolMaterials(
    model.materials.PaletteMaterial001,
    props.kitVersion, "utm");
  return <Group rotation={[0, 0, Math.PI / 2]}>
    <Mesh geometry={model.nodes[PartName.utm].geometry}
      material={material}
      position={[-11, -6, 17]}
      scale={1000}
      rotation={[Math.PI, 0, -2.094]} />
  </Group>;
};

export const toolPreviewAvailable = () => {
  try {
    const context = document.createElement("canvas").getContext("webgl2");
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!context;
  } catch {
    return false;
  }
};

export const ToolPreviewUnavailable = () =>
  <p className="tool-preview-unavailable" role="status">
    {t("3D graphics unavailable")}
  </p>;

const MOUNTED_TOOL_TARGET = new Vector3(0, 0, UTM_PREVIEW_Z_OFFSET);
const MOUNTED_TOOL_BOUNDS = new Box3().setFromCenterAndSize(
  MOUNTED_TOOL_TARGET, new Vector3(180, 128, 144));

export const ToolGraphicScene = (props: ToolGraphic3DProps & {
  orbitTarget?: HTMLElement;
  viewportSize?: { width: number; height: number };
}) => {
  const lightRef = React.useRef<ThreeDirectionalLight | undefined>(undefined);
  const interactive = props.mounted || props.profile;
  const margin = !props.mounted && props.toolType == "seed_trough"
    ? 3
    : 1.2;
  const shadowMapSize = interactive
    ? 2048
    : 512;
  const kitVersion = kitVersionFromFirmware(props.firmwareHardware);
  const config = React.useMemo(() => ({ ...INITIAL, kitVersion }), [kitVersion]);
  return <>
    <AmbientLight intensity={1} />
    <DirectionalLight ref={lightRef}
      position={[300, -200, 700]} intensity={2}
      castShadow={true}
      shadow-autoUpdate={false}
      shadow-mapSize-width={shadowMapSize}
      shadow-mapSize-height={shadowMapSize}
      shadow-bias={-0.00001}
      shadow-normalBias={0.01} />
    <DirectionalLight position={[10, 10, -400]} intensity={1}
      castShadow={false} />
    <React.Suspense fallback={undefined}>
      <ToolPreviewCamera margin={margin} viewportSize={props.viewportSize}
        fixedBounds={props.mounted ? MOUNTED_TOOL_BOUNDS : undefined}
        onCentered={({ container, boundingSphere }) => {
          if (lightRef.current) {
            configurePreviewShadows(
              container, boundingSphere.radius, lightRef.current);
          }
        }}>
        {props.mounted && <MountedToolUTM kitVersion={kitVersion} />}
        <ToolModel
          config={config}
          position={{ x: 0, y: 0, z: 0 }}
          toolName={props.toolName}
          toolType={props.toolType}
          utmMountable={props.utmMountable}
          toolPulloutDirection={props.pulloutDirection
            ?? ToolPulloutDirection.NONE}
          inToolbay={!props.mounted}
          mounted={false}
          id={undefined} />
      </ToolPreviewCamera>
    </React.Suspense>
    {interactive && <OrbitControls
      domElement={props.orbitTarget}
      target={props.mounted ? MOUNTED_TOOL_TARGET : undefined}
      enablePan={false} enableZoom={false} />}
  </>;
};

export const ToolGraphic3D = (props: ToolGraphic3DProps) => {
  const [available] = React.useState(toolPreviewAvailable);
  const z = props.mounted ? UTM_PREVIEW_Z_OFFSET : 0;
  return <div className="tool-graphic-3d">
    <ErrorBoundary fallback={<ToolPreviewUnavailable />}>
      {available
        ? <Canvas
          shadows={{ type: PCFShadowMap }}
          orthographic={true}
          camera={{ position: [200, 0, z], up: [0, 0, 1], zoom: 1 }}
          events={safePointerEvents}
          frameloop="demand">
          <ToolGraphicScene {...props} />
        </Canvas>
        : <ToolPreviewUnavailable />}
    </ErrorBoundary>
  </div>;
};
