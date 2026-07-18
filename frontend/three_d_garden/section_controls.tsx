import React from "react";
import { ThreeEvent } from "@react-three/fiber";
import {
  Billboard, Circle, Cone, Cylinder, Line, Plane as DreiPlane, Sphere,
} from "@react-three/drei";
import { Plane } from "three";
import { Config, PositionConfig } from "./config";
import { Group, MeshBasicMaterial } from "./components";
import { Text } from "./elements";
import {
  get3DPositionFunc, getGardenPositionFunc,
} from "./helpers";
import { getBotKinematics } from "./bot/kinematics";
import { SECTION_CLIPPING_EXEMPT } from "./section";
import { getSectionNearPosition } from "./section_cut_faces";
import { ThreeDDesignerState, ThreeDSectionAxis } from
  "../farm_designer/interfaces";
import { AxisNumberProperty } from "../farm_designer/map/interfaces";
import { Actions } from "../constants";
import {
  manualSectionCenter, normalizeSectionValue,
  sectionWidthMax, SECTION_WIDTH_MIN, toggleSectionAxis,
} from "../farm_designer/three_d_section";
import {
  pointerRayPointAtZ, stopSceneObjectMarkerDragEvent,
  stopSceneObjectMarkerEvent,
} from "./scene_objects";
import { clickWasDragged } from "./click_event";

export const SECTION_FOLLOW_SNAP_THRESHOLD = 10;
export const SECTION_CONTROL_OFFSET = 200;
export const SECTION_FOLLOW_CONTROL_OFFSET = 100;
export const SECTION_CONTROL_Z_OFFSET = 7.5;
export const SECTION_PLANE_LINE_OFFSET = 1;
export const SECTION_CONTROL_COLOR = "dodgerblue";
export const SECTION_CONTROL_HOVER_COLOR = "deepskyblue";
export const SECTION_CONTROL_ACTIVE_COLOR = "orange";
export const SECTION_CONTROL_ACTIVE_HOVER_COLOR = "darkorange";
export const SECTION_CONTROL_LABEL_SIZE = 32;
export const SECTION_CONTROL_MARKER_RADIUS = 35;
export const SECTION_CONTROL_ARROW_LENGTH = 250;
export const SECTION_CONTROL_ARROW_WIDTH = 20;
export const SECTION_CONTROL_PILL_LENGTH = 280;
export const SECTION_CONTROL_PILL_WIDTH = 80;
export const SECTION_CONTROL_PILL_LABEL_SIZE = 26;
export const SECTION_CONTROL_PILL_COLOR = "dimgray";
export const SECTION_CONTROL_PILL_HOVER_COLOR = "gray";
export const SECTION_AXIS_TOGGLE_OFFSET_REDUCTION = 50;
export const SECTION_CONTROL_RENDER_ORDER = 1001;

type Point = [number, number, number];

const pointForAxis = (
  axis: ThreeDSectionAxis,
  axisPosition: number,
  transversePosition: number,
  z: number,
): Point => axis == "x"
  ? [axisPosition, transversePosition, z]
  : [transversePosition, axisPosition, z];

const guideLine = (
  axis: ThreeDSectionAxis,
  position: number,
  extent: number,
  z: number,
): [Point, Point] => [
  pointForAxis(axis, position, -extent, z),
  pointForAxis(axis, position, extent, z),
];

export interface SectionControlLayoutProps {
  config: Config;
  configPosition: PositionConfig;
  axis: ThreeDSectionAxis;
  center: number;
  width: number;
  cameraDirection: 1 | -1;
}

export interface SectionControlLayout {
  z: number;
  centerLine: [Point, Point];
  nearLine: [Point, Point];
  farLine: [Point, Point];
  followLine: [Point, Point];
  centerHandles: [Point, Point];
  axisTogglePositions: [Point, Point];
  followHandles: [Point, Point];
  followCenter: number;
  nearWidthArrowStart: Point;
  farWidthArrowStart: Point;
}

export const getSectionControlLayout = (
  props: SectionControlLayoutProps,
): SectionControlLayout => {
  const { config, axis, center, width, cameraDirection } = props;
  const z = -config.bedHeight + SECTION_CONTROL_Z_OFFSET;
  const transverseLength = axis == "x"
    ? config.bedWidthOuter
    : config.bedLengthOuter;
  const clippingExtent = transverseLength / 2;
  const centerExtent = clippingExtent + SECTION_CONTROL_OFFSET;
  const followExtent = clippingExtent + SECTION_FOLLOW_CONTROL_OFFSET;
  const position = get3DPositionFunc(config)({ x: center, y: center });
  const centerPosition = position[axis];
  const nearPosition = centerPosition + cameraDirection * width / 2;
  const farPosition = centerPosition - cameraDirection * width / 2;
  const nearControlPosition = nearPosition
    + cameraDirection * SECTION_PLANE_LINE_OFFSET;
  const farControlPosition = farPosition
    - cameraDirection * SECTION_PLANE_LINE_OFFSET;
  const utmPosition = getBotKinematics(
    config,
    props.configPosition,
  ).anchors.utm.worldPosition;
  const utmAxisPosition = utmPosition[axis == "x" ? 0 : 1];
  const followCenter = getGardenPositionFunc(config, false)({
    x: utmPosition[0],
    y: utmPosition[1],
  })[axis];
  const atBothSides = (
    axisPosition: number,
    extent: number,
  ): [Point, Point] => [
    pointForAxis(axis, axisPosition, -extent, z),
    pointForAxis(axis, axisPosition, extent, z),
  ];
  const centerHandles = atBothSides(centerPosition, centerExtent);
  const transverseIndex = axis == "x" ? 1 : 0;
  const axisTogglePositions = centerHandles.map((handle, index) => {
    const position = [...handle] as Point;
    position[transverseIndex] += (index == 0 ? -1 : 1)
      * (SECTION_CONTROL_MARKER_RADIUS + SECTION_CONTROL_PILL_LENGTH / 2
        - SECTION_AXIS_TOGGLE_OFFSET_REDUCTION);
    return position;
  }) as [Point, Point];
  return {
    z,
    centerLine: guideLine(axis, centerPosition, centerExtent, z),
    nearLine: guideLine(axis, nearControlPosition, clippingExtent, z),
    farLine: guideLine(axis, farControlPosition, clippingExtent, z),
    followLine: guideLine(axis, utmAxisPosition, followExtent, z),
    centerHandles,
    axisTogglePositions,
    followHandles: [
      pointForAxis(axis, utmAxisPosition, -followExtent, z),
      pointForAxis(axis, utmAxisPosition, followExtent, z),
    ],
    followCenter,
    nearWidthArrowStart: pointForAxis(axis, nearControlPosition, 0, z),
    farWidthArrowStart: pointForAxis(axis, farControlPosition, 0, z),
  };
};

export const sectionCameraDirection = (
  nearPlane: Plane,
  farPlane: Plane,
  axis: ThreeDSectionAxis,
): 1 | -1 => getSectionNearPosition(nearPlane, axis)
  >= getSectionNearPosition(farPlane, axis)
  ? 1
  : -1;

export interface SectionControlsProps {
  config: Config;
  configPosition: PositionConfig;
  designer: ThreeDDesignerState;
  dispatch: Function;
  gardenSize: AxisNumberProperty;
  axis: ThreeDSectionAxis;
  center: number;
  width: number;
  opacity: number;
  interactive: boolean;
  nearPlane: Plane;
  farPlane: Plane;
  onDraggingChange(dragging: boolean): void;
}

export const sectionControlNoRaycast = () => undefined;

interface WidthDrag {
  pointerPosition: number;
  width: number;
  planeDirection: 1 | -1;
}

interface SectionWidthControl {
  name: string;
  start: Point;
  direction: 1 | -1;
  planeDirection: 1 | -1;
}

interface SectionCenterControlProps {
  name: string;
  position: Point;
  axis: ThreeDSectionAxis;
  hovered: boolean;
  active?: boolean;
  opacity: number;
  interactive: boolean;
  onHoverChange(hovered: boolean): void;
  onPointerDown(e: ThreeEvent<PointerEvent>): void;
  onPointerMove(e: ThreeEvent<PointerEvent>): void;
  onPointerUp(e: ThreeEvent<PointerEvent>): void;
  onPointerCancel(): void;
}

const SectionCenterControl = (props: SectionCenterControlProps) => {
  const dragging = React.useRef(false);
  const pointerInside = React.useRef(false);
  let color = SECTION_CONTROL_COLOR;
  if (props.hovered) { color = SECTION_CONTROL_HOVER_COLOR; }
  if (props.active) { color = SECTION_CONTROL_ACTIVE_COLOR; }
  const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
    stopSceneObjectMarkerEvent(e);
    pointerInside.current = true;
    if (!dragging.current) {
      props.onHoverChange(true);
      document.body.style.cursor = "pointer";
    }
  };
  const onPointerOut = (e: ThreeEvent<PointerEvent>) => {
    stopSceneObjectMarkerEvent(e);
    pointerInside.current = false;
    if (!dragging.current) {
      document.body.style.cursor = "default";
      props.onHoverChange(false);
    }
  };
  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging.current) { return; }
    stopSceneObjectMarkerDragEvent(e);
    props.onPointerMove(e);
  };
  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    stopSceneObjectMarkerDragEvent(e);
    dragging.current = true;
    document.body.style.cursor = "grabbing";
    (e.target as HTMLElement | null)?.setPointerCapture?.(e.pointerId);
    props.onPointerDown(e);
  };
  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging.current) { return; }
    stopSceneObjectMarkerDragEvent(e);
    dragging.current = false;
    document.body.style.cursor = pointerInside.current
      ? "pointer"
      : "default";
    if (!pointerInside.current) { props.onHoverChange(false); }
    (e.target as HTMLElement | null)?.releasePointerCapture?.(e.pointerId);
    props.onPointerUp(e);
  };
  const onPointerCancel = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging.current) { return; }
    stopSceneObjectMarkerDragEvent(e);
    dragging.current = false;
    document.body.style.cursor = "default";
    props.onPointerCancel();
  };
  const onLostPointerCapture = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging.current) { return; }
    stopSceneObjectMarkerDragEvent(e);
    dragging.current = false;
    document.body.style.cursor = "default";
    props.onPointerCancel();
  };
  const sphere = <Sphere
    name={`${props.name}-sphere`}
    args={[
      SECTION_CONTROL_MARKER_RADIUS * (props.hovered ? 1.25 : 1),
      16,
      16,
    ]}
    raycast={props.interactive ? undefined : sectionControlNoRaycast}
    renderOrder={SECTION_CONTROL_RENDER_ORDER + 1}
    position={[0, 0, 0]}>
    <MeshBasicMaterial
      color={color}
      transparent={true}
      opacity={props.opacity}
      depthTest={true}
      depthWrite={true} />
  </Sphere>;
  return <Group
    name={props.name}
    position={props.position}
    onPointerOver={onPointerOver}
    onPointerOut={onPointerOut}
    onPointerMove={onPointerMove}
    onPointerDown={onPointerDown}
    onPointerUp={onPointerUp}
    onPointerCancel={onPointerCancel}
    onLostPointerCapture={onLostPointerCapture}>
    {sphere}
    {([-1, 1] as const).map(direction =>
      <SectionArrowShape
        key={direction}
        name={`${props.name}-arrow-${direction == -1
          ? "negative"
          : "positive"}`}
        start={[0, 0, 0]}
        axis={props.axis}
        direction={direction}
        hovered={props.hovered}
        opacity={props.opacity}
        interactive={props.interactive} />)}
  </Group>;
};

interface SectionArrowShapeProps {
  name: string;
  start: Point;
  axis: ThreeDSectionAxis;
  direction: 1 | -1;
  hovered: boolean;
  opacity: number;
  interactive: boolean;
}

const SectionArrowShape = (props: SectionArrowShapeProps) => {
  const width = SECTION_CONTROL_ARROW_WIDTH * (props.hovered ? 1.25 : 1);
  const headLength = SECTION_CONTROL_ARROW_WIDTH * 3;
  const shaftLength = SECTION_CONTROL_ARROW_LENGTH - headLength;
  const color = props.hovered
    ? SECTION_CONTROL_HOVER_COLOR
    : SECTION_CONTROL_COLOR;
  const rotation = props.axis == "x"
    ? [0, 0, props.direction == 1 ? 0 : Math.PI]
    : [0, 0, props.direction == 1 ? Math.PI / 2 : -Math.PI / 2];
  return <Group
    name={`${props.name}-shape`}
    position={props.start}
    renderOrder={SECTION_CONTROL_RENDER_ORDER}
    rotation={rotation as [number, number, number]}>
    <Cylinder
      args={[width / 2, width / 2, shaftLength, 16]}
      position={[shaftLength / 2, 0, 0]}
      renderOrder={SECTION_CONTROL_RENDER_ORDER}
      raycast={props.interactive ? undefined : sectionControlNoRaycast}
      rotation={[0, 0, -Math.PI / 2]}>
      <MeshBasicMaterial
        color={color}
        transparent={true}
        opacity={props.opacity}
        depthTest={true}
        depthWrite={true}
        toneMapped={false} />
    </Cylinder>
    <Cone
      args={[width, headLength, 16]}
      position={[shaftLength + headLength / 2, 0, 0]}
      renderOrder={SECTION_CONTROL_RENDER_ORDER}
      raycast={props.interactive ? undefined : sectionControlNoRaycast}
      rotation={[0, 0, -Math.PI / 2]}>
      <MeshBasicMaterial
        color={color}
        transparent={true}
        opacity={props.opacity}
        depthTest={true}
        depthWrite={true}
        toneMapped={false} />
    </Cone>
  </Group>;
};

interface SectionWidthArrowProps extends SectionArrowShapeProps {
  value: number;
  onHoverChange(hovered: boolean): void;
  onPointerDown(e: ThreeEvent<PointerEvent>): void;
  onPointerMove(e: ThreeEvent<PointerEvent>): void;
  onPointerUp(e: ThreeEvent<PointerEvent>): void;
  onPointerCancel(): void;
}

const SectionWidthArrow = (props: SectionWidthArrowProps) => {
  const dragging = React.useRef(false);
  const [showDragLabel, setShowDragLabel] = React.useState(false);
  const width = SECTION_CONTROL_ARROW_WIDTH * (props.hovered ? 1.25 : 1);
  const labelPosition = [...props.start] as Point;
  labelPosition[props.axis == "x" ? 0 : 1] += props.direction
    * SECTION_CONTROL_ARROW_LENGTH / 2;
  labelPosition[2] += width * 2;
  const cancel = () => {
    dragging.current = false;
    document.body.style.cursor = "default";
    setShowDragLabel(false);
    props.onPointerCancel();
  };
  return <Group
    name={props.name}
    onPointerOver={e => {
      stopSceneObjectMarkerEvent(e);
      if (!dragging.current) { props.onHoverChange(true); }
    }}
    onPointerOut={e => {
      stopSceneObjectMarkerEvent(e);
      if (!dragging.current) { props.onHoverChange(false); }
    }}
    onPointerMove={e => {
      if (!dragging.current) { return; }
      stopSceneObjectMarkerDragEvent(e);
      props.onPointerMove(e);
    }}
    onPointerDown={e => {
      stopSceneObjectMarkerDragEvent(e);
      dragging.current = true;
      document.body.style.cursor = "grabbing";
      setShowDragLabel(true);
      (e.target as HTMLElement | null)?.setPointerCapture?.(e.pointerId);
      props.onPointerDown(e);
    }}
    onPointerUp={e => {
      if (!dragging.current) { return; }
      stopSceneObjectMarkerDragEvent(e);
      dragging.current = false;
      document.body.style.cursor = "default";
      setShowDragLabel(false);
      (e.target as HTMLElement | null)?.releasePointerCapture?.(e.pointerId);
      props.onPointerUp(e);
    }}
    onPointerCancel={e => {
      if (!dragging.current) { return; }
      stopSceneObjectMarkerDragEvent(e);
      cancel();
    }}
    onLostPointerCapture={e => {
      if (!dragging.current) { return; }
      stopSceneObjectMarkerDragEvent(e);
      cancel();
    }}>
    <Sphere
      name={`${props.name}-base`}
      args={[
        SECTION_CONTROL_MARKER_RADIUS * (props.hovered ? 1.25 : 1),
        16,
        16,
      ]}
      position={props.start}
      raycast={props.interactive ? undefined : sectionControlNoRaycast}
      renderOrder={SECTION_CONTROL_RENDER_ORDER + 1}>
      <MeshBasicMaterial
        color={props.hovered
          ? SECTION_CONTROL_HOVER_COLOR
          : SECTION_CONTROL_COLOR}
        transparent={true}
        opacity={props.opacity}
        depthTest={true}
        depthWrite={true} />
    </Sphere>
    <SectionArrowShape {...props} />
    {(props.hovered || showDragLabel) &&
      <Billboard follow={true} position={labelPosition}>
        <Text
          name={`${props.name}-label`}
          fontSize={SECTION_CONTROL_LABEL_SIZE}
          color={SECTION_CONTROL_COLOR}
          depthTest={true}
          renderOrder={SECTION_CONTROL_RENDER_ORDER}
          rotation={[0, 0, 0]}
          position={[0, 0, 0]}>
          {`${props.value.toFixed(0)}mm`}
        </Text>
      </Billboard>}
  </Group>;
};

interface SectionPillProps {
  name: string;
  position: Point;
  rotation: number;
  label: string;
  hovered: boolean;
  active?: boolean;
  opacity: number;
  interactive: boolean;
  onHoverChange(hovered: boolean): void;
  onClick(): void;
}

const SectionPill = (props: SectionPillProps) => {
  const bodyLength = SECTION_CONTROL_PILL_LENGTH - SECTION_CONTROL_PILL_WIDTH;
  let color = props.hovered
    ? SECTION_CONTROL_PILL_HOVER_COLOR
    : SECTION_CONTROL_PILL_COLOR;
  if (props.active) {
    color = props.hovered
      ? SECTION_CONTROL_ACTIVE_HOVER_COLOR
      : SECTION_CONTROL_ACTIVE_COLOR;
  }
  const raycast = props.interactive ? undefined : sectionControlNoRaycast;
  return <Group
    name={props.name}
    position={props.position}
    rotation={[0, 0, props.rotation]}
    renderOrder={SECTION_CONTROL_RENDER_ORDER}
    onPointerOver={e => {
      stopSceneObjectMarkerEvent(e);
      if (props.interactive) {
        props.onHoverChange(true);
        document.body.style.cursor = "pointer";
      }
    }}
    onPointerOut={e => {
      stopSceneObjectMarkerEvent(e);
      document.body.style.cursor = "default";
      if (props.interactive) { props.onHoverChange(false); }
    }}
    onClick={e => {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      if (props.interactive) { props.onClick(); }
    }}>
    <DreiPlane
      name={`${props.name}-body`}
      args={[bodyLength, SECTION_CONTROL_PILL_WIDTH]}
      raycast={raycast}
      renderOrder={SECTION_CONTROL_RENDER_ORDER}>
      <MeshBasicMaterial
        color={color}
        transparent={true}
        opacity={props.opacity}
        depthTest={true}
        depthWrite={true}
        toneMapped={!!props.active} />
    </DreiPlane>
    {([-1, 1] as const).map(direction => {
      const side = direction == -1 ? "negative" : "positive";
      return <Circle
        key={direction}
        name={`${props.name}-end-${side}`}
        args={[SECTION_CONTROL_PILL_WIDTH / 2, 32]}
        position={[direction * bodyLength / 2, 0, 0]}
        raycast={raycast}
        renderOrder={SECTION_CONTROL_RENDER_ORDER}>
        <MeshBasicMaterial
          color={color}
          transparent={true}
          opacity={props.opacity}
          depthTest={true}
          depthWrite={true}
          toneMapped={!!props.active} />
      </Circle>;
    })}
    <Text
      name={`${props.name}-label`}
      fontSize={SECTION_CONTROL_PILL_LABEL_SIZE}
      color={props.active ? SECTION_CONTROL_PILL_COLOR : "white"}
      depthTest={true}
      opacity={props.opacity}
      renderOrder={SECTION_CONTROL_RENDER_ORDER + 1}
      rotation={[0, 0, 0]}
      position={[0, 0, 1]}>
      {props.label}
    </Text>
  </Group>;
};

const SECTION_CONTROL_SIDES = ["negative", "positive"] as const;
type SectionControlSide = typeof SECTION_CONTROL_SIDES[number];

const sideIndex = (side: SectionControlSide) =>
  side == "negative" ? 0 : 1;

export const SectionControls = (props: SectionControlsProps) => {
  const { config, designer, dispatch, onDraggingChange } = props;
  const axis = props.axis;
  const cameraDirection = sectionCameraDirection(
    props.nearPlane,
    props.farPlane,
    axis,
  );
  const [centerHovered, setCenterHovered] =
    React.useState<SectionControlSide | undefined>(undefined);
  const [centerDragging, setCenterDragging] =
    React.useState<SectionControlSide | undefined>(undefined);
  const [centerPreview, setCenterPreview] =
    React.useState<number | undefined>(undefined);
  const [centerSnapped, setCenterSnapped] = React.useState(false);
  const [followHovered, setFollowHovered] =
    React.useState<SectionControlSide | undefined>(undefined);
  const [axisToggleHovered, setAxisToggleHovered] =
    React.useState<SectionControlSide | undefined>(undefined);
  const [widthHovered, setWidthHovered] =
    React.useState<string | undefined>(undefined);
  const [widthDragging, setWidthDragging] = React.useState(false);
  const [widthPreview, setWidthPreview] =
    React.useState<number | undefined>(undefined);
  const followDisabledDuringDrag = React.useRef(false);
  const centerWasDragged = React.useRef(false);
  const centerBeforeDrag = React.useRef(0);
  const centerDragOffset = React.useRef(0);
  const widthDrag = React.useRef<WidthDrag | undefined>(undefined);
  const center = centerPreview ?? props.center;
  const width = widthPreview ?? props.width;
  const widthMax = sectionWidthMax(props.gardenSize[axis]);
  const layout = getSectionControlLayout({
    config,
    configPosition: props.configPosition,
    axis,
    center,
    width,
    cameraDirection,
  });
  const getGardenPosition = getGardenPositionFunc(config, false);
  const centerFromEvent = (e: ThreeEvent<PointerEvent>) => {
    const point = pointerRayPointAtZ(e, layout.z).clone();
    point[axis] -= centerDragOffset.current;
    const value = getGardenPosition(point)[axis];
    return Math.round(Math.max(0, Math.min(props.gardenSize[axis], value)));
  };
  const updateCenter = (e: ThreeEvent<PointerEvent>) => {
    const pointerCenter = centerFromEvent(e);
    const snapped = Math.abs(pointerCenter - layout.followCenter)
      <= SECTION_FOLLOW_SNAP_THRESHOLD;
    const value = snapped ? layout.followCenter : pointerCenter;
    setCenterSnapped(snapped);
    setCenterPreview(value);
    dispatch({
      type: Actions.SET_3D_SECTION_CENTER,
      payload: { ...designer.threeDSectionCenter, [axis]: value },
    });
    if (designer.threeDSectionFollowBot
      && !snapped
      && !followDisabledDuringDrag.current) {
      followDisabledDuringDrag.current = true;
      dispatch({
        type: Actions.SET_3D_SECTION_FOLLOW_BOT,
        payload: false,
      });
    }
    return snapped;
  };
  const stopCenterDrag = () => {
    centerDragOffset.current = 0;
    setCenterDragging(undefined);
    setCenterSnapped(false);
  };
  const pointerAxisPosition = (e: ThreeEvent<PointerEvent>) =>
    pointerRayPointAtZ(e, layout.z)[axis];
  const widthFromEvent = (e: ThreeEvent<PointerEvent>) => {
    const drag = widthDrag.current;
    if (!drag) { return width; }
    const delta = drag.planeDirection * cameraDirection
      * (pointerAxisPosition(e) - drag.pointerPosition);
    return normalizeSectionValue(
      drag.width + 2 * delta,
      SECTION_WIDTH_MIN,
      widthMax,
    );
  };
  const updateWidth = (e: ThreeEvent<PointerEvent>) => {
    const value = widthFromEvent(e);
    setWidthPreview(value);
    dispatch({ type: Actions.SET_3D_SECTION_WIDTH, payload: value });
  };
  const stopWidthDrag = () => {
    widthDrag.current = undefined;
    setWidthDragging(false);
  };
  const centerDragPosition = centerDragging === undefined
    ? undefined
    : layout.centerHandles[sideIndex(centerDragging)];
  const nearWidthControl: SectionWidthControl = {
    name: "section-width-arrow-near",
    start: layout.nearWidthArrowStart,
    direction: cameraDirection,
    planeDirection: 1,
  };
  const farWidthControl: SectionWidthControl = {
    name: "section-width-arrow-far",
    start: layout.farWidthArrowStart,
    direction: -cameraDirection as 1 | -1,
    planeDirection: -1,
  };
  const axisToggleAxis = axis == "x" ? "y" : "x";
  const axisToggleRotation = (axisToggleAxis == "x" ? Math.PI / 2 : 0)
    + (axis == "y" ? Math.PI : 0);
  const followToggleRotation = axis == "x" ? 0 : Math.PI / 2;
  React.useEffect(() => {
    const centerSynced = centerPreview !== undefined
      && centerDragging === undefined
      && props.center == centerPreview;
    const widthSynced = widthPreview !== undefined
      && !widthDragging
      && designer.threeDSectionWidth == widthPreview;
    if (centerSynced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCenterPreview(undefined);
      onDraggingChange(false);
    } else if (widthSynced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWidthPreview(undefined);
      onDraggingChange(false);
    }
  }, [
    centerDragging,
    centerPreview,
    designer.threeDSectionWidth,
    onDraggingChange,
    props.center,
    widthDragging,
    widthPreview,
  ]);
  React.useEffect(() => () => onDraggingChange(false), [onDraggingChange]);
  const renderWidthControl = (control: SectionWidthControl) =>
    <SectionWidthArrow
      name={control.name}
      start={control.start}
      axis={axis}
      direction={control.direction}
      value={width}
      hovered={widthHovered == control.name}
      opacity={props.opacity}
      interactive={props.interactive}
      onHoverChange={hovered =>
        setWidthHovered(hovered ? control.name : undefined)}
      onPointerDown={e => {
        widthDrag.current = {
          pointerPosition: pointerAxisPosition(e),
          width,
          planeDirection: control.planeDirection,
        };
        setWidthPreview(width);
        setWidthDragging(true);
        onDraggingChange(true);
      }}
      onPointerMove={updateWidth}
      onPointerUp={e => {
        updateWidth(e);
        stopWidthDrag();
      }}
      onPointerCancel={stopWidthDrag} />;
  return <Group name={"section-controls"}
    userData={{ [SECTION_CLIPPING_EXEMPT]: true }}>
    <Group name={"section-follow-controls"}>
      <Line name={"section-follow-line"}
        points={layout.followLine} color={"white"} lineWidth={2}
        transparent={true} opacity={props.opacity}
        raycast={sectionControlNoRaycast} />
      {SECTION_CONTROL_SIDES.map((side, index) =>
        <SectionPill
          key={side}
          name={`section-follow-toggle-${side}`}
          position={layout.followHandles[index]}
          rotation={followToggleRotation + index * Math.PI}
          label={"FOLLOW BOT"}
          hovered={followHovered == side}
          active={designer.threeDSectionFollowBot || centerSnapped}
          opacity={props.opacity}
          interactive={props.interactive}
          onHoverChange={hovered =>
            setFollowHovered(hovered ? side : undefined)}
          onClick={() => dispatch({
            type: Actions.SET_3D_SECTION_FOLLOW_BOT,
            payload: !designer.threeDSectionFollowBot,
          })} />)}
    </Group>
    <Group name={"section-center-controls"}>
      <Line name={"section-center-line"}
        points={layout.centerLine} color={"white"} lineWidth={2}
        dashed={true} dashSize={25} gapSize={25}
        transparent={true} opacity={props.opacity}
        raycast={sectionControlNoRaycast} />
      {SECTION_CONTROL_SIDES.map((side, index) =>
        <SectionCenterControl
          key={side}
          name={`section-center-handle-${side}`}
          position={layout.centerHandles[index]}
          axis={axis}
          hovered={centerHovered == side}
          active={designer.threeDSectionFollowBot || centerSnapped}
          opacity={props.opacity}
          interactive={props.interactive}
          onHoverChange={hovered =>
            setCenterHovered(hovered ? side : undefined)}
          onPointerDown={e => {
            setCenterSnapped(Math.abs(center - layout.followCenter)
              <= SECTION_FOLLOW_SNAP_THRESHOLD);
            followDisabledDuringDrag.current = false;
            centerWasDragged.current = false;
            const axisIndex = axis == "x" ? 0 : 1;
            centerDragOffset.current = pointerAxisPosition(e)
              - layout.centerHandles[index][axisIndex];
            centerBeforeDrag.current =
              designer.threeDSectionCenter[axis]
              ?? manualSectionCenter(designer, props.gardenSize);
            setCenterDragging(side);
            setCenterPreview(center);
            onDraggingChange(true);
          }}
          onPointerMove={e => {
            centerWasDragged.current = true;
            updateCenter(e);
          }}
          onPointerUp={e => {
            if (!centerWasDragged.current && !clickWasDragged(e)) {
              dispatch({
                type: Actions.SET_3D_SECTION_FOLLOW_BOT,
                payload: !designer.threeDSectionFollowBot,
              });
              setCenterPreview(undefined);
              stopCenterDrag();
              onDraggingChange(false);
              return;
            }
            const snapped = updateCenter(e);
            if (snapped) {
              dispatch({
                type: Actions.SET_3D_SECTION_CENTER,
                payload: {
                  ...designer.threeDSectionCenter,
                  [axis]: centerBeforeDrag.current,
                },
              });
            }
            dispatch({
              type: Actions.SET_3D_SECTION_FOLLOW_BOT,
              payload: snapped,
            });
            stopCenterDrag();
          }}
          onPointerCancel={stopCenterDrag} />)}
      {SECTION_CONTROL_SIDES.map((side, index) =>
        <SectionPill
          key={side}
          name={`section-axis-toggle-${side}`}
          position={layout.axisTogglePositions[index]}
          rotation={axisToggleRotation + index * Math.PI}
          label={"SWITCH AXIS"}
          hovered={axisToggleHovered == side}
          opacity={props.opacity}
          interactive={props.interactive}
          onHoverChange={hovered =>
            setAxisToggleHovered(hovered ? side : undefined)}
          onClick={() => toggleSectionAxis(
            designer,
            props.gardenSize,
            dispatch,
          )} />)}
      {centerDragPosition &&
        <Billboard follow={true} position={[
          centerDragPosition[0],
          centerDragPosition[1],
          layout.z + SECTION_CONTROL_MARKER_RADIUS * 2,
        ]}>
          <Text
            name={"section-center-handle-label"}
            fontSize={SECTION_CONTROL_LABEL_SIZE}
            color={SECTION_CONTROL_COLOR}
            depthTest={true}
            renderOrder={SECTION_CONTROL_RENDER_ORDER}
            rotation={[0, 0, 0]}
            position={[0, 0, 0]}>
            {`${axis.toUpperCase()} ${center.toFixed(0)}mm`}
          </Text>
        </Billboard>}
    </Group>
    <Group name={"section-near-plane-controls"}>
      <Line name={"section-near-plane-line"}
        points={layout.nearLine} color={"white"} lineWidth={2}
        transparent={true} opacity={props.opacity}
        raycast={sectionControlNoRaycast} />
      {renderWidthControl(nearWidthControl)}
    </Group>
    <Group name={"section-far-plane-controls"}>
      <Line name={"section-far-plane-line"}
        points={layout.farLine} color={"white"} lineWidth={2}
        transparent={true} opacity={props.opacity}
        raycast={sectionControlNoRaycast} />
      {renderWidthControl(farWidthControl)}
    </Group>
  </Group>;
};
