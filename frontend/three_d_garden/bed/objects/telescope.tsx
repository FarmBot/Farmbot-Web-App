import React from "react";
import { Cylinder } from "@react-three/drei";
import { animated, useSpring } from "@react-spring/three";
import { SpringValue } from "@react-spring/core";
import { ThreeEvent } from "@react-three/fiber";
import { Quaternion, Vector3 } from "three";
import { Config } from "../../config";
import { Group, MeshPhongMaterial } from "../../components";
import { SECTION_CLIPPING_EXEMPT } from "../../section";
import { Camera } from "../../zoom_beacons_constants";
import { setStargazingMode } from "../../../farm_designer/stargazing";
import { getUtilitiesPostWorldPosition } from "./utilities_post_position";
import { RenderOrder } from "../../constants";

const OFF_WHITE = "#f2efe6";
const BLACK = "#111111";
const UTILITIES_POST_HEIGHT = 300;
const BED_OUTER_DISTANCE_MULTIPLIER = 1.5;
const DEFAULT_TELESCOPE_TILT = -40 * Math.PI / 180;
const DEFAULT_TELESCOPE_HEADING = Math.PI;
const HIDDEN_DISTANCE = 1200;
const BODY_PIVOT_Z = 760;
const TRIPOD_TOP_BASE_Z = 470;
const CAMERA_LOCAL_X = -480;
const LENS_LOCAL_X = 466;
const TELESCOPE_RENDER_ORDER = RenderOrder.plants + 0.5;

type TelescopeConfig = Pick<Config,
  "animate" | "bedHeight" | "bedLengthOuter" | "bedWidthOuter"
  | "bedZOffset" | "legSize">;

const AnimatedMeshPhongMaterial = animated(MeshPhongMaterial);
const AnimatedGroup = animated(Group);

const telescopeBodyZ = (config: TelescopeConfig) =>
  BODY_PIVOT_Z + config.bedZOffset;

interface TelescopeMaterialProps {
  color: string;
  opacity: SpringValue<number>;
}

const TelescopeMaterial = (props: TelescopeMaterialProps) =>
  <AnimatedMeshPhongMaterial
    color={props.color}
    opacity={props.opacity}
    transparent={true}
    alphaTest={0.001}
    depthWrite={true} />;

interface TelescopeCylinderProps {
  name: string;
  radius: number;
  length: number;
  position: [number, number, number];
  opacity: SpringValue<number>;
  color?: string;
}

const TelescopeCylinder = (props: TelescopeCylinderProps) =>
  <Cylinder
    name={props.name}
    args={[props.radius, props.radius, props.length, 24]}
    position={props.position}
    rotation={[0, 0, -Math.PI / 2]}
    renderOrder={TELESCOPE_RENDER_ORDER}
    castShadow={true}
    receiveShadow={true}>
    <TelescopeMaterial
      color={props.color || OFF_WHITE}
      opacity={props.opacity} />
  </Cylinder>;

interface TripodLegProps {
  name: string;
  end: [number, number, number];
  opacity: SpringValue<number>;
}

const TripodLeg = (props: TripodLegProps) => {
  const start = new Vector3(0, 0, 420);
  const end = new Vector3(...props.end);
  const direction = end.clone().sub(start);
  const midpoint = start.clone().add(end).multiplyScalar(0.5);
  const quaternion = new Quaternion().setFromUnitVectors(
    new Vector3(0, 1, 0),
    direction.clone().normalize(),
  );
  return <Cylinder
    name={props.name}
    args={[18, 18, direction.length(), 16]}
    position={midpoint}
    quaternion={quaternion}
    renderOrder={TELESCOPE_RENDER_ORDER}
    castShadow={true}
    receiveShadow={true}>
    <TelescopeMaterial color={BLACK} opacity={props.opacity} />
  </Cylinder>;
};

export const getTelescopeGroundPosition = (
  config: TelescopeConfig,
): [number, number, number] => {
  const [x, , z] = getUtilitiesPostWorldPosition(config);
  const bedOuterX = config.bedLengthOuter / 2;
  return [
    bedOuterX + (x - bedOuterX) * BED_OUTER_DISTANCE_MULTIPLIER,
    0,
    z - UTILITIES_POST_HEIGHT / 2,
  ];
};

const telescopeBodyPoint = (
  config: TelescopeConfig,
  localX: number,
): [number, number, number] => {
  const [rootX, rootY, rootZ] = getTelescopeGroundPosition(config);
  const horizontalOffset = Math.cos(DEFAULT_TELESCOPE_TILT) * localX;
  return [
    rootX + Math.cos(DEFAULT_TELESCOPE_HEADING) * horizontalOffset,
    rootY + Math.sin(DEFAULT_TELESCOPE_HEADING) * horizontalOffset,
    rootZ + telescopeBodyZ(config)
      - Math.sin(DEFAULT_TELESCOPE_TILT) * localX,
  ];
};

export const getStargazingCamera = (config: TelescopeConfig): Camera => ({
  position: telescopeBodyPoint(config, CAMERA_LOCAL_X),
  target: telescopeBodyPoint(config, LENS_LOCAL_X),
});

export const getTelescopeRotation = (camera: Camera) => {
  const deltaX = camera.target[0] - camera.position[0];
  const deltaY = camera.target[1] - camera.position[1];
  const deltaZ = camera.target[2] - camera.position[2];
  const horizontalDistance = Math.hypot(deltaX, deltaY);
  if (horizontalDistance == 0 && deltaZ == 0) {
    return {
      heading: DEFAULT_TELESCOPE_HEADING,
      tilt: DEFAULT_TELESCOPE_TILT,
    };
  }
  return {
    heading: Math.atan2(deltaY, deltaX),
    tilt: -Math.atan2(deltaZ, horizontalDistance),
  };
};

export interface TelescopeProps {
  config: TelescopeConfig;
  sunBelowHorizon: boolean;
  stargazing: boolean;
  camera: Camera;
  dispatch: Function | undefined;
}

export const Telescope = (props: TelescopeProps) => {
  const { config, dispatch, sunBelowHorizon, stargazing } = props;
  const visible = sunBelowHorizon && !stargazing;
  const groundPosition = getTelescopeGroundPosition(config);
  const bodyZ = telescopeBodyZ(config);
  const tripodTopLength = bodyZ - TRIPOD_TOP_BASE_Z;
  const rotation = getTelescopeRotation(props.camera);
  const [spring] = useSpring(() => ({
    hideOffset: sunBelowHorizon ? 0 : -HIDDEN_DISTANCE,
    opacity: visible ? 1 : 0,
    heading: rotation.heading,
    tilt: rotation.tilt,
    immediate: !config.animate,
    config: { tension: 120, friction: 20 },
  }), [
    config.animate,
    sunBelowHorizon,
    rotation.heading,
    rotation.tilt,
    visible,
  ]);
  const openStargazing = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (visible) {
      dispatch?.(setStargazingMode(true));
    }
  };

  return <Group
    name={"telescope"}
    position-x={groundPosition[0]}
    position-y={groundPosition[1]}
    position-z={groundPosition[2]}
    userData={{ [SECTION_CLIPPING_EXEMPT]: true }}
    onClick={openStargazing}>
    <AnimatedGroup
      name={"visibility-offset"}
      position-z={spring.hideOffset}>
      <TripodLeg name={"telescope-tripod-leg-1"}
        end={[260, 0, 12]} opacity={spring.opacity} />
      <TripodLeg name={"telescope-tripod-leg-2"}
        end={[-130, 225, 12]} opacity={spring.opacity} />
      <TripodLeg name={"telescope-tripod-leg-3"}
        end={[-130, -225, 12]} opacity={spring.opacity} />
      <Cylinder
        name={"telescope-tripod-middle"}
        args={[60, 60, 50, 24]}
        position={[0, 0, 445]}
        rotation={[Math.PI / 2, 0, 0]}
        renderOrder={TELESCOPE_RENDER_ORDER}
        castShadow={true}
        receiveShadow={true}>
        <TelescopeMaterial color={BLACK} opacity={spring.opacity} />
      </Cylinder>
      <Cylinder
        name={"telescope-tripod-top"}
        args={[30, 30, tripodTopLength, 24]}
        position={[0, 0, TRIPOD_TOP_BASE_Z + tripodTopLength / 2]}
        rotation={[Math.PI / 2, 0, 0]}
        renderOrder={TELESCOPE_RENDER_ORDER}
        castShadow={true}
        receiveShadow={true}>
        <TelescopeMaterial color={BLACK} opacity={spring.opacity} />
      </Cylinder>
      <AnimatedGroup
        name={"telescope-body"}
        position={[0, 0, bodyZ]}
        rotation-z={spring.heading}>
        <AnimatedGroup
          name={"telescope-body-tilt"}
          rotation-y={spring.tilt}>
          <TelescopeCylinder name={"telescope-body-narrow"}
            radius={35} length={240} position={[-280, 0, 0]}
            opacity={spring.opacity} />
          <TelescopeCylinder name={"telescope-body-middle"}
            radius={50} length={320} position={[0, 0, 0]}
            opacity={spring.opacity} />
          <TelescopeCylinder name={"telescope-body-wide"}
            radius={70} length={300} position={[310, 0, 0]}
            opacity={spring.opacity} />
          <TelescopeCylinder name={"telescope-eyepiece"}
            radius={22} length={35} position={[-435, 0, 0]}
            color={BLACK} opacity={spring.opacity} />
          <TelescopeCylinder name={"telescope-lens"}
            radius={64} length={3} position={[LENS_LOCAL_X, 0, 0]}
            color={BLACK} opacity={spring.opacity} />
        </AnimatedGroup>
      </AnimatedGroup>
    </AnimatedGroup>
  </Group>;
};
