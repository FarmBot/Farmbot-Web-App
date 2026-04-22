import React from "react";
import { Config } from "./config";
import { getDefaultCameraPosition } from "./camera";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { Cylinder, Line, Sphere } from "@react-three/drei";
import { Group, MeshPhongMaterial } from "./components";
import { debounce, uniq } from "lodash";
import { setWebAppConfigValue } from "../config_storage/actions";
import { BooleanSetting, NumericSetting } from "../session_keys";
import { Person } from "./scenes/props";
import { ASSETS } from "./constants";
import { Actions } from "../constants";
import { Object3D } from "three";

export interface CameraSelectionUIProps {
  config: Config;
  dispatch: Function | undefined;
  topDownAtStart: boolean;
}

interface Hovered {
  angle: number;
  topDown: boolean;
}

export const CameraSelectionUI = (props: CameraSelectionUIProps) => {
  const { config } = props;
  const [hovered, setHovered] = React.useState<Hovered | undefined>(undefined);
  const hoveredRef = React.useRef<Hovered | undefined>(undefined);
  const markerRefs =
    React.useRef<Record<string, Object3D | null>>({});
  const markerRefCallbacks =
    // eslint-disable-next-line func-call-spacing
    React.useRef<Record<string, (node: Object3D | null) => void>>({});
  const { camera, pointer, raycaster } = useThree();
  const setMarkerRef = React.useCallback(
    (markerId: string) => {
      markerRefCallbacks.current[markerId] ||= (node: Object3D | null) => {
        markerRefs.current[markerId] = node;
      };
      return markerRefCallbacks.current[markerId];
    },
    []);
  useFrame(() => {
    if (!config.cameraSelectionView) { return; }
    raycaster.setFromCamera(pointer, camera);
    const markerNodes = Object.values(markerRefs.current)
      .filter((node): node is Object3D => !!node);
    const intersection = raycaster
      .intersectObjects(markerNodes, false)
      .find(hit => !!hit.object.userData.hovered);
    const nextHovered = intersection?.object.userData.hovered as
      Hovered | undefined;
    if (hoveredRef.current?.angle == nextHovered?.angle
      && hoveredRef.current?.topDown == nextHovered?.topDown) {
      return;
    }
    hoveredRef.current = nextHovered;
    setHovered(nextHovered);
  });
  const topDownSelected = props.topDownAtStart;
  const common = {
    config: props.config,
    dispatch: props.dispatch,
    topDownAtStart: props.topDownAtStart,
    hovered,
    setMarkerRef,
  };
  return <Group
    name={"camera-selection"}
    visible={config.cameraSelectionView}>
    {uniq([0, 90, 180, 270,
      topDownSelected ? config.viewpointHeading : 0])
      .map(angle =>
        <CameraLocation key={`top-down-${angle}`} {...common}
          angle={angle}
          topDown={true}
          debug={false} />)}
    {uniq([0, 90, 180, 270, 45, 135, 225, 315,
      topDownSelected ? 0 : config.viewpointHeading])
      .map(angle =>
        <CameraLocation key={`iso-${angle}`} {...common}
          angle={angle}
          topDown={false}
          debug={false} />)}
    {config.lightsDebug &&
      uniq([0, 90, 180, 270, 45, 135, 225, 315])
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
  setMarkerRef(markerId: string): (node: Object3D | null) => void;
  debug: boolean;
}

const CameraLocation = (props: CameraLocationProps) => {
  const {
    config, dispatch, topDownAtStart, hovered,
    setMarkerRef, angle, topDown, debug,
  } = props;
  const markerId = `${topDown}-${debug}-${angle}`;
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
  const baseScaleXY = debug ? 1 : 0.8;
  const scale = topDown ? 0.1 : baseScaleXY;
  const baseScaleZ = debug ? 1 : 0.8 * 0.25;
  const zScale = topDown ? 0 : baseScaleZ;
  const scaledPosition: [number, number, number] = [
    position[0] * scale,
    position[1] * scale,
    position[2] * zScale,
  ];
  const height = config.bedHeight + scaledPosition[2];
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
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    click();
  };
  return <Group>
    <Group position={scaledPosition}>
      <Sphere
        ref={setMarkerRef(`${markerId}-head`)}
        userData={{ hovered: hoveredData }}
        name={"head"}
        args={[150, 32, 32]}
        onClick={onClick}>
        <MeshPhongMaterial
          transparent={true}
          opacity={1}
          color={color} />
      </Sphere>
      {!topDown &&
        <Cylinder
          ref={setMarkerRef(`${markerId}-body`)}
          userData={{ hovered: hoveredData }}
          name={"body"}
          args={[50, 125, height]}
          position={[0, 0, -height / 2]}
          rotation={[Math.PI / 2, 0, 0]}
          onClick={onClick}>
          <MeshPhongMaterial
            transparent={true}
            opacity={0.9}
            color={color} />
        </Cylinder>}
      {!topDown &&
        <Person
          url={ASSETS.people.person2}
          position={[0, 0, -height]}
          rotation={[Math.PI / 2, 0, 0]} />}
    </Group>
    {debug &&
      <Line points={[position, [0, 0, 0]]} color={color} />}
  </Group>;
};
