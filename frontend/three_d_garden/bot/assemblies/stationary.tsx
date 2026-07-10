import React from "react";
import * as THREE from "three";
import { Extrude, useGLTF } from "@react-three/drei";
import { DoubleSide, RepeatWrapping, Shape } from "three";
import type { GLTF } from "three-stdlib";
import { Config } from "../../config";
import { ASSETS, LIB_DIR, PartName } from "../../constants";
import { Group, Mesh, MeshPhongMaterial } from "../../components";
import { useTextureVariant } from "../../texture_variants";
import {
  PowerSupplyHardware, powerSupplyHardwarePropsEqual,
} from "../components";
import {
  EXTRUSION_WIDTH, X_TRACK_PADDING, machineOuterY,
} from "./constants";

type BeltClip = GLTF & {
  nodes: { [PartName.beltClip]: THREE.Mesh };
  materials: never;
}

export interface StationaryAssemblyProps {
  config: Config;
  trackShape: Shape | undefined;
}

const StationaryAssemblyBase = (props: StationaryAssemblyProps) => {
  const { config } = props;
  const { bedWidthOuter, botSizeX, tracks } = config;
  const beltClip = useGLTF(
    ASSETS.models.beltClip,
    LIB_DIR,
  ) as unknown as BeltClip;
  const aluminumTexture = useTextureVariant(ASSETS.textures.aluminum, {
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping,
    repeat: [0.01, 0.0003],
  });
  return <Group name={"bot-static-hardware"}>
    <PowerSupplyHardware config={config} />
    {[0 - EXTRUSION_WIDTH, bedWidthOuter].map((outerY, index) => {
      const bedColumnYOffset =
        (tracks ? 0 : EXTRUSION_WIDTH) * (index == 0 ? 1 : -1);
      const stopY = machineOuterY(
        config,
        outerY + 10 + bedColumnYOffset,
      );
      return <Group key={outerY}>
        {tracks && <Extrude name={"tracks"}
          castShadow={true}
          args={[
            props.trackShape,
            {
              steps: 1,
              depth: botSizeX + X_TRACK_PADDING,
              bevelEnabled: false,
            },
          ]}
          position={[
            index == 0
              ? botSizeX + X_TRACK_PADDING / 2 - 10
              : -X_TRACK_PADDING / 2 - 10,
            machineOuterY(
              config,
              outerY + (index == 0 ? 2.5 : 17.5),
            ),
            2,
          ]}
          rotation={[
            -Math.PI / 2,
            index == 0 ? -Math.PI / 2 : Math.PI / 2,
            0,
          ]}>
          <MeshPhongMaterial
            color={"white"}
            map={aluminumTexture}
            side={DoubleSide} />
        </Extrude>}
        <Mesh name={"xStopMin"}
          position={[-143, stopY, 2 + (index == 0 ? 0 : 5)]}
          rotation={[
            0,
            index == 0 ? 0 : Math.PI,
            (index == 0 ? 1 : -1) * Math.PI / 2,
          ]}
          scale={1000}
          geometry={beltClip.nodes[PartName.beltClip].geometry}>
          <MeshPhongMaterial color={"silver"} />
        </Mesh>
        <Mesh name={"xStopMax"}
          position={[
            botSizeX - 16 + X_TRACK_PADDING / 2,
            stopY,
            2 + (index == 0 ? 5 : 0),
          ]}
          rotation={[
            0,
            index == 0 ? Math.PI : 0,
            (index == 0 ? 1 : -1) * Math.PI / 2,
          ]}
          scale={1000}
          geometry={beltClip.nodes[PartName.beltClip].geometry}>
          <MeshPhongMaterial color={"silver"} />
        </Mesh>
      </Group>;
    })}
  </Group>;
};

const STATIONARY_CONFIG_FIELDS: (keyof Config)[] = [
  "bedWidthOuter",
  "bedYOffset",
  "botSizeX",
  "tracks",
];

export const StationaryAssembly = React.memo(
  StationaryAssemblyBase,
  (prev, next) =>
    prev.trackShape === next.trackShape &&
    powerSupplyHardwarePropsEqual(prev, next) &&
    STATIONARY_CONFIG_FIELDS.every(field =>
      prev.config[field] === next.config[field]),
);
