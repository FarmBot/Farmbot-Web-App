import React from "react";
import { Config } from "./config";
import {
  alignCameraPositionToViewPrism, getDefaultCameraPosition,
  nearestCardinalHeading, nearestViewPrismHeading,
} from "./camera";
import { ThreeEvent } from "@react-three/fiber";
import { Cylinder, Line, Sphere } from "@react-three/drei";
import { Group, MeshPhongMaterial } from "./components";
import { debounce } from "lodash";
import { setWebAppConfigValue } from "../config_storage/actions";
import { BooleanSetting, NumericSetting } from "../session_keys";
import { Actions } from "../constants";

export interface CameraSelectionUIProps {
  config: Config;
  dispatch: Function | undefined;
  topDownAtStart: boolean;
  onSelect(angle: number, topDown: boolean): void;
}

interface Hovered {
  angle: number;
  topDown: boolean;
}

const ORTHOGONAL_ANGLES = [0, 90, 180, 270];
const ISO_ANGLES = [45, 135, 225, 315];
const CAMERA_ANGLES = ORTHOGONAL_ANGLES.concat(ISO_ANGLES);

const CAMERA_SELECTION_CONFIG_FIELDS: (keyof Config)[] = [
  "bedHeight",
  "bedLengthOuter",
  "bedWidthOuter",
  "bedZOffset",
  "cameraSelectionView",
  "lightsDebug",
  "viewpointHeading",
];

export const cameraSelectionUIPropsEqual = (
  prev: CameraSelectionUIProps,
  next: CameraSelectionUIProps,
) =>
  prev.dispatch === next.dispatch &&
  prev.topDownAtStart === next.topDownAtStart &&
  prev.onSelect === next.onSelect &&
  CAMERA_SELECTION_CONFIG_FIELDS.every(field =>
    prev.config[field] === next.config[field]);

const CameraSelectionUIBase = (props: CameraSelectionUIProps) => {
  const { config } = props;
  const [hovered, setHovered] = React.useState<Hovered | undefined>(undefined);
  const hoveredRef = React.useRef<Hovered | undefined>(undefined);
  const setHoveredMarker = React.useCallback((nextHovered?: Hovered) => {
    if (hoveredRef.current?.angle == nextHovered?.angle
      && hoveredRef.current?.topDown == nextHovered?.topDown) {
      return;
    }
    hoveredRef.current = nextHovered;
    setHovered(nextHovered);
  }, []);
  const selectedAngledHeading = nearestViewPrismHeading(
    config.viewpointHeading,
  );
  const selectedTopDownHeading = nearestCardinalHeading(
    config.viewpointHeading,
  );
  const common = {
    dispatch: props.dispatch,
    onSelect: props.onSelect,
    setHoveredMarker,
    bedLengthOuter: config.bedLengthOuter,
    bedWidthOuter: config.bedWidthOuter,
    bedZOffset: config.bedZOffset,
    bedHeight: config.bedHeight,
    lightsDebug: config.lightsDebug,
  };
  return <Group
    name={"camera-selection"}
    visible={config.cameraSelectionView}>
    {ORTHOGONAL_ANGLES.map(angle =>
      <CameraLocation key={`top-down-${angle}`} {...common}
        angle={angle}
        topDown={true}
        selected={props.topDownAtStart
          && angle == selectedTopDownHeading}
        hovered={hovered?.angle == angle && hovered.topDown}
        zoomFactor={config.zoomFactor}
        debug={false} />)}
    {CAMERA_ANGLES.map(angle =>
      <CameraLocation key={`iso-${angle}`} {...common}
        angle={angle}
        topDown={false}
        selected={!props.topDownAtStart
          && angle == selectedAngledHeading}
        hovered={hovered?.angle == angle && hovered.topDown === false}
        zoomFactor={config.zoomFactor}
        debug={false} />)}
    {config.lightsDebug && CAMERA_ANGLES.map(angle =>
      <CameraLocation key={`debug-${angle}`} {...common}
        angle={angle}
        topDown={false}
        selected={!props.topDownAtStart
          && angle == selectedAngledHeading}
        hovered={hovered?.angle == angle && hovered.topDown === false}
        zoomFactor={config.zoomFactor}
        debug={true} />)}
  </Group>;
};

interface CameraLocationProps extends Hovered {
  dispatch: Function | undefined;
  onSelect(angle: number, topDown: boolean): void;
  selected: boolean;
  hovered: boolean;
  setHoveredMarker(hovered?: Hovered): void;
  bedLengthOuter: number;
  bedWidthOuter: number;
  bedZOffset: number;
  bedHeight: number;
  lightsDebug: boolean;
  debug: boolean;
  zoomFactor: number;
}

const CameraLocation = React.memo((props: CameraLocationProps) => {
  const {
    dispatch, onSelect, selected, hovered, setHoveredMarker,
    angle, topDown, debug,
    bedLengthOuter, bedWidthOuter, bedZOffset, bedHeight, lightsDebug,
    zoomFactor,
  } = props;
  const baseColor = selected ? "blue" : "orange";
  const color = hovered ? "cyan" : baseColor;
  const markerPosition = React.useMemo(() => {
    const bedSize = { x: bedLengthOuter, y: bedWidthOuter };
    const defaultPosition = getDefaultCameraPosition({
      heading: angle,
      bedSize,
      topDown,
      visual: !debug,
      zoomFactor,
    });
    const position = topDown
      ? defaultPosition
      : alignCameraPositionToViewPrism(defaultPosition, angle);
    const baseScaleXY = debug ? 1 : 0.5;
    const scale = topDown ? 0.1 : baseScaleXY;
    const baseScaleZ = debug ? 1 : 0.5 * 0.25;
    const zScale = topDown ? 0 : baseScaleZ;
    const scaledPosition: [number, number, number] = [
      position[0] * scale,
      position[1] * scale,
      position[2] * zScale,
    ];
    return {
      height: bedZOffset + bedHeight + scaledPosition[2],
      position,
      scaledPosition,
    };
  }, [
    angle, bedHeight, bedLengthOuter, bedWidthOuter,
    bedZOffset, debug, topDown, zoomFactor,
  ]);
  const click = React.useMemo(() => debounce(() => {
    if (dispatch) {
      dispatch(setWebAppConfigValue(
        NumericSetting.viewpoint_heading, angle));
      dispatch(setWebAppConfigValue(
        BooleanSetting.top_down_view, topDown));
      dispatch({
        type: Actions.TOGGLE_3D_CAMERA_SELECTION,
        payload: undefined,
      });
      dispatch({
        type: Actions.SET_3D_PERSPECTIVE,
        payload: true,
      });
      onSelect(angle, topDown);
    }
  }), [angle, dispatch, onSelect, topDown]);
  React.useEffect(() => () => click.cancel?.(), [click]);
  const hoveredData = React.useMemo(() => ({ angle, topDown }),
    [angle, topDown]);
  const onPointerMove = React.useCallback(() => setHoveredMarker(hoveredData),
    [hoveredData, setHoveredMarker]);
  const onPointerOut = React.useCallback(() => setHoveredMarker(undefined),
    [setHoveredMarker]);
  const onClick = React.useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    click();
  }, [click]);
  return <Group>
    <Group position={markerPosition.scaledPosition}>
      <Sphere
        userData={{ hovered: hoveredData }}
        name={"head"}
        args={[150, 32, 32]}
        onPointerOver={onPointerMove}
        onPointerMove={onPointerMove}
        onPointerOut={onPointerOut}
        onClick={onClick}>
        <MeshPhongMaterial
          transparent={true}
          opacity={1}
          color={color} />
      </Sphere>
      {!topDown && lightsDebug &&
        <Cylinder
          userData={{ hovered: hoveredData }}
          name={"body"}
          args={[50, 125, markerPosition.height]}
          position={[0, 0, -markerPosition.height / 2]}
          rotation={[Math.PI / 2, 0, 0]}
          onPointerOver={onPointerMove}
          onPointerMove={onPointerMove}
          onPointerOut={onPointerOut}
          onClick={onClick}>
          <MeshPhongMaterial
            transparent={true}
            opacity={0.9}
            color={color} />
        </Cylinder>}
    </Group>
    {debug &&
      <Line points={[markerPosition.position, [0, 0, 0]]} color={color} />}
  </Group>;
});

export const CameraSelectionUI = React.memo(
  CameraSelectionUIBase,
  cameraSelectionUIPropsEqual,
);
