import { Cylinder, Extrude } from "@react-three/drei";
import React from "react";
import { threeSpace } from "../../helpers";
import { Group, MeshPhongMaterial, SpotLight } from "../../components";
import { Config } from "../../config";
import {
  DoubleSide, Shape, Texture, SpotLight as ThreeSpotLight, Vector3,
} from "three";
import { extrusionWidth } from "../bot";
import { useFrame } from "@react-three/fiber";
import { range } from "lodash";

export interface GantryBeamProps {
  config: Config;
  beamShape: Shape | undefined;
  aluminumTexture: Texture;
}

export const GantryBeam = (props: GantryBeamProps) => {
  const {
    beamLength, columnLength, bedXOffset, bedLengthOuter, bedWidthOuter,
  } = props.config;
  return <Group name={"gantry-beam"}
    position={[
      threeSpace(props.config.x - extrusionWidth - 8, bedLengthOuter) + bedXOffset,
      threeSpace((bedWidthOuter + beamLength) / 2, bedWidthOuter) - 50,
      columnLength + 40,
    ]}
    rotation={[Math.PI / 2, 0, 0]}>
    <Extrude name={"gantry-beam-extrusion"}
      castShadow={true}
      args={[
        props.beamShape,
        { steps: 1, depth: beamLength, bevelEnabled: false },
      ]}>
      <MeshPhongMaterial
        color={"white"}
        map={props.aluminumTexture}
        side={DoubleSide} />
    </Extrude>
    {props.config.light &&
      <LightStrip width={beamLength} />}
  </Group>;
};

interface LightStripProps {
  width: number;
}

const LightStrip = (props: LightStripProps) => {
  return <Group name={"gantry-beam-light-strip"} position={[10, 0, 0]}>
    {range(0, props.width, 300).map(i =>
      <Light key={i} i={i} />)}
    <Cylinder
      args={[7, 7, props.width]}
      position={[0, 0, props.width / 2]}
      rotation={[-Math.PI / 2, 0, 0]}>
      <MeshPhongMaterial
        color={"white"}
        shininess={200}
        specular={"white"}
        emissive={"white"}
        emissiveIntensity={2} />
    </Cylinder>
  </Group>;
};

const Light = ({ i }: { i: number }) => {
  // eslint-disable-next-line no-null/no-null
  const lightRef = React.useRef<ThreeSpotLight>(null!);
  const worldPosRef = React.useRef<Vector3>(new Vector3());
  const targetPosRef = React.useRef<Vector3>(new Vector3());
  const downVector = React.useMemo(() => new Vector3(0, 0, -1), []);
  useFrame(() => {
    if (lightRef.current) {
      const light = lightRef.current;
      const worldPos = worldPosRef.current;
      const targetPos = targetPosRef.current;
      light.getWorldPosition(worldPos);
      targetPos.copy(worldPos).add(downVector);
      light.target.position.copy(targetPos);
      light.target.updateMatrixWorld();
    }
  });
  return <SpotLight
    ref={lightRef}
    position={[0, 0, i]}
    intensity={2}
    distance={0}
    decay={0}
    angle={Math.PI / 6}
    castShadow={true} />;
};
