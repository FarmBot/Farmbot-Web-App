import React from "react";
import { Billboard, Line } from "@react-three/drei";
import { Plane, Shape } from "three";
import { Config, PositionConfig } from "./config";
import { Group, Mesh, MeshBasicMaterial } from "./components";
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
  ControlArrow, ControlDragEvent, ControlHandle, ControlPillButton,
  ControlSphere, CONTROL_SIZE_ARROW_WIDTH, noControlRaycast, planeConstraint,
} from "./controls";
import { clickWasDragged } from "./click_event";
import { t } from "../i18next_wrapper";

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
export const SECTION_CONTROL_ARROW_WIDTH = CONTROL_SIZE_ARROW_WIDTH;
export const SECTION_CONTROL_PILL_LENGTH = 280;
export const SECTION_CONTROL_PILL_WIDTH = 80;
export const SECTION_CONTROL_PILL_LABEL_SIZE = 26;
export const SECTION_CONTROL_PILL_COLOR = "dimgray";
export const SECTION_CONTROL_PILL_HOVER_COLOR = "gray";
export const SECTION_CLOSE_CONTROL_SIZE = 80;
export const SECTION_CLOSE_CONTROL_GAP = 20;
export const SECTION_CLOSE_CONTROL_COLOR = "#e66";
export const SECTION_CLOSE_CONTROL_HOVER_COLOR = "#f00";
export const SECTION_CONTROL_RENDER_ORDER = 1001;

type Point = [number, number, number];

const pointForAxis = (
  axis: ThreeDSectionAxis,
  axisPosition: number,
  transversePosition: number,
  z: number,
): Point =>
  axis == "x"
    ? [axisPosition, transversePosition, z]
    : [transversePosition, axisPosition, z];

const guideLine = (
  axis: ThreeDSectionAxis,
  position: number,
  extent: number,
  z: number,
): [Point, Point] =>
  [
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
  closePositions: [Point, Point];
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
  ): [Point, Point] =>
    [
      pointForAxis(axis, axisPosition, -extent, z),
      pointForAxis(axis, axisPosition, extent, z),
    ];
  const centerHandles = atBothSides(centerPosition, centerExtent);
  const transverseIndex = axis == "x" ? 1 : 0;
  const axisTogglePositions = centerHandles.map((handle, index) => {
    const position = [...handle] as Point;
    position[transverseIndex] += (index == 0 ? -1 : 1)
      * (SECTION_CONTROL_OFFSET - SECTION_FOLLOW_CONTROL_OFFSET);
    return position;
  }) as [Point, Point];
  const closePositions = axisTogglePositions.map((handle, index) => {
    const position = [...handle] as Point;
    position[transverseIndex] += (index == 0 ? -1 : 1)
      * (SECTION_CONTROL_PILL_WIDTH / 2
        + SECTION_CLOSE_CONTROL_SIZE / 2
        + SECTION_CLOSE_CONTROL_GAP);
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
    closePositions,
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
): 1 | -1 =>
  getSectionNearPosition(nearPlane, axis)
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

export const sectionControlNoRaycast = noControlRaycast;

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
  onPointerDown(e: ControlDragEvent): void;
  onPointerMove(e: ControlDragEvent): void;
  onPointerUp(e: ControlDragEvent): void;
  onPointerCancel(): void;
}

const SectionCenterControl = (props: SectionCenterControlProps) => {
  const arrowEnd = (direction: 1 | -1): Point =>
    props.axis == "x"
      ? [direction * SECTION_CONTROL_ARROW_LENGTH, 0, 0]
      : [0, direction * SECTION_CONTROL_ARROW_LENGTH, 0];
  return <ControlHandle
    name={props.name}
    position={props.position}
    enabled={props.interactive}
    constraint={planeConstraint("xy", [0, 0, props.position[2]])}
    onHoverChange={props.onHoverChange}
    onDragStart={props.onPointerDown}
    onDrag={props.onPointerMove}
    onDragEnd={props.onPointerUp}
    onDragCancel={props.onPointerCancel}>
    {state => <>
      <ControlSphere
        name={`${props.name}-sphere`}
        radius={SECTION_CONTROL_MARKER_RADIUS}
        color={SECTION_CONTROL_COLOR}
        hoverColor={SECTION_CONTROL_HOVER_COLOR}
        activeColor={SECTION_CONTROL_ACTIVE_COLOR}
        activeHoverColor={SECTION_CONTROL_ACTIVE_HOVER_COLOR}
        hovered={state.hovered || props.hovered}
        active={props.active}
        enabled={props.interactive}
        opacity={props.opacity}
        depthTest={true}
        depthWrite={true}
        renderOrder={SECTION_CONTROL_RENDER_ORDER + 1} />
      {([-1, 1] as const).map(direction =>
        <ControlArrow
          key={direction}
          name={`${props.name}-arrow-${direction == -1
            ? "negative"
            : "positive"}`}
          start={[0, 0, 0]}
          end={arrowEnd(direction)}
          width={SECTION_CONTROL_ARROW_WIDTH}
          color={SECTION_CONTROL_COLOR}
          hoverColor={SECTION_CONTROL_HOVER_COLOR}
          hovered={state.hovered || props.hovered}
          enabled={props.interactive}
          opacity={props.opacity}
          depthTest={true}
          depthWrite={true}
          renderOrder={SECTION_CONTROL_RENDER_ORDER} />)}
    </>}
  </ControlHandle>;
};

interface SectionWidthArrowProps {
  name: string;
  start: Point;
  axis: ThreeDSectionAxis;
  direction: 1 | -1;
  hovered: boolean;
  opacity: number;
  interactive: boolean;
  value: number;
  onHoverChange(hovered: boolean): void;
  onPointerDown(e: ControlDragEvent): void;
  onPointerMove(e: ControlDragEvent): void;
  onPointerUp(e: ControlDragEvent): void;
  onPointerCancel(): void;
}

const SectionWidthArrow = (props: SectionWidthArrowProps) => {
  const end: Point = props.axis == "x"
    ? [props.direction * SECTION_CONTROL_ARROW_LENGTH, 0, 0]
    : [0, props.direction * SECTION_CONTROL_ARROW_LENGTH, 0];
  return <ControlHandle
    name={props.name}
    position={props.start}
    enabled={props.interactive}
    constraint={planeConstraint("xy", [0, 0, props.start[2]])}
    onHoverChange={props.onHoverChange}
    onDragStart={props.onPointerDown}
    onDrag={props.onPointerMove}
    onDragEnd={props.onPointerUp}
    onDragCancel={props.onPointerCancel}>
    {state => <>
      <ControlSphere
        name={`${props.name}-base`}
        radius={SECTION_CONTROL_MARKER_RADIUS}
        color={SECTION_CONTROL_COLOR}
        hoverColor={SECTION_CONTROL_HOVER_COLOR}
        hovered={state.hovered || props.hovered}
        enabled={props.interactive}
        opacity={props.opacity}
        depthTest={true}
        depthWrite={true}
        renderOrder={SECTION_CONTROL_RENDER_ORDER + 1} />
      <ControlArrow
        name={`${props.name}-arrow`}
        start={[0, 0, 0]}
        end={end}
        width={SECTION_CONTROL_ARROW_WIDTH}
        color={SECTION_CONTROL_COLOR}
        hoverColor={SECTION_CONTROL_HOVER_COLOR}
        hovered={state.hovered || props.hovered}
        enabled={props.interactive}
        opacity={props.opacity}
        depthTest={true}
        depthWrite={true}
        renderOrder={SECTION_CONTROL_RENDER_ORDER}
        label={`${props.value.toFixed(0)}mm`}
        labelName={`${props.name}-label`}
        labelSize={SECTION_CONTROL_LABEL_SIZE}
        labelVisible={state.hovered || state.dragging || props.hovered} />
    </>}
  </ControlHandle>;
};

interface SectionPillProps {
  name: string;
  position: Point;
  rotation: number;
  label?: string;
  icon?: React.ReactNode;
  active?: boolean;
  length?: number;
  width?: number;
  labelSize?: number;
  color?: string;
  hoverColor?: string;
  opacity: number;
  interactive: boolean;
  onClick(): void;
}

const SectionPill = (props: SectionPillProps) => {
  return <ControlPillButton
    name={props.name}
    position={props.position}
    rotation={[0, 0, props.rotation]}
    label={props.label}
    icon={props.icon}
    length={props.length ?? SECTION_CONTROL_PILL_LENGTH}
    width={props.width ?? SECTION_CONTROL_PILL_WIDTH}
    thickness={10}
    labelSize={props.labelSize ?? SECTION_CONTROL_PILL_LABEL_SIZE}
    color={props.color ?? SECTION_CONTROL_PILL_COLOR}
    hoverColor={props.hoverColor ?? SECTION_CONTROL_PILL_HOVER_COLOR}
    activeColor={SECTION_CONTROL_ACTIVE_COLOR}
    activeHoverColor={SECTION_CONTROL_ACTIVE_HOVER_COLOR}
    active={props.active}
    enabled={props.interactive}
    opacity={props.opacity}
    renderOrder={SECTION_CONTROL_RENDER_ORDER}
    onClick={props.onClick} />;
};

interface FontAwesomeXIconProps {
  opacity: number;
}

const FontAwesomeXIcon = (props: FontAwesomeXIconProps) => {
  const size = SECTION_CLOSE_CONTROL_SIZE * 0.55 * 0.75;
  const shape = React.useMemo(() => {
    const half = size / 2;
    const inner = size * 0.16;
    const corner = half - inner;
    const result = new Shape();
    const points = [
      [-half, -corner], [-corner, -half], [0, -inner],
      [corner, -half], [half, -corner], [inner, 0],
      [half, corner], [corner, half], [0, inner],
      [-corner, half], [-half, corner], [-inner, 0],
    ];
    result.moveTo(points[0][0], points[0][1]);
    points.slice(1).map(point => result.lineTo(point[0], point[1]));
    result.closePath();
    return result;
  }, [size]);
  return <Group name={"font-awesome-x-icon"} position={[0, 0, 6]}>
    <Mesh name={"font-awesome-x-icon-shape"}
      raycast={sectionControlNoRaycast}
      renderOrder={SECTION_CONTROL_RENDER_ORDER + 1}>
      <shapeGeometry args={[shape]} />
      <MeshBasicMaterial
        color={"white"}
        transparent={props.opacity < 1}
        opacity={props.opacity}
        depthTest={true}
        depthWrite={true} />
    </Mesh>
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
  const centerFromEvent = (e: ControlDragEvent) => {
    const point = e.point.clone();
    point[axis] -= centerDragOffset.current;
    const value = getGardenPosition(point)[axis];
    return Math.round(Math.max(0, Math.min(props.gardenSize[axis], value)));
  };
  const updateCenter = (e: ControlDragEvent) => {
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
  const pointerAxisPosition = (e: ControlDragEvent) => e.point[axis];
  const widthFromEvent = (e: ControlDragEvent) => {
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
  const updateWidth = (e: ControlDragEvent) => {
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
  const followToggleRotation = axis == "x" ? 0 : 3 * Math.PI / 2;
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
          label={t("Follow Bot")}
          active={designer.threeDSectionFollowBot || centerSnapped}
          opacity={props.opacity}
          interactive={props.interactive}
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
            if (!centerWasDragged.current && !clickWasDragged(e.event)) {
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
          label={t("Switch Axis")}
          opacity={props.opacity}
          interactive={props.interactive}
          onClick={() => toggleSectionAxis(
            designer,
            props.gardenSize,
            dispatch,
          )} />)}
      {SECTION_CONTROL_SIDES.map((side, index) =>
        <SectionPill
          key={side}
          name={`section-close-${side}`}
          position={layout.closePositions[index]}
          rotation={axisToggleRotation + index * Math.PI}
          icon={<FontAwesomeXIcon opacity={props.opacity} />}
          length={SECTION_CLOSE_CONTROL_SIZE}
          width={SECTION_CLOSE_CONTROL_SIZE}
          color={SECTION_CLOSE_CONTROL_COLOR}
          hoverColor={SECTION_CLOSE_CONTROL_HOVER_COLOR}
          opacity={props.opacity}
          interactive={props.interactive}
          onClick={() => dispatch({
            type: Actions.SET_3D_SECTION_OPEN,
            payload: false,
          })} />)}
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
