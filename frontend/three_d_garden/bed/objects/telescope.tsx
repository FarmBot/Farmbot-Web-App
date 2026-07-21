import React from "react";
import { Cylinder, Sphere } from "@react-three/drei";
import { animated, useSpring } from "@react-spring/three";
import { SpringValue } from "@react-spring/core";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import {
  BufferAttribute as ThreeBufferAttribute,
  BufferGeometry as ThreeBufferGeometry,
  Group as ThreeGroup, Quaternion, Vector3,
  WebGLProgramParametersWithUniforms,
} from "three";
import { Config } from "../../config";
import {
  Group, MeshBasicMaterial, MeshPhongMaterial, Points, PointsMaterial,
} from "../../components";
import { SECTION_CLIPPING_EXEMPT } from "../../section";
import { Camera } from "../../zoom_beacons_constants";
import { setStargazingMode } from "../../../farm_designer/stargazing";
import { getUtilitiesPostWorldPosition } from "./utilities_post_position";
import { RenderOrder } from "../../constants";
import { t } from "../../../i18next_wrapper";
import {
  ControlHandle, ControlPointerEvent, ThreeDPopup,
} from "../../controls";

const OFF_WHITE = "#f2efe6";
const BLACK = "#111111";
const UTILITIES_POST_HEIGHT = 300;
const BED_OUTER_DISTANCE_MULTIPLIER = 1.5;
const DEFAULT_TELESCOPE_TILT = -20 * Math.PI / 180;
const DEFAULT_TELESCOPE_HEADING = Math.PI;
const BODY_PIVOT_LOCAL_X = 0;
const BODY_PIVOT_Z = 760;
const TRIPOD_TOP_BASE_Z = 470;
const EYEPIECE_LOCAL_X = -415;
const CAMERA_EYE_RELIEF = 45;
const CAMERA_LOCAL_X = EYEPIECE_LOCAL_X - CAMERA_EYE_RELIEF;
const LENS_LOCAL_X = 466;
const TELESCOPE_RENDER_ORDER = RenderOrder.plants + 0.5;
const TELESCOPE_SPHERE_RADIUS = 60;
const TELESCOPE_STAR_RADIUS = TELESCOPE_SPHERE_RADIUS + 0.5;
const TELESCOPE_STAR_COUNT = 150;
const TELESCOPE_STAR_MIN_SIZE = 0.5;
const TELESCOPE_STAR_SIZE_RANGE = 2.5;
const TELESCOPE_SPHERE_HEIGHT = 300;
const TELESCOPE_POPUP_OFFSET = 130;
const TELESCOPE_SPHERE_ROTATION_SPEED = Math.PI / 20;

export const generateTelescopeStars = (random = Math.random) => {
  const positions = new Float32Array(TELESCOPE_STAR_COUNT * 3);
  const sizes = new Float32Array(TELESCOPE_STAR_COUNT);
  for (let index = 0; index < TELESCOPE_STAR_COUNT; index++) {
    const z = 2 * random() - 1;
    const heading = 2 * Math.PI * random();
    const radialDistance = Math.sqrt(1 - z * z);
    const offset = index * 3;
    positions[offset] = TELESCOPE_STAR_RADIUS
      * radialDistance * Math.cos(heading);
    positions[offset + 1] = TELESCOPE_STAR_RADIUS
      * radialDistance * Math.sin(heading);
    positions[offset + 2] = TELESCOPE_STAR_RADIUS * z;
    sizes[index] = TELESCOPE_STAR_MIN_SIZE
      + random() * TELESCOPE_STAR_SIZE_RANGE;
  }
  return { positions, sizes };
};

const createTelescopeStarGeometry = () => {
  const { positions, sizes } = generateTelescopeStars();
  const geometry = new ThreeBufferGeometry();
  geometry.setAttribute(
    "position",
    new ThreeBufferAttribute(positions, 3),
  );
  geometry.setAttribute(
    "starSize",
    new ThreeBufferAttribute(sizes, 1),
  );
  return geometry;
};

const telescopeStarGeometry = createTelescopeStarGeometry();

export const telescopeStarShaderModification = (
  shader: WebGLProgramParametersWithUniforms,
) => {
  shader.vertexShader = shader.vertexShader
    .replace(
      "#include <common>",
      `#include <common>
       attribute float starSize;`,
    )
    .replace(
      "gl_PointSize = size;",
      "gl_PointSize = size * starSize;",
    );
};

export const telescopePopupZ = (sphereZ: number) =>
  sphereZ + TELESCOPE_POPUP_OFFSET;

export const rotateTelescopeSphere = (
  sphere: ThreeGroup | null,
  enabled: boolean,
  delta: number,
) => {
  const rotation = sphere?.rotation;
  if (enabled && rotation) {
    rotation.z += delta * TELESCOPE_SPHERE_ROTATION_SPEED;
  }
};

type TelescopeConfig = Pick<Config,
  "animate" | "bedHeight" | "bedLengthOuter" | "bedWidthOuter"
  | "bedZOffset" | "legSize">;

const AnimatedMeshPhongMaterial = animated(MeshPhongMaterial);
const AnimatedMeshBasicMaterial = animated(MeshBasicMaterial);
const AnimatedPointsMaterial = animated(PointsMaterial);
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

export const getStargazingCamera = (config: TelescopeConfig): Camera => {
  return {
    position: telescopeBodyPoint(config, CAMERA_LOCAL_X),
    target: telescopeBodyPoint(config, BODY_PIVOT_LOCAL_X),
  };
};

export type TelescopeState = "disabled" | "enabled";

export const getTelescopeState = (
  stargazing: boolean,
  enabledRequested: boolean,
): TelescopeState => {
  return enabledRequested && !stargazing ? "enabled" : "disabled";
};

interface TelescopeSpringValues {
  groupOffset: number;
  sphereOpacity: number;
  telescopeOpacity: number;
}

export const telescopeSpringTargets = (
  enabledRequested: boolean,
  stargazing: boolean,
  sphereZ: number,
  spaceflight = false,
): TelescopeSpringValues => ({
  groupOffset: enabledRequested || spaceflight ? 0 : -sphereZ,
  sphereOpacity: stargazing || spaceflight ? 0 : 1,
  telescopeOpacity:
    (enabledRequested || spaceflight) && !stargazing ? 1 : 0,
});

interface TelescopePopupProps {
  position: [number, number, number];
  onClose(): void;
}

const TelescopePopup = (props: TelescopePopupProps) =>
  <ThreeDPopup
    name={"telescope-popup"}
    position={props.position}
    title={t("Stargaze")}
    className={"telescope-popup half-gap"}
    contentClassName={"telescope-popup-content"}
    onClose={props.onClose}>
    <p>{t(
      "Click the telescope to see how many crop constellations you can find!",
    )}</p>
  </ThreeDPopup>;

export interface TelescopeProps {
  config: TelescopeConfig;
  sunIsSet: boolean | undefined;
  stargazing: boolean;
  spaceflight: boolean;
  dispatch: Function | undefined;
}

export const Telescope = (props: TelescopeProps) => {
  const { config, dispatch, spaceflight, stargazing, sunIsSet } = props;
  const celestialView = stargazing || spaceflight;
  const [enabledRequested, setEnabledRequested] = React.useState(false);
  const [popupOpen, setPopupOpen] = React.useState(false);
  // eslint-disable-next-line no-null/no-null
  const sphereRotationRef = React.useRef<ThreeGroup>(null);
  const state = getTelescopeState(
    stargazing,
    enabledRequested,
  );
  const groundPosition = getTelescopeGroundPosition(config);
  const bodyZ = telescopeBodyZ(config);
  const sphereZ = bodyZ + TELESCOPE_SPHERE_HEIGHT;
  const tripodTopLength = bodyZ - TRIPOD_TOP_BASE_Z;
  const targets = telescopeSpringTargets(
    enabledRequested,
    stargazing,
    sphereZ,
    spaceflight,
  );
  const [telescopeMounted, setTelescopeMounted] =
    React.useState(state == "enabled" || spaceflight);
  const [sphereMounted, setSphereMounted] = React.useState(!celestialView);
  const handleSpringRest = React.useCallback(() => {
    setTelescopeMounted(state == "enabled" || spaceflight);
    setSphereMounted(!celestialView);
  }, [celestialView, spaceflight, state]);
  const [spring] = useSpring(() => ({
    to: targets,
    immediate: !config.animate,
    config: { tension: 120, friction: 20 },
    onRest: handleSpringRest,
  }), [
    config.animate,
    handleSpringRest,
    targets.groupOffset,
    targets.sphereOpacity,
    targets.telescopeOpacity,
  ]);
  const showAtCurrentTime = !!sunIsSet || spaceflight;
  const renderTelescope = showAtCurrentTime
    && (spaceflight || state == "enabled" || telescopeMounted);
  const renderSphere = !!sunIsSet
    && (!celestialView || sphereMounted);
  useFrame((_frameState, delta) => {
    rotateTelescopeSphere(
      sphereRotationRef.current,
      state == "enabled",
      delta,
    );
  });
  const openStargazing = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (state == "enabled" && sunIsSet) {
      setPopupOpen(false);
      dispatch?.(setStargazingMode(true));
    }
  };
  const toggleTelescope = (event: ControlPointerEvent) => {
    event.stopPropagation();
    if (celestialView) { return; }
    const nextEnabled = state != "enabled";
    setEnabledRequested(nextEnabled);
    setPopupOpen(nextEnabled);
  };
  React.useEffect(() => {
    if (!popupOpen) { return; }
    const closePopup = (event: KeyboardEvent) => {
      if (event.key != "Escape") { return; }
      event.preventDefault();
      setPopupOpen(false);
    };
    window.addEventListener("keydown", closePopup, true);
    return () => window.removeEventListener("keydown", closePopup, true);
  }, [popupOpen]);

  return <Group
    name={"telescope"}
    position-x={groundPosition[0]}
    position-y={groundPosition[1]}
    position-z={groundPosition[2]}
    userData={{ [SECTION_CLIPPING_EXEMPT]: true }}>
    <AnimatedGroup
      name={"visibility-offset"}
      position-z={spring.groupOffset}>
      {renderSphere &&
        <Group name={"celestial-sphere-rotation"} ref={sphereRotationRef}>
          <ControlHandle
            name={"telescope-sphere-control"}
            enabled={!stargazing}
            onActivate={toggleTelescope}>
            <Sphere
              name={"telescope-sphere"}
              args={[TELESCOPE_SPHERE_RADIUS, 24, 24]}
              position={[0, 0, sphereZ]}
              renderOrder={TELESCOPE_RENDER_ORDER}>
              <AnimatedMeshBasicMaterial
                color={"#000000"}
                opacity={spring.sphereOpacity}
                transparent={true}
                depthWrite={true} />
            </Sphere>
            <Points
              name={"celestial-sphere-stars"}
              geometry={telescopeStarGeometry}
              position={[0, 0, sphereZ]}
              renderOrder={TELESCOPE_RENDER_ORDER + 0.01}
              // eslint-disable-next-line no-null/no-null
              dispose={null}>
              <AnimatedPointsMaterial
                color={"white"}
                opacity={spring.sphereOpacity}
                size={1}
                sizeAttenuation={true}
                transparent={true}
                onBeforeCompile={telescopeStarShaderModification}
                depthWrite={false} />
            </Points>
          </ControlHandle>
        </Group>}
      {popupOpen && !!sunIsSet && !celestialView &&
        <TelescopePopup
          position={[0, 0, telescopePopupZ(sphereZ)]}
          onClose={() => setPopupOpen(false)} />}
      {renderTelescope && <Group
        name={"telescope-model"}
        onClick={openStargazing}>
        <TripodLeg name={"telescope-tripod-leg-1"}
          end={[260, 0, 12]} opacity={spring.telescopeOpacity} />
        <TripodLeg name={"telescope-tripod-leg-2"}
          end={[-130, 225, 12]} opacity={spring.telescopeOpacity} />
        <TripodLeg name={"telescope-tripod-leg-3"}
          end={[-130, -225, 12]} opacity={spring.telescopeOpacity} />
        <Cylinder
          name={"telescope-tripod-middle"}
          args={[60, 60, 50, 24]}
          position={[0, 0, 445]}
          rotation={[Math.PI / 2, 0, 0]}
          renderOrder={TELESCOPE_RENDER_ORDER}
          castShadow={true}
          receiveShadow={true}>
          <TelescopeMaterial color={BLACK}
            opacity={spring.telescopeOpacity} />
        </Cylinder>
        <Cylinder
          name={"telescope-tripod-top"}
          args={[30, 30, tripodTopLength, 24]}
          position={[0, 0, TRIPOD_TOP_BASE_Z + tripodTopLength / 2]}
          rotation={[Math.PI / 2, 0, 0]}
          renderOrder={TELESCOPE_RENDER_ORDER}
          castShadow={true}
          receiveShadow={true}>
          <TelescopeMaterial color={BLACK}
            opacity={spring.telescopeOpacity} />
        </Cylinder>
        <Group
          name={"telescope-body"}
          position={[0, 0, bodyZ]}
          rotation-z={DEFAULT_TELESCOPE_HEADING}>
          <Group
            name={"telescope-body-tilt"}
            rotation-y={DEFAULT_TELESCOPE_TILT}>
            <TelescopeCylinder name={"telescope-body-narrow"}
              radius={35} length={240} position={[-280, 0, 0]}
              opacity={spring.telescopeOpacity} />
            <TelescopeCylinder name={"telescope-body-middle"}
              radius={50} length={320} position={[0, 0, 0]}
              opacity={spring.telescopeOpacity} />
            <TelescopeCylinder name={"telescope-body-wide"}
              radius={70} length={300} position={[310, 0, 0]}
              opacity={spring.telescopeOpacity} />
            <TelescopeCylinder name={"telescope-eyepiece"}
              radius={22} length={35} position={[EYEPIECE_LOCAL_X, 0, 0]}
              color={BLACK} opacity={spring.telescopeOpacity} />
            <TelescopeCylinder name={"telescope-lens"}
              radius={64} length={3} position={[LENS_LOCAL_X, 0, 0]}
              color={BLACK} opacity={spring.telescopeOpacity} />
          </Group>
        </Group>
      </Group>}
    </AnimatedGroup>
  </Group>;
};
