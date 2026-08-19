import { Cylinder, Extrude, useHelper } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import React from "react";
import { get3DPositionNoMirrorFunc } from "../../helpers";
import { Group, MeshPhongMaterial, SpotLight } from "../../components";
import { Config, PositionConfig } from "../../config";
import {
  DoubleSide, Shape, SpotLightHelper, Texture, SpotLight as ThreeSpotLight, Vector3,
} from "three";
import { range } from "lodash";
import { getBotVersion } from "../bot_versions";
import {
  ThreeDObjectHoverHandler, ThreeDObjectSelectionHandler,
} from "../../selection_types";
import { clickWasDragged } from "../../click_event";
import { HOVER_OBJECT_MODES } from "../../constants";
import { Mode } from "../../../farm_designer/map/interfaces";
import { getMode } from "../../../farm_designer/map/util";
import { Highlight } from "../../elements";

export interface GantryBeamProps {
  config: Config;
  configPosition: PositionConfig;
  beamShape: Shape | undefined;
  aluminumTexture: Texture;
  local?: boolean;
  onSelectObject?: ThreeDObjectSelectionHandler;
  onHoverObject?: ThreeDObjectHoverHandler;
}

const gantryBeamPropsEqual = (
  prevProps: GantryBeamProps,
  nextProps: GantryBeamProps,
  // eslint-disable-next-line complexity
): boolean => {
  const prevConfig = prevProps.config;
  const nextConfig = nextProps.config;
  return prevProps.configPosition.x == nextProps.configPosition.x
    && prevProps.beamShape == nextProps.beamShape
    && prevProps.aluminumTexture == nextProps.aluminumTexture
    && prevProps.local == nextProps.local
    && prevProps.onSelectObject == nextProps.onSelectObject
    && prevProps.onHoverObject == nextProps.onHoverObject
    && prevConfig.beamLength == nextConfig.beamLength
    && prevConfig.columnLength == nextConfig.columnLength
    && prevConfig.bedYOffset == nextConfig.bedYOffset
    && prevConfig.bedWidthOuter == nextConfig.bedWidthOuter
    && prevConfig.bedXOffset == nextConfig.bedXOffset
    && prevConfig.bedLengthOuter == nextConfig.bedLengthOuter
    && prevConfig.light == nextConfig.light
    && prevConfig.lightsDebug == nextConfig.lightsDebug
    && prevConfig.kitVersion == nextConfig.kitVersion;
};

const GantryBeamComponent = (props: GantryBeamProps) => {
  const {
    beamLength, columnLength, kitVersion,
  } = props.config;
  const { x } = props.configPosition;
  const version = getBotVersion(kitVersion);
  const get3DPosition = get3DPositionNoMirrorFunc(props.config);
  const position = props.local
    ? { x: -39, y: beamLength - version.beamEndOffset }
    : get3DPosition({
      x: x - 39,
      y: beamLength - version.beamEndOffset,
    });
  const { onSelectObject, onHoverObject } = props;
  const selectBeam = React.useCallback((event: ThreeEvent<MouseEvent>) => {
    if (clickWasDragged(event)
      || [...HOVER_OBJECT_MODES, Mode.cameraSelection].includes(getMode())) {
      return;
    }
    if (onSelectObject) {
      onSelectObject({ kind: "gantryBeam", id: 0 }) !== false
        && event.stopPropagation?.();
    }
  }, [onSelectObject]);
  const hoverBeam = React.useCallback((
    hovered: boolean,
    event: ThreeEvent<PointerEvent>,
  ) => {
    event.stopPropagation?.();
    onHoverObject?.(hovered);
  }, [onHoverObject]);
  return <Highlight highlightName={"gantry-beam"}>
    <Group name={"gantry-beam"}
      onClick={selectBeam}
      onPointerOver={event => hoverBeam(true, event)}
      onPointerOut={event => hoverBeam(false, event)}
      position={[
        position.x,
        position.y,
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
        <LightStrip
          width={beamLength}
          debug={props.config.lightsDebug}
          ledsUnderBeam={version.ledsUnderBeam} />}
    </Group>
  </Highlight>;
};

export const GantryBeam = React.memo(GantryBeamComponent,
  gantryBeamPropsEqual);

interface LightStripProps {
  width: number;
  debug: boolean;
  ledsUnderBeam: boolean;
}

const LightStrip = (props: LightStripProps) => {
  const SPACING = 300;
  return <Group name={"gantry-beam-light-strip"} position={[10, 0, 0]}>
    {range(0, props.width, SPACING).map(yOffset =>
      <Light key={yOffset} yOffset={yOffset + SPACING / 2} debug={props.debug} />)}
    {props.ledsUnderBeam && <Cylinder
      args={[7, 7, props.width - 2]}
      position={[0, 0, props.width / 2 - 1]}
      rotation={[-Math.PI / 2, 0, 0]}>
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

const Light = ({ yOffset, debug }: { yOffset: number, debug: boolean }) => {
  // eslint-disable-next-line no-null/no-null
  const lightRef = React.useRef<ThreeSpotLight>(null!);
  const helperRef = useHelper(
    debug ? lightRef : undefined,
    SpotLightHelper,
    "white",
  );
  const worldPosRef = React.useRef<Vector3>(new Vector3());
  const targetPosRef = React.useRef<Vector3>(new Vector3());
  const downVector = React.useMemo(() => new Vector3(0, 0, -1), []);
  const updateTarget = React.useCallback(() => {
    const light = lightRef.current;
    if (!light || typeof light.getWorldPosition != "function") { return; }
    const worldPos = worldPosRef.current;
    const targetPos = targetPosRef.current;
    light.getWorldPosition(worldPos);
    targetPos.copy(worldPos).add(downVector);
    light.target.position.copy(targetPos);
    light.target.updateMatrixWorld();
    helperRef?.current?.update();
  }, [downVector, helperRef]);
  React.useLayoutEffect(updateTarget);
  useFrame(updateTarget);
  return <SpotLight
    ref={lightRef}
    position={[0, 0, yOffset]}
    intensity={2}
    distance={10000}
    decay={0}
    angle={Math.PI / 6}
    castShadow={true} />;
};
