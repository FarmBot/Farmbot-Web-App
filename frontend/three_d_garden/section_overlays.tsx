import React from "react";
import { useTexture } from "@react-three/drei";
import { DoubleSide } from "three";
import { Config, PositionConfig } from "./config";
import {
  Group, Mesh, MeshBasicMaterial, MeshPhongMaterial, PlaneGeometry,
} from "./components";
import { getColorFromBrightness } from "./helpers";
import { getBotKinematics } from "./bot/kinematics";
import { getBotVersion } from "./bot/bot_versions";
import { EXTRUSION_WIDTH, UTM_RADIUS } from "./bot/assemblies/constants";
import { SECTION_CLIPPING_EXEMPT } from "./section";
import { getBedTextureRepeat, TexturedBedMaterial } from "./bed";
import { ASSETS } from "./constants";

export const SECTION_BED_BOTTOM_OFFSET = 2.5;
export const SECTION_SOIL_BOTTOM_OFFSET = 5;
export const SECTION_GHOST_Z_OFFSET = 5;
export const SECTION_GHOST_OPACITY = 0.5;

type Point = [number, number, number];

export interface SectionOverlayLayout {
  bedZ: number;
  soilZ: number;
  bedSize: [number, number];
  soilSize: [number, number];
  gantryPosition: Point;
  utmPosition: Point;
}

export const getSectionOverlayLayout = (
  config: Config,
  configPosition: PositionConfig,
): SectionOverlayLayout => {
  const bottomZ = -config.bedHeight;
  const bedZ = bottomZ + SECTION_BED_BOTTOM_OFFSET;
  const soilZ = bottomZ + SECTION_SOIL_BOTTOM_OFFSET;
  const ghostZ = soilZ + SECTION_GHOST_Z_OFFSET;
  const kinematics = getBotKinematics(config, configPosition);
  const version = getBotVersion(config.kitVersion);
  const gantryPosition: Point = [
    kinematics.machineOrigin[0]
      + kinematics.gantryPosition[0]
      - 39
      + EXTRUSION_WIDTH / 2,
    kinematics.machineOrigin[1]
      + kinematics.gantryPosition[1]
      + config.beamLength / 2
      - version.beamEndOffset,
    ghostZ,
  ];
  const utmPosition: Point = [
    kinematics.anchors.utm.worldPosition[0],
    kinematics.anchors.utm.worldPosition[1],
    ghostZ,
  ];
  return {
    bedZ,
    soilZ,
    bedSize: [config.bedLengthOuter, config.bedWidthOuter],
    soilSize: [
      config.bedLengthOuter - 2 * config.bedWallThickness,
      config.bedWidthOuter - 2 * config.bedWallThickness,
    ],
    gantryPosition,
    utmPosition,
  };
};

export interface SectionGroundOverlaysProps {
  config: Config;
  configPosition: PositionConfig;
  sectionOpacity: number;
}

const noRaycast = () => undefined;

export const SectionGroundOverlays = (
  props: SectionGroundOverlaysProps,
) => {
  const { config } = props;
  const layout = getSectionOverlayLayout(config, props.configPosition);
  const bedColor = getColorFromBrightness(config.bedBrightness);
  const soilColor = getColorFromBrightness(config.soilBrightness);
  const soilTexture = useTexture(ASSETS.textures.soil + "?=soilT");
  const ghostOpacity = SECTION_GHOST_OPACITY * props.sectionOpacity;
  return <Group name={"section-ground-overlays"}
    userData={{ [SECTION_CLIPPING_EXEMPT]: true }}>
    <Mesh
      name={"section-bed-ground-rectangle"}
      position={[0, 0, layout.bedZ]}
      receiveShadow={true}
      raycast={noRaycast}>
      <PlaneGeometry args={layout.bedSize} />
      <TexturedBedMaterial
        bedColor={bedColor}
        repeat={getBedTextureRepeat(layout.bedSize)} />
    </Mesh>
    <Mesh
      name={"section-soil-ground-rectangle"}
      position={[0, 0, layout.soilZ]}
      renderOrder={1}
      receiveShadow={true}
      raycast={noRaycast}>
      <PlaneGeometry args={layout.soilSize} />
      <MeshPhongMaterial
        map={soilTexture}
        color={soilColor}
        side={DoubleSide}
        shininess={0}
        polygonOffset={true}
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1} />
    </Mesh>
    <Mesh
      name={"section-gantry-ground-projection"}
      position={layout.gantryPosition}
      raycast={noRaycast}>
      <PlaneGeometry args={[EXTRUSION_WIDTH, config.beamLength]} />
      <MeshBasicMaterial
        color={"white"}
        transparent={true}
        opacity={ghostOpacity}
        depthWrite={false}
        side={DoubleSide} />
    </Mesh>
    <Mesh
      name={"section-utm-ground-projection"}
      position={layout.utmPosition}
      raycast={noRaycast}>
      <circleGeometry args={[UTM_RADIUS, 64]} />
      <MeshBasicMaterial
        color={"white"}
        transparent={true}
        opacity={ghostOpacity}
        depthWrite={false}
        side={DoubleSide} />
    </Mesh>
  </Group>;
};
