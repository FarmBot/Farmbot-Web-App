import { Cylinder, Extrude, useHelper } from "@react-three/drei";
import React from "react";
import { threeSpace } from "../../helpers";
import { Group, MeshPhongMaterial, SpotLight } from "../../components";
import { Config } from "../../config";
import {
  DoubleSide,
  ExtrudeGeometryOptions,
  Shape,
  SpotLightHelper,
  Texture,
  SpotLight as ThreeSpotLight,
  Vector3,
} from "three";
import { extrusionWidth } from "../bot";
import { range } from "lodash";

export interface GantryBeamProps {
  config: Config;
  beamShape: Shape | undefined;
  aluminumTexture: Texture;
}

export const GantryBeam = React.memo((props: GantryBeamProps) => {
  const {
    beamLength, columnLength, bedXOffset, bedLengthOuter, bedWidthOuter,
  } = props.config;
  const beamPosition = React.useMemo<[number, number, number]>(() => ([
    threeSpace(props.config.x - extrusionWidth - 8, bedLengthOuter) + bedXOffset,
    threeSpace((bedWidthOuter + beamLength) / 2, bedWidthOuter) - 50,
    columnLength + 40,
  ]), [
    bedLengthOuter,
    bedWidthOuter,
    beamLength,
    bedXOffset,
    columnLength,
    props.config.x,
  ]);
  const beamRotation = React.useMemo<[number, number, number]>(
    () => [Math.PI / 2, 0, 0], []);
  const extrusionArgs = React.useMemo<
    [Shape | undefined, ExtrudeGeometryOptions]
  >(() => [
    props.beamShape,
    { steps: 1, depth: beamLength, bevelEnabled: false },
  ], [props.beamShape, beamLength]);
  return <Group name={"gantry-beam"}
    position={beamPosition}
    rotation={beamRotation}>
    <Extrude name={"gantry-beam-extrusion"}
      castShadow={true}
      args={extrusionArgs}>
      <MeshPhongMaterial
        color={"white"}
        map={props.aluminumTexture}
        side={DoubleSide} />
    </Extrude>
    {props.config.light &&
      <LightStrip
        width={beamLength}
        debug={props.config.lightsDebug}
        ledsUnderBeam={ledsUnderBeam(props.config.kitVersion)} />}
  </Group>;
});

const ledsUnderBeam = (kitVersion: string): boolean => {
  switch (kitVersion) {
    case "v1.7":
      return true;
    case "v1.8":
    default:
      return false;
  }
};

interface LightStripProps {
  width: number;
  debug: boolean;
  ledsUnderBeam: boolean;
}

const LightStrip = (props: LightStripProps) => {
  const MAX_LIGHTS = 3;
  const MIN_SPACING = 1000;
  const stripPosition = React.useMemo<[number, number, number]>(
    () => [10, 0, 0], []);
  const lightCount = React.useMemo(() => {
    if (props.width <= 0) {
      return 0;
    }
    return Math.min(MAX_LIGHTS, Math.ceil(props.width / MIN_SPACING));
  }, [props.width]);
  const yOffsets = React.useMemo(() => {
    if (lightCount === 0) {
      return [];
    }
    const spacing = props.width / lightCount;
    return range(lightCount).map(index => spacing * (index + 0.5));
  }, [lightCount, props.width]);
  const ledArgs = React.useMemo<[number, number, number]>(
    () => [7, 7, props.width - 2], [props.width]);
  const ledPosition = React.useMemo<[number, number, number]>(
    () => [0, 0, props.width / 2 - 1], [props.width]);
  const ledRotation = React.useMemo<[number, number, number]>(
    () => [-Math.PI / 2, 0, 0], []);
  return <Group name={"gantry-beam-light-strip"} position={stripPosition}>
    {yOffsets.map(yOffset =>
      <Light
        key={yOffset}
        yOffset={yOffset}
        debug={props.debug}
        castShadow={false} />)}
    {props.ledsUnderBeam && <Cylinder
      name={"gantry-beam-leds"}
      args={ledArgs}
      position={ledPosition}
      rotation={ledRotation}>
      <MeshPhongMaterial color={"white"} {...EMISSIVE_PROPS} />
    </Cylinder>}
  </Group>;
};

export const EMISSIVE_PROPS = {
  specular: "white",
  emissive: "white",
  emissiveIntensity: 2,
  shininess: 200,
};

interface LightProps {
  yOffset: number;
  debug: boolean;
  castShadow: boolean;
}

const Light = (props: LightProps) => {
  // eslint-disable-next-line no-null/no-null
  const lightRef = React.useRef<ThreeSpotLight>(null!);
  useHelper(props.debug ? lightRef : undefined, SpotLightHelper, "white");
  const worldPosRef = React.useRef<Vector3>(new Vector3());
  const targetPosRef = React.useRef<Vector3>(new Vector3());
  const downVector = React.useMemo(() => new Vector3(0, 0, -1), []);
  React.useLayoutEffect(() => {
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
    position={[0, 0, props.yOffset]}
    intensity={1.5}
    distance={10000}
    decay={0}
    angle={Math.PI / 4}
    penumbra={0.3}
    castShadow={props.castShadow} />;
};
