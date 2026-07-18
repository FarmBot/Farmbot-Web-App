import React from "react";
import {
  Billboard, Cone, Cylinder, Html, Line, Sphere,
} from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useSpring } from "@react-spring/three";
import { Vector3 } from "three";
import { clamp, isNumber, round as mathRound } from "lodash";
import { Config } from "../../config";
import {
  get3DPositionFunc, getGardenPositionFunc, zZero,
} from "../../helpers";
import { Group, MeshBasicMaterial } from "../../components";
import type { AddPlantProps } from "../bed";
import {
  PlantGridData, PlantGridKey,
} from "../../../plants/grid/interfaces";
import { GridInput } from "../../../plants/grid/grid_input";
import {
  clampGridStart,
  countForAxisDrag,
  gridFromExtent,
  gridPlantCount,
  initialPlantGrid,
  PlantGridValidation,
  validatePlantGrid,
} from "../../../plants/grid/grid_math";
import {
  gridResourceKind, initPlantGrid,
} from "../../../plants/grid/generate_grid";
import {
  findCropIcon, findCropMetadata, DEFAULT_PLANT_RADIUS,
} from "../../../crops/metadata";
import { PlantInstances, ThreeDGardenPlant } from "../../garden";
import {
  pointerRayPointAtZ,
  stopSceneObjectMarkerDragEvent,
  stopSceneObjectMarkerEvent,
} from "../../scene_objects";
import { clickWasDragged } from "../../click_event";
import { ToggleButton } from "../../../ui";
import { t } from "../../../i18next_wrapper";
import { batchInitDirty } from "../../../api/crud";
import { saveGrid, stashGrid } from "../../../plants/grid/thunks";
import { Actions } from "../../../constants";
import { error, success } from "../../../toast/toast";
import { BooleanSetting } from "../../../session_keys";
import { Text } from "../../elements";
import { GridPlantingRequest } from "../../../farm_designer/interfaces";
import { TaggedResource } from "farmbot";

export type GridPlantingPhase = "pick-start" | "pick-extent" | "edit";
type GridAxis = "x" | "y";
type GridDragKind =
  | "start"
  | "start-x"
  | "start-y"
  | "spacing-x"
  | "spacing-y"
  | "count-x"
  | "count-y";

export interface GridPlantingController {
  onPointerMove(event: ThreeEvent<MouseEvent>): void;
  onClick(event: ThreeEvent<MouseEvent>): void;
}

export interface GridPlantingProps {
  config: Config;
  addPlantProps: AddPlantProps;
  getZ(x: number, y: number): number;
}

interface GridDragState {
  kind: GridDragKind;
  startGrid: PlantGridData;
  offset: { x: number, y: number };
}

interface Point3 {
  x: number;
  y: number;
  z: number;
}

const GRID_CONTROL_COLOR = "dodgerblue";
const GRID_CONTROL_HOVER_COLOR = "deepskyblue";
const GRID_X_COLOR = "#ff5555";
const GRID_Y_COLOR = "#55dd55";
const GRID_CONTROL_Z = 125;
const GRID_POPUP_Z = 360;
const GRID_MARKER_RADIUS = 28;
const GRID_ARROW_WIDTH = 12;
const GRID_START_ARROW_LENGTH = 130;

const stopPopupEvent = (event: React.SyntheticEvent) => {
  event.stopPropagation();
};

const roundPosition = (
  position: { x: number, y: number },
  gridSize: { x: number, y: number },
) => ({
  x: clamp(Math.round(position.x), 0, gridSize.x),
  y: clamp(Math.round(position.y), 0, gridSize.y),
});

const axisGridKey = (
  axis: GridAxis,
  kind: "start" | "spacing" | "count",
): PlantGridKey => {
  if (kind == "start") { return axis == "x" ? "startX" : "startY"; }
  if (kind == "spacing") { return axis == "x" ? "spacingH" : "spacingV"; }
  return axis == "x" ? "numPlantsH" : "numPlantsV";
};

const gardenStart = (grid: PlantGridData) => ({
  x: grid.startX,
  y: grid.startY,
});

const secondGardenPoint = (grid: PlantGridData, axis: GridAxis) => ({
  x: grid.startX + (axis == "x" ? grid.spacingH : 0),
  y: grid.startY + (axis == "y" ? grid.spacingV : 0),
});

const lastGardenPoint = (grid: PlantGridData, axis: GridAxis) => ({
  x: grid.startX + (axis == "x"
    ? grid.spacingH * (grid.numPlantsH - 1)
    : 0),
  y: grid.startY + (axis == "y"
    ? grid.spacingV * (grid.numPlantsV - 1)
    : 0),
});

const terminalGardenPoint = (grid: PlantGridData) => ({
  x: grid.startX + grid.spacingH * (grid.numPlantsH - 1),
  y: grid.startY + grid.spacingV * (grid.numPlantsV - 1),
});

const initialAxis = (
  start: number,
  spacing: number,
  limit: number,
) => {
  const magnitude = Math.max(1, Math.abs(spacing));
  if (start + magnitude <= limit) {
    return { spacing: magnitude, count: 2 };
  }
  if (start - magnitude >= 0) {
    return { spacing: -magnitude, count: 2 };
  }
  const direction = limit - start >= start ? 1 : -1;
  return { spacing: direction * magnitude, count: 2 };
};

const gridAtStart = (
  grid: PlantGridData,
  start: { x: number, y: number },
  spacing: number,
  gridSize: { x: number, y: number },
): PlantGridData => {
  const x = initialAxis(start.x, spacing, gridSize.x);
  const y = initialAxis(start.y, spacing, gridSize.y);
  return {
    ...grid,
    startX: start.x,
    startY: start.y,
    spacingH: x.spacing,
    spacingV: y.spacing,
    numPlantsH: x.count,
    numPlantsV: y.count,
  };
};

const gridAtExtent = (
  baseGrid: PlantGridData,
  pointer: { x: number, y: number },
  spacing: number,
  gridSize: { x: number, y: number },
) => gridFromExtent({
  start: { x: baseGrid.startX, y: baseGrid.startY },
  pointer,
  spacing: { x: Math.abs(spacing), y: Math.abs(spacing) },
  previousSpacing: {
    x: baseGrid.spacingH,
    y: baseGrid.spacingV,
  },
  baseCounts: {
    x: baseGrid.numPlantsH,
    y: baseGrid.numPlantsV,
  },
  gridSize,
});

const countArrowEndValue = (grid: PlantGridData, axis: GridAxis) => {
  const start = axis == "x" ? grid.startX : grid.startY;
  const spacing = axis == "x" ? grid.spacingH : grid.spacingV;
  const count = axis == "x" ? grid.numPlantsH : grid.numPlantsV;
  return start + spacing * Math.max(2, count - 1);
};

const axisGridValues = (grid: PlantGridData, axis: GridAxis) =>
  axis == "x"
    ? {
      start: grid.startX,
      spacing: grid.spacingH,
      count: grid.numPlantsH,
      otherCount: grid.numPlantsV,
    }
    : {
      start: grid.startY,
      spacing: grid.spacingV,
      count: grid.numPlantsV,
      otherCount: grid.numPlantsH,
    };

const axisGardenPoint = (
  start: { x: number, y: number },
  axis: GridAxis,
  distance: number,
) => axis == "x"
  ? { x: start.x + distance, y: start.y }
  : { x: start.x, y: start.y + distance };

const vectorRotation = (start: Point3, end: Point3) =>
  Math.atan2(end.y - start.y, end.x - start.x) - Math.PI / 2;

interface InteractiveArrowProps {
  name: string;
  start: Point3;
  end: Point3;
  color: string;
  doubleSided?: boolean;
  label?: string;
  hovered?: boolean;
  onPointerOver?(event: ThreeEvent<PointerEvent>): void;
  onPointerOut?(event: ThreeEvent<PointerEvent>): void;
  onPointerDown?(event: ThreeEvent<PointerEvent>): void;
  onPointerMove?(event: ThreeEvent<PointerEvent>): void;
  onPointerUp?(event: ThreeEvent<PointerEvent>): void;
  onPointerCancel?(event: ThreeEvent<PointerEvent>): void;
}

const InteractiveArrow = (props: InteractiveArrowProps) => {
  const start = new Vector3(props.start.x, props.start.y, props.start.z);
  const end = new Vector3(props.end.x, props.end.y, props.end.z);
  const distance = start.distanceTo(end);
  if (distance < 1) { return <></>; }
  const middle = start.clone().lerp(end, 0.5);
  const rotation = vectorRotation(props.start, props.end);
  const color = props.hovered ? GRID_CONTROL_HOVER_COLOR : props.color;
  const headLength = Math.min(40, distance / 3);
  const conePosition = end.clone().lerp(start, headLength / 2 / distance);
  const startConePosition =
    start.clone().lerp(end, headLength / 2 / distance);
  return <Group
    name={props.name}
    onPointerOver={props.onPointerOver}
    onPointerOut={props.onPointerOut}
    onPointerDown={props.onPointerDown}
    onPointerMove={props.onPointerMove}
    onPointerUp={props.onPointerUp}
    onPointerCancel={props.onPointerCancel}
    onLostPointerCapture={props.onPointerCancel}>
    <Line
      points={[start, end]}
      color={color}
      lineWidth={props.hovered ? 6 : 4}
      depthTest={false} />
    <Cylinder
      args={[GRID_ARROW_WIDTH, GRID_ARROW_WIDTH, distance, 12]}
      position={middle}
      rotation={[0, 0, rotation]}>
      <MeshBasicMaterial
        color={color}
        transparent={true}
        opacity={0.01}
        depthTest={false} />
    </Cylinder>
    <Cone
      args={[GRID_ARROW_WIDTH * 1.7, headLength, 16]}
      position={conePosition}
      rotation={[0, 0, rotation]}>
      <MeshBasicMaterial color={color} depthTest={false} />
    </Cone>
    {props.doubleSided &&
      <Cone
        args={[GRID_ARROW_WIDTH * 1.7, headLength, 16]}
        position={startConePosition}
        rotation={[0, 0, rotation + Math.PI]}>
        <MeshBasicMaterial color={color} depthTest={false} />
      </Cone>}
    {props.label &&
      <Billboard
        follow={true}
        position={[middle.x, middle.y, middle.z + 25]}>
        <Text
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          fontSize={28}
          color={color}>
          {props.label}
        </Text>
      </Billboard>}
  </Group>;
};

interface DragSphereProps {
  name: string;
  position: Point3;
  hovered: boolean;
  onPointerOver(event: ThreeEvent<PointerEvent>): void;
  onPointerOut(event: ThreeEvent<PointerEvent>): void;
  onPointerDown(event: ThreeEvent<PointerEvent>): void;
  onPointerMove(event: ThreeEvent<PointerEvent>): void;
  onPointerUp(event: ThreeEvent<PointerEvent>): void;
  onPointerCancel(event: ThreeEvent<PointerEvent>): void;
}

const DragSphere = (props: DragSphereProps) =>
  <Sphere
    name={props.name}
    args={[props.hovered ? GRID_MARKER_RADIUS * 1.25 : GRID_MARKER_RADIUS, 16, 16]}
    position={[props.position.x, props.position.y, props.position.z]}
    onPointerOver={props.onPointerOver}
    onPointerOut={props.onPointerOut}
    onPointerDown={props.onPointerDown}
    onPointerMove={props.onPointerMove}
    onPointerUp={props.onPointerUp}
    onPointerCancel={props.onPointerCancel}
    onLostPointerCapture={props.onPointerCancel}>
    <MeshBasicMaterial
      color={props.hovered
        ? GRID_CONTROL_HOVER_COLOR
        : GRID_CONTROL_COLOR}
      depthTest={false} />
  </Sphere>;

interface GridPlantingControlsProps {
  config: Config;
  grid: PlantGridData;
  offsetPacking: boolean;
  gridSize: { x: number, y: number };
  getZ(x: number, y: number): number;
  onChange(grid: PlantGridData): void;
}

interface GridDragUpdateProps {
  drag: GridDragState;
  point: { x: number, y: number };
  gridSize: { x: number, y: number };
  offsetPacking: boolean;
}

interface CountDragTip {
  axis: GridAxis;
  value: number;
}

const startDragUpdate = (props: GridDragUpdateProps) => {
  const { drag, point } = props;
  const requested = {
    x: drag.kind == "start-y"
      ? drag.startGrid.startX
      : point.x + drag.offset.x,
    y: drag.kind == "start-x"
      ? drag.startGrid.startY
      : point.y + drag.offset.y,
  };
  const start = clampGridStart(
    drag.startGrid,
    props.offsetPacking,
    requested,
    props.gridSize,
  );
  return { ...drag.startGrid, startX: start.x, startY: start.y };
};

const spacingDragUpdate = (
  props: GridDragUpdateProps,
  axis: GridAxis,
) => {
  const { startGrid } = props.drag;
  const count = axis == "x"
    ? startGrid.numPlantsH
    : startGrid.numPlantsV;
  const startValue = axis == "x"
    ? startGrid.startX
    : startGrid.startY;
  const pointerValue = props.point[axis];
  const available = pointerValue >= startValue
    ? props.gridSize[axis] - startValue
    : startValue;
  const maxSpacing = count > 1
    ? Math.max(1, Math.floor(available / (count - 1)))
    : props.gridSize[axis];
  let spacing = clamp(
    Math.round(pointerValue - startValue),
    -maxSpacing,
    maxSpacing,
  );
  if (spacing == 0) {
    spacing = Math.sign(axis == "x"
      ? startGrid.spacingH
      : startGrid.spacingV) || 1;
  }
  return {
    ...startGrid,
    [axisGridKey(axis, "spacing")]: spacing,
  };
};

const countDragUpdate = (
  props: GridDragUpdateProps,
  axis: GridAxis,
) => {
  const { startGrid } = props.drag;
  const startValue = axis == "x"
    ? startGrid.startX
    : startGrid.startY;
  const spacing = axis == "x"
    ? startGrid.spacingH
    : startGrid.spacingV;
  const otherCount = axis == "x"
    ? startGrid.numPlantsV
    : startGrid.numPlantsH;
  return {
    ...startGrid,
    [axisGridKey(axis, "count")]: countForAxisDrag(
      startValue,
      props.point[axis],
      spacing,
      otherCount,
      props.gridSize[axis],
    ),
  };
};

export const gridDragUpdate = (props: GridDragUpdateProps) => {
  const { kind } = props.drag;
  if (kind == "start" || kind == "start-x" || kind == "start-y") {
    return startDragUpdate(props);
  }
  if (kind == "spacing-x" || kind == "spacing-y") {
    return spacingDragUpdate(props, kind.endsWith("x") ? "x" : "y");
  }
  return countDragUpdate(props, kind.endsWith("x") ? "x" : "y");
};

interface GridControlHandlerProps extends GridPlantingControlsProps {
  controlZ: number;
}

export const useGridControlHandlers = (props: GridControlHandlerProps) => {
  const [hovered, setHovered] = React.useState<string>();
  const [drag, setDrag] = React.useState<GridDragState>();
  const [countDragTip, setCountDragTip] = React.useState<CountDragTip>();
  const [, countTipSpring] = useSpring(() => ({ tip: 0 }));
  const getGardenPosition = React.useMemo(
    () => getGardenPositionFunc(props.config, false),
    [props.config],
  );
  const pointFromEvent = (event: ThreeEvent<PointerEvent>) =>
    getGardenPosition(pointerRayPointAtZ(event, props.controlZ));
  const startDrag = (
    kind: GridDragKind,
    event: ThreeEvent<PointerEvent>,
  ) => {
    stopSceneObjectMarkerDragEvent(event);
    const point = pointFromEvent(event);
    setDrag({
      kind,
      startGrid: props.grid,
      offset: {
        x: props.grid.startX - point.x,
        y: props.grid.startY - point.y,
      },
    });
    (event.target as HTMLElement | null)?.setPointerCapture?.(event.pointerId);
  };
  const updateDrag = (event: ThreeEvent<PointerEvent>) => {
    if (!drag) { return; }
    stopSceneObjectMarkerDragEvent(event);
    const point = pointFromEvent(event);
    const next = gridDragUpdate({
      drag,
      point,
      gridSize: props.gridSize,
      offsetPacking: props.offsetPacking,
    });
    if (drag.kind == "count-x" || drag.kind == "count-y") {
      const axis: GridAxis = drag.kind.endsWith("x") ? "x" : "y";
      setCountDragTip({ axis, value: point[axis] });
    }
    props.onChange(next);
  };
  const snapCountTip = (axis: GridAxis) => {
    if (countDragTip?.axis != axis) { return; }
    const target = countArrowEndValue(props.grid, axis);
    countTipSpring.start({
      from: { tip: countDragTip.value },
      to: { tip: target },
      config: { tension: 320, friction: 22 },
      onChange: result => {
        const value = result.value.tip;
        isNumber(value) && setCountDragTip({ axis, value });
      },
      onRest: () => setCountDragTip(undefined),
    });
  };
  const finishDrag = (event: ThreeEvent<PointerEvent>) => {
    if (!drag) { return; }
    stopSceneObjectMarkerDragEvent(event);
    const dragged = clickWasDragged(event);
    if (!dragged &&
      (drag.kind == "count-x" || drag.kind == "count-y")) {
      const axis: GridAxis = drag.kind.endsWith("x") ? "x" : "y";
      const values = axisGridValues(props.grid, axis);
      const pointer = values.start + values.spacing * values.count;
      props.onChange({
        ...props.grid,
        [axisGridKey(axis, "count")]: countForAxisDrag(
          values.start,
          pointer,
          values.spacing,
          values.otherCount,
          props.gridSize[axis],
        ),
      });
    }
    if (dragged &&
      (drag.kind == "count-x" || drag.kind == "count-y")) {
      snapCountTip(drag.kind.endsWith("x") ? "x" : "y");
    }
    (event.target as HTMLElement | null)
      ?.releasePointerCapture?.(event.pointerId);
    setDrag(undefined);
  };
  const cancelDrag = (event: ThreeEvent<PointerEvent>) => {
    if (!drag) { return; }
    stopSceneObjectMarkerDragEvent(event);
    if (drag.kind == "count-x" || drag.kind == "count-y") {
      snapCountTip(drag.kind.endsWith("x") ? "x" : "y");
    }
    setDrag(undefined);
  };
  const handlers = (name: string, kind: GridDragKind) => ({
    hovered: hovered == name,
    onPointerOver: (event: ThreeEvent<PointerEvent>) => {
      stopSceneObjectMarkerEvent(event);
      !drag && setHovered(name);
    },
    onPointerOut: (event: ThreeEvent<PointerEvent>) => {
      stopSceneObjectMarkerEvent(event);
      !drag && setHovered(undefined);
    },
    onPointerDown: (event: ThreeEvent<PointerEvent>) =>
      startDrag(kind, event),
    onPointerMove: updateDrag,
    onPointerUp: finishDrag,
    onPointerCancel: cancelDrag,
  });
  return { countDragTip, handlers };
};

// eslint-disable-next-line complexity
const GridPlantingControls = (props: GridPlantingControlsProps) => {
  const get3DPosition = React.useMemo(
    () => get3DPositionFunc(props.config),
    [props.config],
  );
  const startGarden = gardenStart(props.grid);
  const startXY = get3DPosition(startGarden);
  const controlZ = zZero(props.config)
    + props.getZ(startGarden.x, startGarden.y)
    + GRID_CONTROL_Z;
  const start: Point3 = { ...startXY, z: controlZ };
  const worldPoint = (garden: { x: number, y: number }): Point3 => {
    const point = get3DPosition(garden);
    return {
      ...point,
      z: zZero(props.config) + props.getZ(garden.x, garden.y)
        + GRID_CONTROL_Z,
    };
  };
  const { countDragTip, handlers } = useGridControlHandlers({
    ...props,
    controlZ,
  });
  const startSphereHandlers = handlers("grid-start-marker", "start");
  const axisControls = (["x", "y"] as GridAxis[]).map(axis => {
    const color = axis == "x" ? GRID_X_COLOR : GRID_Y_COLOR;
    const axisStartGarden =
      axisGardenPoint(startGarden, axis, GRID_MARKER_RADIUS);
    const axisEndGarden =
      axisGardenPoint(startGarden, axis, GRID_START_ARROW_LENGTH);
    const axisStart = { ...worldPoint(axisStartGarden), z: controlZ + 55 };
    const axisEnd = { ...worldPoint(axisEndGarden), z: controlZ + 55 };
    const startHandlers =
      handlers(`grid-start-${axis}-arrow`, `start-${axis}`);
    const secondGarden = secondGardenPoint(props.grid, axis);
    const second = worldPoint(secondGarden);
    const spacingHandlers =
      handlers(`grid-spacing-${axis}-marker`, `spacing-${axis}`);
    const {
      count,
      spacing,
      start: axisStartValue,
    } = axisGridValues(props.grid, axis);
    const lastGarden = lastGardenPoint(props.grid, axis);
    const countEndValue = countDragTip?.axis == axis
      ? countDragTip.value
      : countArrowEndValue(props.grid, axis);
    const countEndGarden = axisGardenPoint(
      startGarden,
      axis,
      countEndValue - axisStartValue,
    );
    const countEnd = worldPoint(countEndGarden);
    const last = worldPoint(lastGarden);
    const settledCountEnd = count > 2 ? last : countEnd;
    const displayedCountEnd =
      countDragTip?.axis == axis ? countEnd : settledCountEnd;
    const countHandlers =
      handlers(`grid-count-${axis}-arrow`, `count-${axis}`);
    return <React.Fragment key={axis}>
      <InteractiveArrow
        name={`grid-start-${axis}-arrow`}
        start={axisStart}
        end={axisEnd}
        color={color}
        label={axis.toUpperCase()}
        {...startHandlers} />
      <InteractiveArrow
        name={`grid-spacing-${axis}-arrow`}
        start={{ ...start, z: controlZ - 15 }}
        end={{ ...second, z: second.z - 15 }}
        color={GRID_CONTROL_COLOR}
        doubleSided={true}
        label={`${Math.abs(spacing)}mm`}
        {...spacingHandlers} />
      <DragSphere
        name={`grid-spacing-${axis}-marker`}
        position={second}
        {...spacingHandlers} />
      <InteractiveArrow
        name={`grid-count-${axis}-arrow`}
        start={second}
        end={displayedCountEnd}
        color={GRID_CONTROL_COLOR}
        label={`${count}`}
        {...countHandlers} />
    </React.Fragment>;
  });
  return <Group name={"grid-planting-controls"}>
    <DragSphere
      name={"grid-start-marker"}
      position={start}
      {...startSphereHandlers} />
    {axisControls}
  </Group>;
};

interface GridPlantingPopupProps {
  position: [number, number, number];
  grid: PlantGridData;
  offsetPacking: boolean;
  disabled: boolean;
  errors: string[];
  addPlantProps: AddPlantProps;
  onChange(key: PlantGridKey, value: number): void;
  onUseCurrentPosition(position: Record<"x" | "y", number>): void;
  onTogglePacking(): void;
  onSave(): void;
  onCancel(): void;
}

const GridPlantingPopup = (props: GridPlantingPopupProps) =>
  <Html
    name={"grid-planting-popup"}
    wrapperClass={"three-d-object-popup-wrapper"}
    center={true}
    position={props.position}>
    <div
      className={"three-d-object-popup grid grid-planting-popup visible"}
      onPointerDown={stopPopupEvent}
      onContextMenu={stopPopupEvent}
      onWheel={stopPopupEvent}
      onClick={stopPopupEvent}>
      <div className={"object-popup-header row grid-exp-2"}>
        <h3>{t("Add Grid or Row")}</h3>
        <button
          type={"button"}
          className={"fa fa-times fb-icon-button invert"}
          title={t("close")}
          disabled={props.disabled}
          onClick={props.onCancel} />
      </div>
      <div className={"object-popup-content grid"}>
        <GridInput
          itemType={"plants"}
          xy_swap={!!props.addPlantProps.getConfigValue(
            BooleanSetting.xy_swap)}
          disabled={props.disabled}
          grid={props.grid}
          botPosition={props.addPlantProps.botPosition}
          onChange={props.onChange}
          onUseCurrentPosition={props.onUseCurrentPosition} />
        <div className={"row grid-exp-1 grid-packing-row"}>
          <label>{t("hexagonal packing")}</label>
          <ToggleButton
            toggleValue={props.offsetPacking}
            toggleAction={props.onTogglePacking}
            title={t("toggle packing method")}
            customText={{ textFalse: t("off"), textTrue: t("on") }} />
        </div>
        {props.errors.length > 0 &&
          <div className={"grid-planting-errors"}>
            {props.errors.map(message =>
              <p key={message}>{message}</p>)}
          </div>}
        <div className={"row grid-exp-2 grid-planting-popup-buttons"}>
          <button
            type={"button"}
            className={"fb-button gray"}
            disabled={props.disabled}
            onClick={props.onCancel}>
            {t("Cancel")}
          </button>
          <button
            type={"button"}
            className={"fb-button green"}
            disabled={props.disabled || props.errors.length > 0}
            onClick={props.onSave}>
            {props.disabled ? t("Saving...") : t("Save")}
          </button>
        </div>
      </div>
    </div>
  </Html>;

interface SaveGridPlantingProps {
  validation: PlantGridValidation;
  saving: boolean;
  grid: PlantGridData;
  request: GridPlantingRequest;
  offsetPacking: boolean;
  addPlantProps: AddPlantProps;
  setSaving(value: boolean): void;
}

export const saveGridPlanting = async (props: SaveGridPlantingProps) => {
  if (!props.validation.valid || props.saving) {
    props.validation.errors[0] &&
      error(t(props.validation.errors[0]));
    return;
  }
  props.setSaving(true);
  let resourceUuids: string[] = [];
  try {
    const initOptions = {
      grid: props.grid,
      openfarm_slug: props.request.cropSlug,
      itemName: props.request.itemName,
      gridId: props.request.gridId,
      offsetPacking: props.offsetPacking,
      designer: props.addPlantProps.designer,
    };
    const plants = initPlantGrid(initOptions);
    const batchAction = batchInitDirty<TaggedResource>(
      gridResourceKind(initOptions), plants);
    resourceUuids =
      batchAction.payload.map(resource => resource.uuid);
    props.addPlantProps.dispatch(batchAction);
    await props.addPlantProps.dispatch(saveGrid(
      props.request.gridId, resourceUuids));
    success(t("{{ count }} plants added.", {
      count: gridPlantCount(props.grid),
    }));
    props.addPlantProps.dispatch({
      type: Actions.SET_GRID_START,
      payload: { x: props.grid.startX, y: props.grid.startY },
    });
    props.addPlantProps.dispatch({
      type: Actions.SET_COMPANION_INDEX,
      payload: undefined,
    });
    props.addPlantProps.dispatch({
      type: Actions.SET_GRID_PLANTING,
      payload: undefined,
    });
  } catch {
    await props.addPlantProps.dispatch(stashGrid(
      props.request.gridId, resourceUuids));
    error(t("Unable to save the grid."));
    props.setSaving(false);
  }
};

export const GridPlanting = React.forwardRef<
  GridPlantingController,
  GridPlantingProps
>((props, ref) => {
  const request = props.addPlantProps.designer.gridPlanting;
  const [phase, setPhase] =
    React.useState<GridPlantingPhase>("pick-start");
  const [grid, setGrid] = React.useState(() => initialPlantGrid(
    props.addPlantProps.designer.gridStart,
    request?.defaultSpacing || 250,
    { x: 2, y: 2 },
  ));
  const [hover, setHover] = React.useState(
    props.addPlantProps.designer.gridStart);
  const [offsetPacking, setOffsetPacking] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const extentBaseGrid = React.useRef(grid);
  const pendingHover =
    React.useRef<{ x: number, y: number } | undefined>(undefined);
  const hoverFrame = React.useRef<number | undefined>(undefined);
  const getGardenPosition = React.useMemo(
    () => getGardenPositionFunc(props.config, false),
    [props.config],
  );
  const get3DPosition = React.useMemo(
    () => get3DPositionFunc(props.config),
    [props.config],
  );
  const updateHover = React.useCallback((
    event: ThreeEvent<MouseEvent>,
  ) => {
    pendingHover.current = roundPosition(
      getGardenPosition(event.point),
      props.addPlantProps.gridSize,
    );
    if (hoverFrame.current) { return; }
    hoverFrame.current = requestAnimationFrame(() => {
      hoverFrame.current = undefined;
      const next = pendingHover.current;
      if (!next) { return; }
      if (phase == "pick-extent") {
        const nextGrid = gridAtExtent(
          extentBaseGrid.current,
          next,
          request?.defaultSpacing || 250,
          props.addPlantProps.gridSize,
        );
        setGrid(nextGrid);
        setHover(terminalGardenPoint(nextGrid));
      } else {
        setHover(next);
      }
    });
  }, [
    getGardenPosition,
    phase,
    props.addPlantProps.gridSize,
    request?.defaultSpacing,
  ]);
  const onClick = React.useCallback((
    event: ThreeEvent<MouseEvent>,
  ) => {
    if (saving || clickWasDragged(event)) { return; }
    if (phase == "edit") { return; }
    event.stopPropagation();
    const position = roundPosition(
      getGardenPosition(event.point),
      props.addPlantProps.gridSize,
    );
    if (phase == "pick-start") {
      const nextGrid = gridAtStart(
        grid,
        position,
        request?.defaultSpacing || 250,
        props.addPlantProps.gridSize,
      );
      extentBaseGrid.current = nextGrid;
      setGrid(nextGrid);
      setHover(terminalGardenPoint(nextGrid));
      setPhase("pick-extent");
      return;
    }
    const nextGrid = gridAtExtent(
      extentBaseGrid.current,
      position,
      request?.defaultSpacing || 250,
      props.addPlantProps.gridSize,
    );
    setGrid(nextGrid);
    setHover(terminalGardenPoint(nextGrid));
    setPhase("edit");
  }, [
    getGardenPosition,
    grid,
    phase,
    props.addPlantProps.gridSize,
    request?.defaultSpacing,
    saving,
  ]);
  React.useImperativeHandle(ref, () => ({
    onPointerMove: updateHover,
    onClick,
  }), [onClick, updateHover]);
  React.useEffect(() => () => {
    hoverFrame.current && cancelAnimationFrame(hoverFrame.current);
  }, []);
  React.useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key == "Escape" && !saving) {
        props.addPlantProps.dispatch({
          type: Actions.SET_GRID_PLANTING,
          payload: undefined,
        });
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [props.addPlantProps, saving]);
  if (!request) { return <></>; }
  const previewGrid = phase == "pick-start"
    ? gridAtStart(
      grid,
      hover,
      request.defaultSpacing,
      props.addPlantProps.gridSize,
    )
    : grid;
  const validation = validatePlantGrid(
    grid,
    offsetPacking,
    props.addPlantProps.gridSize,
  );
  const previewValidation = validatePlantGrid(
    previewGrid,
    offsetPacking,
    props.addPlantProps.gridSize,
  );
  const metadata = findCropMetadata(request.cropSlug);
  const icon = findCropIcon(request.cropSlug);
  const size =
    (props.addPlantProps.designer.cropRadius || DEFAULT_PLANT_RADIUS) * 2;
  const previewPlants: ThreeDGardenPlant[] =
    previewValidation.points
      .map(([x, y], index) => ({
        id: undefined,
        label: request.itemName,
        icon,
        size,
        spread: metadata.spread,
        x,
        y,
        key: `grid-preview-${index}`,
        seed: 0,
      }));
  const startWorld = get3DPosition(gardenStart(grid));
  const popupPosition: [number, number, number] = [
    startWorld.x,
    startWorld.y,
    zZero(props.config) + props.getZ(grid.startX, grid.startY)
      + GRID_POPUP_Z,
  ];
  const cancel = () => !saving && props.addPlantProps.dispatch({
    type: Actions.SET_GRID_PLANTING,
    payload: undefined,
  });
  const useCurrentPosition = (position: Record<"x" | "y", number>) => {
    if (!isNumber(position.x) || !isNumber(position.y)) { return; }
    const start = clampGridStart(
      grid,
      offsetPacking,
      position,
      props.addPlantProps.gridSize,
    );
    setGrid(current => ({
      ...current,
      startX: start.x,
      startY: start.y,
    }));
  };
  return <Group name={"grid-planting"}>
    <PlantInstances
      plants={previewPlants}
      config={props.config}
      getZ={props.getZ}
      visible={true} />
    {phase == "pick-start" &&
      <Billboard
        follow={true}
        position={[
          get3DPosition(hover).x,
          get3DPosition(hover).y,
          zZero(props.config) + props.getZ(hover.x, hover.y) + size + 45,
        ]}>
        <Text
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          fontSize={34}
          color={"white"}>
          {t("Click to set grid start")}
        </Text>
      </Billboard>}
    {phase == "pick-extent" &&
      <Billboard
        follow={true}
        position={[
          get3DPosition(hover).x,
          get3DPosition(hover).y,
          zZero(props.config) + props.getZ(hover.x, hover.y) + size + 45,
        ]}>
        <Text
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          fontSize={34}
          color={"white"}>
          {t("Click to set grid size")}
        </Text>
      </Billboard>}
    {phase == "edit" &&
      <>
        <GridPlantingControls
          config={props.config}
          grid={grid}
          offsetPacking={offsetPacking}
          gridSize={props.addPlantProps.gridSize}
          getZ={props.getZ}
          onChange={setGrid} />
        <GridPlantingPopup
          position={popupPosition}
          grid={grid}
          offsetPacking={offsetPacking}
          disabled={saving}
          errors={validation.errors}
          addPlantProps={props.addPlantProps}
          onChange={(key, value) =>
            setGrid(current => ({ ...current, [key]: value }))}
          onUseCurrentPosition={useCurrentPosition}
          onTogglePacking={() => {
            setOffsetPacking(current => !current);
            !offsetPacking && setGrid(current => ({
              ...current,
              spacingH: mathRound(0.866 * current.spacingV),
            }));
          }}
          onSave={() => {
            void saveGridPlanting({
              validation,
              saving,
              grid,
              request,
              offsetPacking,
              addPlantProps: props.addPlantProps,
              setSaving,
            });
          }}
          onCancel={cancel} />
      </>}
  </Group>;
});

GridPlanting.displayName = "GridPlanting";
