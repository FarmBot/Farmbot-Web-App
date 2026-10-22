import React from "react";
import { FirmwareHardware } from "farmbot";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import {
  DirectionalLight as ThreeDirectionalLight, Mesh as ThreeMesh,
  type MeshStandardMaterial, Object3D,
  PCFShadowMap,
} from "three";
import { ToolPulloutDirection, ToolType } from
  "farmbot/dist/resources/api_resources";
import { INITIAL } from "../three_d_garden/config";
import { ASSETS, LIB_DIR, PartName } from "../three_d_garden/constants";
import {
  AmbientLight, DirectionalLight, Group, Mesh,
} from "../three_d_garden/components";
import { ToolModel } from "../three_d_garden/bot/components/tools";
import { safePointerEvents } from "../three_d_garden/pointer_events";
import { ThreeDGuard } from "../three_d_garden/three_d_required_overlay";
import { kitVersionFromFirmware } from "../three_d_garden/bot/bot_versions";
import { useToolMaterials } from "../three_d_garden/bot/tool_hardware";
import { ToolPreviewCamera } from "./tool_preview_camera";

export interface ToolGraphic3DProps {
  firmwareHardware?: FirmwareHardware;
  toolName?: string;
  toolType: ToolType | undefined;
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
      position={[15, 9, 36]} scale={1000} rotation={[0, 0, 2.094]} />
  </Group>;
};

export const ToolGraphic3D = (props: ToolGraphic3DProps) => {
  const lightRef = React.useRef<ThreeDirectionalLight | undefined>(undefined);
  const interactive = props.mounted || props.profile;
  const margin = props.toolType == "seed_trough"
    ? 3
    : 1.2;
  const shadowMapSize = interactive
    ? 2048
    : 512;
  const kitVersion = kitVersionFromFirmware(props.firmwareHardware);
  const config = React.useMemo(() => ({ ...INITIAL, kitVersion }), [kitVersion]);
  return <div className={props.mounted
    ? "utm-and-mounted-tool-graphic tool-graphic-3d"
    : "tool-graphic-3d"}>
    <ThreeDGuard>
      <Canvas
        shadows={{ type: PCFShadowMap }}
        orthographic={true}
        camera={{
          position: [200, 0, 0], up: [0, 0, 1], zoom: 1,
        }}
        events={safePointerEvents}
        frameloop={"demand"}>
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
          <ToolPreviewCamera margin={margin}
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
              toolPulloutDirection={props.pulloutDirection
                ?? ToolPulloutDirection.NONE}
              inToolbay={!props.mounted}
              mounted={false}
              id={undefined} />
          </ToolPreviewCamera>
        </React.Suspense>
        {interactive && <OrbitControls enablePan={false} enableZoom={false} />}
      </Canvas>
    </ThreeDGuard>
  </div>;
};
