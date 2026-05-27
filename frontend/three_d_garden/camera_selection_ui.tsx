import React from "react";
import { Config } from "./config";
import { getDefaultCameraPosition } from "./camera";
import { ThreeEvent } from "@react-three/fiber";
import { Cylinder, Line, Sphere } from "@react-three/drei";
import { Group, MeshPhongMaterial } from "./components";
import { debounce, uniq } from "lodash";
import { setWebAppConfigValue } from "../config_storage/actions";
import { BooleanSetting, NumericSetting } from "../session_keys";
import { Actions } from "../constants";

export interface CameraSelectionUIProps {
  config: Config;
  dispatch: Function | undefined;
  topDownAtStart: boolean;
}

interface Hovered {
  angle: number;
  topDown: boolean;
}

const ORTHOGONAL_ANGLES = [0, 90, 180, 270];
const ISO_ANGLES = [30, 150, 210, 330];

export const CameraSelectionUI = (props: CameraSelectionUIProps) => {
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
  const topDownSelected = props.topDownAtStart;
  const common = {
    config: props.config,
    dispatch: props.dispatch,
    topDownAtStart: props.topDownAtStart,
    hovered,
    setHoveredMarker,
  };
  return <Group
    name={"camera-selection"}
    visible={config.cameraSelectionView}>
    {uniq(ORTHOGONAL_ANGLES.concat(
      topDownSelected ? config.viewpointHeading : 0))
      .map(angle =>
        <CameraLocation key={`top-down-${angle}`} {...common}
          angle={angle}
          topDown={true}
          debug={false} />)}
    {uniq(ORTHOGONAL_ANGLES.concat(ISO_ANGLES).concat(
      topDownSelected ? 0 : config.viewpointHeading))
      .map(angle =>
        <CameraLocation key={`iso-${angle}`} {...common}
          angle={angle}
          topDown={false}
          debug={false} />)}
    {config.lightsDebug &&
      uniq(ORTHOGONAL_ANGLES.concat(ISO_ANGLES))
        .map(angle =>
          <CameraLocation key={`debug-${angle}`} {...common}
            angle={angle}
            topDown={false}
            debug={true} />)}
  </Group>;
};

interface CameraLocationProps extends Hovered {
  config: Config;
  dispatch: Function | undefined;
  topDownAtStart: boolean;
  hovered: Hovered | undefined;
  setHoveredMarker(hovered?: Hovered): void;
  debug: boolean;
}

const CameraLocation = (props: CameraLocationProps) => {
  const {
    config, dispatch, topDownAtStart, hovered,
    setHoveredMarker, angle, topDown, debug,
  } = props;
  const isSelected = (topDownAtStart == topDown)
    && angle == (config.viewpointHeading);
  const isHovered = hovered?.angle == angle && hovered?.topDown == topDown;
  const baseColor = isSelected ? "blue" : "orange";
  const color = isHovered ? "cyan" : baseColor;
  const bedSize = { x: config.bedLengthOuter, y: config.bedWidthOuter };
  const position = getDefaultCameraPosition({
    heading: angle,
    bedSize,
    topDown,
    visual: !debug,
  });
  const baseScaleXY = debug ? 1 : 0.5;
  const scale = topDown ? 0.1 : baseScaleXY;
  const baseScaleZ = debug ? 1 : 0.5 * 0.25;
  const zScale = topDown ? 0 : baseScaleZ;
  const scaledPosition: [number, number, number] = [
    position[0] * scale,
    position[1] * scale,
    position[2] * zScale,
  ];
  const height = config.bedZOffset + config.bedHeight + scaledPosition[2];
  const click = debounce(() => {
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
        type: Actions.TOGGLE_3D_TOP_DOWN_VIEW,
        payload: topDown,
      });
    }
  });
  const hoveredData = { angle, topDown };
  const onPointerMove = () => setHoveredMarker(hoveredData);
  const onPointerOut = () => setHoveredMarker(undefined);
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    click();
  };
  return <Group>
    <Group position={scaledPosition}>
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
      {!topDown && config.lightsDebug &&
        <Cylinder
          userData={{ hovered: hoveredData }}
          name={"body"}
          args={[50, 125, height]}
          position={[0, 0, -height / 2]}
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
      <Line points={[position, [0, 0, 0]]} color={color} />}
  </Group>;
};
