import React from "react";
import { ThreeEvent } from "@react-three/fiber";
import {
  Billboard, Cone, Cylinder, Line, Sphere,
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
import { DesignerState, ThreeDSectionAxis } from
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

export const SECTION_CONTROL_OFFSET = 200;
export const SECTION_FOLLOW_CONTROL_OFFSET = 100;
export const SECTION_FOLLOW_SNAP_THRESHOLD = 10;
export const SECTION_CONTROL_Z_OFFSET = 7.5;
export const SECTION_CONTROL_COLOR = "dodgerblue";
export const SECTION_CONTROL_HOVER_COLOR = "deepskyblue";
export const SECTION_CONTROL_ACTIVE_COLOR = "orange";
export const SECTION_CONTROL_LABEL_SIZE = 32;
export const SECTION_CONTROL_MARKER_RADIUS = 35;
export const SECTION_CONTROL_ARROW_LENGTH = 250;
export const SECTION_CONTROL_ARROW_WIDTH = 20;
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
  axisToggleArrowStarts: [Point, Point];
  followHandles: [Point, Point];
  followCenter: number;
  nearWidthArrowStarts: [Point, Point];
  farWidthArrowStarts: [Point, Point];
}

export const getSectionControlLayout = (
  props: SectionControlLayoutProps,
): SectionControlLayout => {
  const { config, axis, center, width, cameraDirection } = props;
  const z = -config.bedHeight + SECTION_CONTROL_Z_OFFSET;
  const transverseLength = axis == "x"
    ? config.bedWidthOuter
    : config.bedLengthOuter;
  const extent = transverseLength / 2 + SECTION_CONTROL_OFFSET;
  const followExtent = transverseLength / 2 + SECTION_FOLLOW_CONTROL_OFFSET;
  const position = get3DPositionFunc(config)({ x: center, y: center });
  const centerPosition = position[axis];
  const nearPosition = centerPosition + cameraDirection * width / 2;
  const farPosition = centerPosition - cameraDirection * width / 2;
  const utmPosition = getBotKinematics(
    config,
    props.configPosition,
  ).anchors.utm.worldPosition;
  const utmAxisPosition = utmPosition[axis == "x" ? 0 : 1];
  const followCenter = getGardenPositionFunc(config, false)({
    x: utmPosition[0],
    y: utmPosition[1],
  })[axis];
  const atBothSides = (axisPosition: number): [Point, Point] => [
    pointForAxis(axis, axisPosition, -extent, z),
    pointForAxis(axis, axisPosition, extent, z),
  ];
  const centerHandles = atBothSides(centerPosition);
  const transverseIndex = axis == "x" ? 1 : 0;
  const axisToggleArrowStarts = centerHandles.map((handle, index) => {
    const start = [...handle] as Point;
    start[transverseIndex] += (index == 0 ? -1 : 1)
      * SECTION_CONTROL_MARKER_RADIUS;
    return start;
  }) as [Point, Point];
  return {
    z,
    centerLine: guideLine(axis, centerPosition, extent, z),
    nearLine: guideLine(axis, nearPosition, extent, z),
    farLine: guideLine(axis, farPosition, extent, z),
    followLine: guideLine(axis, utmAxisPosition, followExtent, z),
    centerHandles,
    axisToggleArrowStarts,
    followHandles: [
      pointForAxis(axis, utmAxisPosition, -followExtent, z),
      pointForAxis(axis, utmAxisPosition, followExtent, z),
    ],
    followCenter,
    nearWidthArrowStarts: atBothSides(nearPosition),
    farWidthArrowStarts: atBothSides(farPosition),
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
  designer: DesignerState;
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

interface SectionControlSphereProps {
  name: string;
  position: Point;
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

const SectionControlSphere = (props: SectionControlSphereProps) => {
  const dragging = React.useRef(false);
  let color = SECTION_CONTROL_COLOR;
  if (props.hovered) { color = SECTION_CONTROL_HOVER_COLOR; }
  if (props.active) { color = SECTION_CONTROL_ACTIVE_COLOR; }
  return <Sphere
    name={props.name}
    args={[
      SECTION_CONTROL_MARKER_RADIUS * (props.hovered ? 1.25 : 1),
      16,
      16,
    ]}
    raycast={props.interactive ? undefined : sectionControlNoRaycast}
    renderOrder={SECTION_CONTROL_RENDER_ORDER + 1}
    position={props.position}
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
      (e.target as HTMLElement | null)?.setPointerCapture?.(e.pointerId);
      props.onPointerDown(e);
    }}
    onPointerUp={e => {
      if (!dragging.current) { return; }
      stopSceneObjectMarkerDragEvent(e);
      dragging.current = false;
      (e.target as HTMLElement | null)?.releasePointerCapture?.(e.pointerId);
      props.onPointerUp(e);
    }}
    onPointerCancel={e => {
      if (!dragging.current) { return; }
      stopSceneObjectMarkerDragEvent(e);
      dragging.current = false;
      props.onPointerCancel();
    }}
    onLostPointerCapture={e => {
      if (!dragging.current) { return; }
      stopSceneObjectMarkerDragEvent(e);
      dragging.current = false;
      props.onPointerCancel();
    }}>
    <MeshBasicMaterial
      color={color}
      transparent={true}
      opacity={props.opacity}
      depthTest={true}
      depthWrite={true} />
  </Sphere>;
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
        color={props.hovered
          ? SECTION_CONTROL_HOVER_COLOR
          : SECTION_CONTROL_COLOR}
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
        color={props.hovered
          ? SECTION_CONTROL_HOVER_COLOR
          : SECTION_CONTROL_COLOR}
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
      setShowDragLabel(true);
      (e.target as HTMLElement | null)?.setPointerCapture?.(e.pointerId);
      props.onPointerDown(e);
    }}
    onPointerUp={e => {
      if (!dragging.current) { return; }
      stopSceneObjectMarkerDragEvent(e);
      dragging.current = false;
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

interface SectionAxisArrowProps extends SectionArrowShapeProps {
  onHoverChange(hovered: boolean): void;
  onClick(): void;
}

const SectionAxisArrow = (props: SectionAxisArrowProps) =>
  <Group
    name={props.name}
    onPointerOver={e => {
      stopSceneObjectMarkerEvent(e);
      props.onHoverChange(true);
    }}
    onPointerOut={e => {
      stopSceneObjectMarkerEvent(e);
      props.onHoverChange(false);
    }}
    onClick={e => {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      props.onClick();
    }}>
    <SectionArrowShape {...props} />
  </Group>;

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
  const [axisArrowHovered, setAxisArrowHovered] =
    React.useState<SectionControlSide | undefined>(undefined);
  const [widthHovered, setWidthHovered] =
    React.useState<string | undefined>(undefined);
  const [widthDragging, setWidthDragging] = React.useState(false);
  const [widthPreview, setWidthPreview] =
    React.useState<number | undefined>(undefined);
  const followDisabledDuringDrag = React.useRef(false);
  const centerWasDragged = React.useRef(false);
  const centerBeforeDrag = React.useRef(0);
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
    const point = pointerRayPointAtZ(e, layout.z);
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
  const nearWidthControls: SectionWidthControl[] =
    SECTION_CONTROL_SIDES.map((side, index) => ({
      name: `section-width-arrow-near-${side}`,
      start: layout.nearWidthArrowStarts[index],
      direction: cameraDirection,
      planeDirection: 1 as const,
    }));
  const farWidthControls: SectionWidthControl[] =
    SECTION_CONTROL_SIDES.map((side, index) => ({
      name: `section-width-arrow-far-${side}`,
      start: layout.farWidthArrowStarts[index],
      direction: -cameraDirection as 1 | -1,
      planeDirection: -1 as const,
    }));
  const axisArrowAxis = axis == "x" ? "y" : "x";
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
  const renderWidthControls = (controls: SectionWidthControl[]) =>
    controls.map(control =>
      <SectionWidthArrow
        key={control.name}
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
        onPointerCancel={stopWidthDrag} />);
  return <Group name={"section-controls"}
    userData={{ [SECTION_CLIPPING_EXEMPT]: true }}>
    <Group name={"section-follow-controls"}>
      <Line name={"section-follow-line"}
        points={layout.followLine} color={"white"} lineWidth={2}
        transparent={true} opacity={props.opacity}
        raycast={sectionControlNoRaycast} />
      {SECTION_CONTROL_SIDES.map((side, index) =>
        <SectionControlSphere
          key={side}
          name={`section-follow-toggle-${side}`}
          position={layout.followHandles[index]}
          hovered={followHovered == side}
          active={designer.threeDSectionFollowBot || centerSnapped}
          opacity={props.opacity}
          interactive={props.interactive}
          onHoverChange={hovered =>
            setFollowHovered(hovered ? side : undefined)}
          onPointerDown={sectionControlNoRaycast}
          onPointerMove={sectionControlNoRaycast}
          onPointerUp={() => dispatch({
            type: Actions.SET_3D_SECTION_FOLLOW_BOT,
            payload: !designer.threeDSectionFollowBot,
          })}
          onPointerCancel={sectionControlNoRaycast} />)}
    </Group>
    <Group name={"section-center-controls"}>
      <Line name={"section-center-line"}
        points={layout.centerLine} color={"white"} lineWidth={2}
        dashed={true} dashSize={25} gapSize={25}
        transparent={true} opacity={props.opacity}
        raycast={sectionControlNoRaycast} />
      {SECTION_CONTROL_SIDES.map((side, index) =>
        <SectionControlSphere
          key={side}
          name={`section-center-handle-${side}`}
          position={layout.centerHandles[index]}
          hovered={centerHovered == side}
          active={designer.threeDSectionFollowBot}
          opacity={props.opacity}
          interactive={props.interactive}
          onHoverChange={hovered =>
            setCenterHovered(hovered ? side : undefined)}
          onPointerDown={() => {
            setCenterSnapped(Math.abs(center - layout.followCenter)
              <= SECTION_FOLLOW_SNAP_THRESHOLD);
            followDisabledDuringDrag.current = false;
            centerWasDragged.current = false;
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
        <SectionAxisArrow
          key={side}
          name={`section-axis-toggle-${side}`}
          start={layout.axisToggleArrowStarts[index]}
          axis={axisArrowAxis}
          direction={side == "negative" ? -1 : 1}
          hovered={axisArrowHovered == side}
          opacity={props.opacity}
          interactive={props.interactive}
          onHoverChange={hovered =>
            setAxisArrowHovered(hovered ? side : undefined)}
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
      {renderWidthControls(nearWidthControls)}
    </Group>
    <Group name={"section-far-plane-controls"}>
      <Line name={"section-far-plane-line"}
        points={layout.farLine} color={"white"} lineWidth={2}
        transparent={true} opacity={props.opacity}
        raycast={sectionControlNoRaycast} />
      {renderWidthControls(farWidthControls)}
    </Group>
  </Group>;
};
