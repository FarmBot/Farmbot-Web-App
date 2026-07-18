import React from "react";
import { Billboard, Html, Line } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { clamp, range } from "lodash";
import { Config } from "../../config";
import {
  extents as extentsFunc,
  get3DPositionFunc, getGardenPositionFunc,
  zero as zeroFunc,
  zZero,
} from "../../helpers";
import { Group } from "../../components";
import type { AddPlantProps } from "../bed";
import {
  PlantGridData, PlantGridKey,
} from "../../../plants/grid/interfaces";
import {
  clampGridStart,
  DEFAULT_POINT_GRID_RADIUS,
  DEFAULT_POINT_GRID_SPACING,
  gridAxisFromDrag,
  gridFromExtent,
  gridPlantCount,
  GRID_SPACING_STEP,
  initialPlantGrid,
  PlantGridValidation,
  quantizeGridInputValue,
  validatePlantGrid,
} from "../../../plants/grid/grid_math";
import {
  gridResourceKind, initPlantGrid,
} from "../../../plants/grid/generate_grid";
import {
  findCropIcon, findCropMetadata, DEFAULT_PLANT_RADIUS,
} from "../../../crops/metadata";
import {
  PlantInstances, PlantSpreadInstances, PointInstances,
  POINT_PIN_HEIGHT, ThreeDGardenPlant,
} from "../../garden";
import { clickWasDragged } from "../../click_event";
import { t } from "../../../i18next_wrapper";
import { batchInitDirty } from "../../../api/crud";
import { saveGrid, stashGrid } from "../../../plants/grid/thunks";
import { Actions } from "../../../constants";
import { error, success } from "../../../toast/toast";
import { Text } from "../../elements";
import { GridPlantingRequest } from "../../../farm_designer/interfaces";
import {
  TaggedGenericPointer, TaggedResource, TaggedWeedPointer,
  uuid,
} from "farmbot";
import { ResourceColor } from "../../../interfaces";
import { ColorPickerCluster } from "../../../ui";
import {
  ControlArrow, ControlDragEvent, ControlHandle, ControlLabel,
  ControlSphere, CONTROL_ARROW_WIDTH, CONTROL_COLORS, CONTROL_RENDER_ORDER,
  noControlRaycast, planeConstraint, stopThreeDPopupEvent,
} from "../../controls";
import {
  AlignmentIndicatorController, AlignmentIndicators,
} from "./alignment_indicators";
import {
  ActivePositionRef, PlantPlacementSphere,
} from "./pointer_objects";
import {
  PlacementCoordinateLabel,
} from "./placement_coordinate_label";
import { NavigateFunction } from "react-router";
import { Path } from "../../../internal_urls";

export type GridPlantingPhase =
  | "pick-start"
  | "pick-extent"
  | "edit";
type GridAxis = "x" | "y";

const GRID_CONTROL_FOREGROUND_PROPS = {
  transparent: true,
  depthTest: false,
  depthWrite: false,
  renderOrder: CONTROL_RENDER_ORDER,
} as const;

const GRID_CONTROL_OBJECT_PROPS = {
  transparent: true,
  depthTest: true,
  depthWrite: true,
  renderOrder: CONTROL_RENDER_ORDER,
} as const;

const gridStartHelpersVisible = (
  phase: GridPlantingPhase,
  adjustingStart: boolean,
) =>
  phase == "pick-start" || (phase == "edit" && adjustingStart);
type GridDragKind =
  | "start"
  | "start-x"
  | "start-y"
  | "spacing-x"
  | "spacing-y"
  | "extent";

export interface GridPlantingController {
  onPointerMove(event: ThreeEvent<MouseEvent>): void;
  onClick(event: ThreeEvent<MouseEvent>): void;
}

export interface GridPlantingProps {
  config: Config;
  addPlantProps: AddPlantProps;
  mapPoints: TaggedGenericPointer[];
  plants: ThreeDGardenPlant[];
  weeds: TaggedWeedPointer[];
  showPlants: boolean;
  showPoints: boolean;
  showWeeds: boolean;
  activePositionRef: ActivePositionRef;
  getZ(x: number, y: number): number;
  navigate: NavigateFunction;
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

const GRID_START_CONTROL_Z = 125;
const GRID_EXTENT_CONTROL_Z = 150;
const GRID_SPACING_CONTROL_Z = 20;
const GRID_ACTION_Z = 200;
const GRID_SPACING_OFFSET = 100;
const GRID_MARKER_RADIUS = 28;
const GRID_START_ARROW_LENGTH = 130;
const POINT_RADIUS_STEP = 10;
const POINT_RADIUS_CONTROL_Z = 20;
const POINT_RADIUS_ARROW_LENGTH = 100;

const roundPosition = (
  position: { x: number, y: number },
  gridSize: { x: number, y: number },
) => ({
  x: clamp(Math.round(position.x / 10) * 10, 0, gridSize.x),
  y: clamp(Math.round(position.y / 10) * 10, 0, gridSize.y),
});

export const isPointGridRequest = (
  request: GridPlantingRequest | undefined,
) => request?.gridType == "point";

export const quantizePointRadius = (radius: number) =>
  Math.max(
    0,
    Math.round(radius / POINT_RADIUS_STEP) * POINT_RADIUS_STEP,
  );

const axisGridKey = (
  axis: GridAxis,
  kind: "start" | "spacing",
): PlantGridKey => {
  if (kind == "start") { return axis == "x" ? "startX" : "startY"; }
  return axis == "x" ? "spacingH" : "spacingV";
};

const gardenStart = (grid: PlantGridData) => ({
  x: grid.startX,
  y: grid.startY,
});

export const gridActionControlPosition = (
  config: Config,
  grid: PlantGridData,
  getZ: (x: number, y: number) => number,
): [number, number, number] => {
  const start = gardenStart(grid);
  const world = get3DPositionFunc(config)(start);
  return [
    world.x,
    world.y,
    zZero(config) + getZ(start.x, start.y) + GRID_ACTION_Z,
  ];
};

const terminalGardenPoint = (grid: PlantGridData) => ({
  x: grid.startX + grid.spacingH * (grid.numPlantsH - 1),
  y: grid.startY + grid.spacingV * (grid.numPlantsV - 1),
});

const spacingControlSoilZ = (
  grid: PlantGridData,
  getZ: (x: number, y: number) => number,
) => {
  let highestZ = getZ(grid.startX, grid.startY);
  const include = (xIndex: number, yIndex: number) => {
    highestZ = Math.max(highestZ, getZ(
      grid.startX + grid.spacingH * xIndex,
      grid.startY + grid.spacingV * yIndex,
    ));
  };
  range(Math.min(2, grid.numPlantsH)).forEach(xIndex =>
    range(grid.numPlantsV).forEach(yIndex =>
      include(xIndex, yIndex)));
  range(Math.min(2, grid.numPlantsV)).forEach(yIndex =>
    range(grid.numPlantsH).forEach(xIndex =>
      include(xIndex, yIndex)));
  return highestZ;
};

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
  gridSize: { x: number, y: number },
) => gridFromExtent({
  start: { x: baseGrid.startX, y: baseGrid.startY },
  pointer,
  spacing: {
    x: Math.abs(baseGrid.spacingH),
    y: Math.abs(baseGrid.spacingV),
  },
  previousSpacing: {
    x: baseGrid.spacingH,
    y: baseGrid.spacingV,
  },
  gridSize,
});

const axisGardenPoint = (
  start: { x: number, y: number },
  axis: GridAxis,
  distance: number,
) => axis == "x"
  ? { x: start.x + distance, y: start.y }
  : { x: start.x, y: start.y + distance };

interface GridPlantingControlsProps {
  config: Config;
  grid: PlantGridData;
  gridSize: { x: number, y: number };
  getZ(x: number, y: number): number;
  onChange(grid: PlantGridData): void;
  pointRadius?: number;
  pointColor?: ResourceColor;
  onPointRadiusChange?(radius: number): void;
  onStartInteractionChange?(active: boolean): void;
}

interface GridDragUpdateProps {
  drag: GridDragState;
  point: { x: number, y: number };
  gridSize: { x: number, y: number };
  offsetPacking: boolean;
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
    10,
  );
  return {
    ...drag.startGrid,
    startX: drag.kind == "start-y" ? drag.startGrid.startX : start.x,
    startY: drag.kind == "start-x" ? drag.startGrid.startY : start.y,
  };
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
  const pointerValue = props.point[axis] + props.drag.offset[axis];
  const previousSpacing = axis == "x"
    ? startGrid.spacingH
    : startGrid.spacingV;
  const quantized = quantizeGridInputValue(
    axisGridKey(axis, "spacing"),
    Math.round(pointerValue - startValue),
  );
  const direction = Math.sign(quantized)
    || Math.sign(previousSpacing)
    || 1;
  const available = direction > 0
    ? props.gridSize[axis] - startValue
    : startValue;
  const intervals = Math.max(0, count - 1);
  if (intervals > 0 &&
    available < GRID_SPACING_STEP * intervals) {
    return startGrid;
  }
  const availableSpacing = count > 1
    ? Math.floor(available / intervals)
    : props.gridSize[axis];
  const maxSpacing = Math.max(
    GRID_SPACING_STEP,
    Math.floor(availableSpacing / GRID_SPACING_STEP) * GRID_SPACING_STEP,
  );
  const spacing = direction * clamp(
    Math.abs(quantized) || GRID_SPACING_STEP,
    GRID_SPACING_STEP,
    maxSpacing,
  );
  return {
    ...startGrid,
    [axisGridKey(axis, "spacing")]: spacing,
  };
};

const extentDragUpdate = (props: GridDragUpdateProps) => {
  const { startGrid } = props.drag;
  const pointer = {
    x: props.point.x + props.drag.offset.x,
    y: props.point.y + props.drag.offset.y,
  };
  const x = gridAxisFromDrag(
    startGrid.startX,
    pointer.x,
    startGrid.spacingH,
    1,
    props.gridSize.x,
  );
  const y = gridAxisFromDrag(
    startGrid.startY,
    pointer.y,
    startGrid.spacingV,
    x.count,
    props.gridSize.y,
  );
  return {
    ...startGrid,
    spacingH: x.spacing,
    spacingV: y.spacing,
    numPlantsH: x.count,
    numPlantsV: y.count,
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
  return extentDragUpdate(props);
};

interface GridControlHandlerProps extends GridPlantingControlsProps {
  startControlZ: number;
  extentControlZ: number;
  spacingZ: number;
}

const isStartDragKind = (kind: GridDragKind) =>
  kind == "start" || kind == "start-x" || kind == "start-y";

export const useGridControlHandlers = (props: GridControlHandlerProps) => {
  const drag =
    React.useRef<GridDragState | undefined>(undefined);
  const lastGrid =
    React.useRef<PlantGridData | undefined>(undefined);
  const getGardenPosition = React.useMemo(
    () => getGardenPositionFunc(props.config, false),
    [props.config],
  );
  const pointFromEvent = (event: ControlDragEvent) =>
    getGardenPosition(event.point);
  const startDrag = (
    kind: GridDragKind,
    event: ControlDragEvent,
  ) => {
    const point = pointFromEvent(event);
    const anchor = {
      x: props.grid.startX,
      y: props.grid.startY,
    };
    if (kind == "spacing-x") {
      anchor.x += props.grid.spacingH;
    }
    if (kind == "spacing-y") {
      anchor.y += props.grid.spacingV;
    }
    if (kind == "extent") {
      const terminal = terminalGardenPoint(props.grid);
      anchor.x = terminal.x;
      anchor.y = terminal.y;
    }
    drag.current = {
      kind,
      startGrid: props.grid,
      offset: {
        x: anchor.x - point.x,
        y: anchor.y - point.y,
      },
    };
    lastGrid.current = undefined;
    isStartDragKind(kind) && props.onStartInteractionChange?.(true);
  };
  const updateDrag = (event: ControlDragEvent) => {
    const activeDrag = drag.current;
    if (!activeDrag) { return; }
    const point = pointFromEvent(event);
    const next = gridDragUpdate({
      drag: activeDrag,
      point,
      gridSize: props.gridSize,
      offsetPacking: false,
    });
    const previousGrid = lastGrid.current;
    if (previousGrid
      && Object.entries(next).every(([key, value]) =>
        previousGrid[key as PlantGridKey] == value)) {
      return;
    }
    lastGrid.current = next;
    props.onChange(next);
  };
  const finishDrag = () => {
    const activeDrag = drag.current;
    if (!activeDrag) { return; }
    isStartDragKind(activeDrag.kind)
      && props.onStartInteractionChange?.(false);
    drag.current = undefined;
    lastGrid.current = undefined;
  };
  const cancelDrag = () => {
    const activeDrag = drag.current;
    if (!activeDrag) { return; }
    isStartDragKind(activeDrag.kind)
      && props.onStartInteractionChange?.(false);
    drag.current = undefined;
    lastGrid.current = undefined;
  };
  const handlers = (kind: GridDragKind) => {
    let controlZ = props.startControlZ;
    if (kind == "spacing-x" || kind == "spacing-y") {
      controlZ = props.spacingZ;
    } else if (kind == "extent") {
      controlZ = props.extentControlZ;
    }
    return {
      constraint: planeConstraint("xy", [0, 0, controlZ]),
      onDragStart: (event: ControlDragEvent) =>
        startDrag(kind, event),
      onDrag: (event: ControlDragEvent) =>
        updateDrag(event),
      onDragEnd: (_event: ControlDragEvent) => finishDrag(),
      onDragCancel: cancelDrag,
    };
  };
  return { handlers };
};

interface PointRadiusControlProps {
  config: Config;
  grid: PlantGridData;
  radius: number;
  color: ResourceColor;
  z: number;
  showLabel?: boolean;
  onChange(radius: number): void;
}

const pointRadiusDirection = (grid: PlantGridData) => ({
  x: -(Math.sign(grid.spacingH) || 1) / Math.sqrt(2),
  y: -(Math.sign(grid.spacingV) || 1) / Math.sqrt(2),
});

const pointRadiusEnd = (
  grid: PlantGridData,
  radius: number,
) => {
  const direction = pointRadiusDirection(grid);
  return {
    x: grid.startX + direction.x * radius,
    y: grid.startY + direction.y * radius,
  };
};

export const PointRadiusControl = (props: PointRadiusControlProps) => {
  const dragStart = React.useRef({
    radius: props.radius,
    projection: 0,
  });
  const getGardenPosition = React.useMemo(
    () => getGardenPositionFunc(props.config, false),
    [props.config],
  );
  const get3DPosition = React.useMemo(
    () => get3DPositionFunc(props.config),
    [props.config],
  );
  const startGarden = gardenStart(props.grid);
  const direction = pointRadiusDirection(props.grid);
  const endGarden = pointRadiusEnd(props.grid, props.radius);
  const arrowStartGarden = pointRadiusEnd(
    props.grid,
    props.radius + POINT_RADIUS_ARROW_LENGTH,
  );
  const start = { ...get3DPosition(arrowStartGarden), z: props.z };
  const end = { ...get3DPosition(endGarden), z: props.z };
  const projection = (point: { x: number, y: number }) =>
    (point.x - startGarden.x) * direction.x
    + (point.y - startGarden.y) * direction.y;
  const update = (event: ControlDragEvent) => {
    const pointer = getGardenPosition(event.point);
    props.onChange(quantizePointRadius(
      dragStart.current.radius
      + projection(pointer)
      - dragStart.current.projection,
    ));
  };
  return <ControlHandle
    name={"grid-point-radius-control"}
    constraint={planeConstraint("xy", [0, 0, props.z])}
    onDragStart={event => {
      const pointer = getGardenPosition(event.point);
      dragStart.current = {
        radius: props.radius,
        projection: projection(pointer),
      };
    }}
    onDrag={update}
    onDragEnd={update}>
    {state =>
      <ControlArrow
        name={"grid-point-radius-arrow"}
        start={[start.x, start.y, start.z]}
        end={[end.x, end.y, end.z]}
        width={CONTROL_ARROW_WIDTH}
        color={props.color}
        hoverColor={props.color}
        hovered={state.hovered}
        heads={"end"}
        headLength={40}
        headWidthScale={1.7}
        label={props.showLabel === false
          ? undefined
          : `r${props.radius}`}
        labelVisible={state.hovered || state.dragging}
        labelDepthTest={false}
        labelDepthWrite={false}
        labelRenderOrder={CONTROL_RENDER_ORDER}
        {...GRID_CONTROL_OBJECT_PROPS} />}
  </ControlHandle>;
};

// eslint-disable-next-line complexity
export const GridPlantingControls = (props: GridPlantingControlsProps) => {
  const point = (value: Point3): [number, number, number] =>
    [value.x, value.y, value.z];
  const get3DPosition = React.useMemo(
    () => get3DPositionFunc(props.config),
    [props.config],
  );
  const startGarden = gardenStart(props.grid);
  const startXY = get3DPosition(startGarden);
  const startPlantZ = zZero(props.config)
    + props.getZ(startGarden.x, startGarden.y);
  const startControlZ = startPlantZ + GRID_START_CONTROL_Z;
  const extentControlZ = startPlantZ + GRID_EXTENT_CONTROL_Z;
  const spacingZ = zZero(props.config)
    + spacingControlSoilZ(props.grid, props.getZ)
    + GRID_SPACING_CONTROL_Z;
  const start: Point3 = { ...startXY, z: startControlZ };
  const worldPoint = (garden: { x: number, y: number }): Point3 => ({
    ...get3DPosition(garden),
    z: startControlZ,
  });
  const { handlers } = useGridControlHandlers({
    ...props,
    startControlZ,
    extentControlZ,
    spacingZ,
  });
  const startCoordinateLabel = () =>
    <PlacementCoordinateLabel
      coordinates={{
        x: startGarden.x,
        y: startGarden.y,
        z: props.getZ(startGarden.x, startGarden.y),
      }}
      position={[
        start.x,
        start.y,
        start.z + GRID_MARKER_RADIUS + 30,
      ]} />;
  const startSphereHandlers = handlers("start");
  const axisControls = (["x", "y"] as GridAxis[]).map(axis => {
    const axisStartGarden =
      axisGardenPoint(startGarden, axis, GRID_MARKER_RADIUS);
    const axisEndGarden =
      axisGardenPoint(startGarden, axis, GRID_START_ARROW_LENGTH);
    const axisStart = worldPoint(axisStartGarden);
    const axisEnd = worldPoint(axisEndGarden);
    const startHandlers = handlers(`start-${axis}`);
    const perpendicularAxis = axis == "x" ? "y" : "x";
    const perpendicularSpacing = axis == "x"
      ? props.grid.spacingV
      : props.grid.spacingH;
    const spacingStartGarden = axisGardenPoint(
      startGarden,
      perpendicularAxis,
      -Math.sign(perpendicularSpacing || 1) * GRID_SPACING_OFFSET,
    );
    const spacing = axis == "x"
      ? props.grid.spacingH
      : props.grid.spacingV;
    const axisCount = axis == "x"
      ? props.grid.numPlantsH
      : props.grid.numPlantsV;
    const secondGarden = axisGardenPoint(
      spacingStartGarden, axis, spacing);
    const spacingStart = {
      ...worldPoint(spacingStartGarden),
      z: spacingZ,
    };
    const second = {
      ...worldPoint(secondGarden),
      z: spacingZ,
    };
    const perpendicularCount = axis == "x"
      ? props.grid.numPlantsV
      : props.grid.numPlantsH;
    const perpendicularExtent =
      perpendicularSpacing * (perpendicularCount - 1);
    const firstRowEndGarden = axisGardenPoint(
      startGarden, perpendicularAxis, perpendicularExtent);
    const secondRowStartGarden = axisGardenPoint(
      startGarden, axis, spacing);
    const secondRowEndGarden = axisGardenPoint(
      secondRowStartGarden, perpendicularAxis, perpendicularExtent);
    const firstRowEnd = {
      ...get3DPosition(firstRowEndGarden),
      z: spacingZ,
    };
    const secondRowEnd = {
      ...get3DPosition(secondRowEndGarden),
      z: spacingZ,
    };
    const spacingHandlers = handlers(`spacing-${axis}`);
    return <React.Fragment key={axis}>
      <ControlHandle
        name={`grid-start-${axis}-arrow`}
        onHoverChange={props.onStartInteractionChange}
        {...startHandlers}>
        {state => <>
          <ControlArrow
            name={`grid-start-${axis}-arrow-shape`}
            start={point(axisStart)}
            end={point(axisEnd)}
            width={CONTROL_ARROW_WIDTH}
            colorType={axis}
            hovered={state.hovered}
            headLength={40}
            headWidthScale={1.7}
            {...GRID_CONTROL_OBJECT_PROPS} />
          {(state.hovered || state.dragging) && startCoordinateLabel()}
        </>}
      </ControlHandle>
      {axisCount > 1 &&
        <ControlHandle
          name={`grid-spacing-${axis}-control`}
          {...spacingHandlers}>
          {state => <>
            {(state.hovered || state.dragging) &&
              <>
                <Line
                  name={`grid-spacing-${axis}-first-row-guide`}
                  points={[point(spacingStart), point(firstRowEnd)]}
                  color={CONTROL_COLORS.primary}
                  lineWidth={2}
                  raycast={noControlRaycast}
                  {...GRID_CONTROL_OBJECT_PROPS} />
                <Line
                  name={`grid-spacing-${axis}-second-row-guide`}
                  points={[point(second), point(secondRowEnd)]}
                  color={CONTROL_COLORS.primary}
                  lineWidth={2}
                  raycast={noControlRaycast}
                  {...GRID_CONTROL_OBJECT_PROPS} />
              </>}
            <ControlArrow
              name={`grid-spacing-${axis}-arrow`}
              start={point(spacingStart)}
              end={point(second)}
              width={CONTROL_ARROW_WIDTH}
              colorType={"primary"}
              hovered={state.hovered}
              heads={"end"}
              headLength={40}
              headWidthScale={1.7}
              {...GRID_CONTROL_OBJECT_PROPS}
              label={`${Math.abs(spacing)}mm`}
              labelDepthTest={false}
              labelDepthWrite={false}
              labelRenderOrder={CONTROL_RENDER_ORDER}
              labelVisible={state.hovered || state.dragging} />
          </>}
        </ControlHandle>}
    </React.Fragment>;
  });
  const terminalGarden = terminalGardenPoint(props.grid);
  const terminalWorld = {
    ...get3DPosition(terminalGarden),
    z: zZero(props.config)
      + props.getZ(terminalGarden.x, terminalGarden.y)
      + GRID_EXTENT_CONTROL_Z,
  };
  return <Group name={"grid-planting-controls"}>
    {props.pointRadius !== undefined && props.onPointRadiusChange &&
      <PointRadiusControl
        config={props.config}
        grid={props.grid}
        radius={props.pointRadius}
        color={props.pointColor || "green"}
        z={startPlantZ + POINT_RADIUS_CONTROL_Z}
        onChange={props.onPointRadiusChange} />}
    <ControlHandle
      name={"grid-start-marker-control"}
      onHoverChange={props.onStartInteractionChange}
      {...startSphereHandlers}>
      {state => <>
        <ControlSphere
          name={"grid-start-marker"}
          position={point(start)}
          radius={GRID_MARKER_RADIUS}
          colorType={"origin"}
          hovered={state.hovered}
          {...GRID_CONTROL_OBJECT_PROPS} />
        {(state.hovered || state.dragging) && startCoordinateLabel()}
      </>}
    </ControlHandle>
    {axisControls}
    <ControlHandle
      name={"grid-extent-marker-control"}
      {...handlers("extent")}>
      {state => <>
        <ControlSphere
          name={"grid-extent-marker"}
          position={point(terminalWorld)}
          radius={GRID_MARKER_RADIUS}
          colorType={"primary"}
          hovered={state.hovered}
          {...GRID_CONTROL_OBJECT_PROPS} />
        <ControlLabel
          name={"grid-extent-label"}
          position={point({
            ...terminalWorld,
            z: terminalWorld.z + GRID_MARKER_RADIUS + 30,
          })}
          fontSize={34}
          color={"white"}
          visible={state.hovered || state.dragging}
          {...GRID_CONTROL_FOREGROUND_PROPS}>
          {`${props.grid.numPlantsH} x ${props.grid.numPlantsV}`}
        </ControlLabel>
      </>}
    </ControlHandle>
  </Group>;
};

interface GridFinalAdjustmentProps extends GridPlantingControlsProps {
  phase: GridPlantingPhase;
  position: [number, number, number];
  saving: boolean;
  pointColor?: ResourceColor;
  onPointColorChange?(color: ResourceColor): void;
  onCancel(): void;
  onSave(): void;
}

const GridFinalAdjustment = (props: GridFinalAdjustmentProps) => {
  const { onSave, phase } = props;
  const [colorPickerOpen, setColorPickerOpen] = React.useState(false);
  React.useEffect(() => {
    if (phase != "edit") { return; }
    const saveOnEnter = (event: KeyboardEvent) => {
      if (event.key != "Enter") { return; }
      event.preventDefault();
      onSave();
    };
    window.addEventListener("keydown", saveOnEnter);
    return () => window.removeEventListener("keydown", saveOnEnter);
  }, [onSave, phase]);
  if (phase != "edit") { return <></>; }
  return <>
    <GridPlantingControls
      config={props.config}
      grid={props.grid}
      gridSize={props.gridSize}
      getZ={props.getZ}
      onChange={props.onChange}
      pointRadius={props.pointRadius}
      pointColor={props.pointColor}
      onPointRadiusChange={props.onPointRadiusChange}
      onStartInteractionChange={props.onStartInteractionChange} />
    <Html
      name={"grid-action-controls"}
      wrapperClass={"grid-action-controls-wrapper"}
      center={true}
      position={props.position}>
      <div
        data-testid={"grid-action-controls"}
        className={"grid-action-controls"}
        onPointerDown={stopThreeDPopupEvent}
        onContextMenu={stopThreeDPopupEvent}
        onWheel={stopThreeDPopupEvent}
        onClick={stopThreeDPopupEvent}>
        <button
          type={"button"}
          name={"grid-cancel-control"}
          className={
            "grid-action-button grid-action-cancel fa fa-times"}
          title={t("Cancel")}
          aria-label={t("Cancel")}
          disabled={props.saving}
          onClick={props.onCancel} />
        {props.pointColor && props.onPointColorChange &&
          <div className={"grid-point-color-picker"}>
            <button
              type={"button"}
              name={"grid-point-color-control"}
              className={[
                "grid-action-button",
                "grid-action-color",
                "fa",
                "fa-paint-brush",
                props.pointColor,
              ].join(" ")}
              title={t("Select color")}
              aria-label={t("Select color")}
              disabled={props.saving}
              onClick={() => setColorPickerOpen(!colorPickerOpen)} />
            {colorPickerOpen &&
              <div className={"grid-point-color-menu colorpicker-menu"}>
                <ColorPickerCluster
                  current={props.pointColor}
                  onChange={color => {
                    props.onPointColorChange?.(color);
                    setColorPickerOpen(false);
                  }} />
              </div>}
          </div>}
        <button
          type={"button"}
          name={"grid-save-control"}
          className={
            "grid-action-button grid-action-save fa fa-check"}
          title={t("Save")}
          aria-label={t("Save")}
          disabled={props.saving}
          onClick={props.onSave} />
      </div>
    </Html>
  </>;
};

interface SaveGridPlantingProps {
  validation: PlantGridValidation;
  saving: boolean;
  grid: PlantGridData;
  request: GridPlantingRequest;
  pointRadius?: number;
  pointColor?: ResourceColor;
  offsetPacking: boolean;
  addPlantProps: AddPlantProps;
  setSaving(value: boolean): void;
  onSuccess(): void;
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
      radius: props.pointRadius,
      z: props.request.z,
      meta: {
        ...props.request.meta,
        ...(props.pointColor ? { color: props.pointColor } : {}),
      },
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
    const pointGrid = isPointGridRequest(props.request);
    success(t("{{ count }} {{ itemType }} added.", {
      count: gridPlantCount(props.grid),
      itemType: pointGrid ? t("points") : t("plants"),
    }));
    props.addPlantProps.dispatch({
      type: Actions.SET_GRID_START,
      payload: { x: props.grid.startX, y: props.grid.startY },
    });
    !pointGrid && props.addPlantProps.dispatch({
      type: Actions.SET_COMPANION_INDEX,
      payload: undefined,
    });
    props.addPlantProps.dispatch({
      type: Actions.SET_GRID_PLANTING,
      payload: pointGrid
        ? undefined
        : {
          ...props.request,
          gridId: uuid(),
        },
    });
  } catch {
    await props.addPlantProps.dispatch(stashGrid(
      props.request.gridId, resourceUuids));
    error(t("Unable to save the grid."));
    props.setSaving(false);
    return;
  }
  props.setSaving(false);
  props.onSuccess();
};

export const GridPlanting = React.forwardRef<
  GridPlantingController,
  GridPlantingProps
  // eslint-disable-next-line complexity
>((props, ref) => {
  const { activePositionRef } = props;
  const request = props.addPlantProps.designer.gridPlanting;
  const pointGrid = isPointGridRequest(request);
  /* eslint-disable react-hooks/refs */
  const [initialStart] = React.useState(() => {
    const activePosition = activePositionRef.current;
    return roundPosition(
      activePosition
        ? getGardenPositionFunc(props.config, false)(activePosition)
        : props.addPlantProps.designer.gridStart,
      props.addPlantProps.gridSize,
    );
  });
  /* eslint-enable react-hooks/refs */
  const [phase, setPhase] =
    React.useState<GridPlantingPhase>("pick-start");
  const [grid, setGrid] = React.useState(() => initialPlantGrid(
    initialStart,
    pointGrid
      ? DEFAULT_POINT_GRID_SPACING
      : request?.defaultSpacing || 250,
    { x: 2, y: 2 },
  ));
  const [hover, setHover] = React.useState(initialStart);
  const [saving, setSaving] = React.useState(false);
  const [adjustingStart, setAdjustingStart] = React.useState(false);
  const [pointRadius, setPointRadius] =
    React.useState(DEFAULT_POINT_GRID_RADIUS);
  const pointColor =
    (request?.meta?.color || "green") as ResourceColor;
  const extentBaseGrid = React.useRef(grid);
  const pendingHover =
    React.useRef<{ x: number, y: number } | undefined>(undefined);
  const hoverFrame = React.useRef<number | undefined>(undefined);
  const alignmentIndicatorRef =
    React.useRef<AlignmentIndicatorController>(
      // eslint-disable-next-line no-null/no-null
      null);
  const previewSpreadPositionRef = React.useRef({ x: 0, y: 0 });
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
    const nextPosition = roundPosition(
      getGardenPosition(event.point),
      props.addPlantProps.gridSize,
    );
    pendingHover.current = nextPosition;
    activePositionRef.current = get3DPosition(nextPosition);
    if (hoverFrame.current) { return; }
    hoverFrame.current = requestAnimationFrame(() => {
      hoverFrame.current = undefined;
      const next = pendingHover.current;
      if (!next) { return; }
      if (phase == "pick-extent") {
        const nextGrid = gridAtExtent(
          extentBaseGrid.current,
          next,
          props.addPlantProps.gridSize,
        );
        setGrid(nextGrid);
        setHover(terminalGardenPoint(nextGrid));
      } else {
        setHover(next);
      }
    });
  }, [
    get3DPosition,
    getGardenPosition,
    phase,
    activePositionRef,
    props.addPlantProps.gridSize,
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
      const spacing = pointGrid
        ? DEFAULT_POINT_GRID_SPACING
        : request?.defaultSpacing || 250;
      const nextGrid = gridAtStart(
        grid,
        position,
        spacing,
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
      props.addPlantProps.gridSize,
    );
    setGrid(nextGrid);
    setHover(terminalGardenPoint(nextGrid));
    setPhase("edit");
  }, [
    getGardenPosition,
    grid,
    phase,
    pointGrid,
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
  const validation = React.useMemo(() => validatePlantGrid(
    grid,
    false,
    props.addPlantProps.gridSize,
  ), [grid, props.addPlantProps.gridSize]);
  const restartAt = React.useCallback((position: { x: number, y: number }) => {
    const nextHover = roundPosition(
      position,
      props.addPlantProps.gridSize,
    );
    const nextGrid = initialPlantGrid(
      nextHover,
      pointGrid
        ? DEFAULT_POINT_GRID_SPACING
        : request?.defaultSpacing || 250,
      { x: 2, y: 2 },
    );
    if (hoverFrame.current) {
      cancelAnimationFrame(hoverFrame.current);
      hoverFrame.current = undefined;
    }
    pendingHover.current = undefined;
    extentBaseGrid.current = nextGrid;
    setAdjustingStart(false);
    setGrid(nextGrid);
    setHover(nextHover);
    if (pointGrid) {
      setPointRadius(DEFAULT_POINT_GRID_RADIUS);
      const drawnPoint = props.addPlantProps.designer.drawnPoint;
      drawnPoint && props.addPlantProps.dispatch({
        type: Actions.SET_DRAWN_POINT_DATA,
        payload: {
          ...drawnPoint,
          r: DEFAULT_POINT_GRID_RADIUS,
        },
      });
    }
    setPhase("pick-start");
  }, [
    props.addPlantProps,
    pointGrid,
    request?.defaultSpacing,
  ]);
  const restart = React.useCallback(() => {
    restartAt(props.addPlantProps.designer.gridStart);
  }, [
    props.addPlantProps.designer.gridStart,
    restartAt,
  ]);
  const showStartHelpers = gridStartHelpersVisible(phase, adjustingStart);
  const alignmentPosition = phase == "pick-start"
    ? hover
    : gardenStart(grid);
  React.useLayoutEffect(() => {
    if (request && showStartHelpers) {
      alignmentIndicatorRef.current?.update(alignmentPosition);
    }
  }, [
    alignmentPosition,
    request,
    showStartHelpers,
  ]);
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key != "Escape") { return; }
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      if (saving) { return; }
      setAdjustingStart(false);
      if (phase == "edit") {
        extentBaseGrid.current = grid;
        setHover(terminalGardenPoint(grid));
        setPhase("pick-extent");
        return;
      }
      if (phase == "pick-extent") {
        setHover(gardenStart(grid));
        setPhase("pick-start");
        return;
      }
      props.addPlantProps.dispatch({
        type: Actions.SET_GRID_PLANTING,
        payload: undefined,
      });
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [
    grid,
    phase,
    props.addPlantProps,
    saving,
  ]);
  if (!request) { return <></>; }
  const updatePointRadius = (radius: number) => {
    const nextRadius = quantizePointRadius(radius);
    setPointRadius(nextRadius);
    const drawnPoint = props.addPlantProps.designer.drawnPoint;
    drawnPoint && props.addPlantProps.dispatch({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { ...drawnPoint, r: nextRadius },
    });
  };
  const updatePointColor = (color: ResourceColor) => {
    props.addPlantProps.dispatch({
      type: Actions.SET_GRID_PLANTING,
      payload: {
        ...request,
        meta: { ...request.meta, color },
      },
    });
    const drawnPoint = props.addPlantProps.designer.drawnPoint;
    drawnPoint && props.addPlantProps.dispatch({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { ...drawnPoint, color },
    });
  };
  const save = () => {
    void saveGridPlanting({
      validation,
      saving,
      grid,
      request,
      pointRadius: pointGrid ? pointRadius : undefined,
      pointColor: pointGrid ? pointColor : undefined,
      offsetPacking: false,
      addPlantProps: props.addPlantProps,
      setSaving,
      onSuccess: () => {
        if (pointGrid) {
          props.navigate(Path.points());
          return;
        }
        restartAt(gardenStart(grid));
      },
    });
  };
  const previewGrid = phase == "pick-start"
    ? gridAtStart(
      grid,
      hover,
      pointGrid ? DEFAULT_POINT_GRID_SPACING : request.defaultSpacing,
      props.addPlantProps.gridSize,
    )
    : grid;
  const previewValidation = validatePlantGrid(
    previewGrid,
    false,
    props.addPlantProps.gridSize,
  );
  const cropSlug = request.cropSlug || "";
  const metadata = findCropMetadata(cropSlug);
  const icon = findCropIcon(cropSlug);
  const size =
    (props.addPlantProps.designer.cropRadius || DEFAULT_PLANT_RADIUS) * 2;
  const previewPlants: ThreeDGardenPlant[] = pointGrid
    ? []
    : previewValidation.points
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
  const previewPointBodies = pointGrid
    ? initPlantGrid({
      grid: previewGrid,
      gridId: request.gridId,
      offsetPacking: false,
      itemName: request.itemName,
      radius: pointRadius,
      z: request.z,
      meta: {
        ...request.meta,
        color: pointColor,
      },
    }) as TaggedGenericPointer["body"][]
    : [];
  const previewPoints = pointGrid
    ? batchInitDirty<TaggedGenericPointer>(
      "Point", previewPointBodies).payload
    : [];
  const previewStart = gardenStart(previewGrid);
  const primaryPreviewPlants = phase == "pick-start"
    ? previewPlants.filter(plant =>
      plant.x == previewStart.x && plant.y == previewStart.y)
    : previewPlants;
  const extraPreviewPlants = phase == "pick-start"
    ? previewPlants.filter(plant =>
      plant.x != previewStart.x || plant.y != previewStart.y)
    : [];
  const previewStartWorld = get3DPosition(previewStart);
  const previewStartZ = zZero(props.config)
    + props.getZ(previewStart.x, previewStart.y);
  const zero = zeroFunc(props.config);
  const extents = extentsFunc(props.config);
  const actionPosition = gridActionControlPosition(
    props.config,
    grid,
    props.getZ,
  );
  return <Group name={"grid-planting"}>
    {pointGrid
      ? <PointInstances
        points={previewPoints}
        config={props.config}
        getZ={props.getZ}
        visible={true} />
      : <PlantInstances
        plants={primaryPreviewPlants}
        config={props.config}
        getZ={props.getZ}
        visible={true} />}
    {!pointGrid && extraPreviewPlants.length > 0 &&
      <PlantInstances
        plants={extraPreviewPlants}
        config={props.config}
        getZ={props.getZ}
        visible={true}
        opacity={0.5} />}
    {!pointGrid && phase != "pick-start" &&
      <PlantSpreadInstances
        plants={previewPlants}
        config={props.config}
        getZ={props.getZ}
        visible={true}
        spreadVisible={true}
        forceWhite={true}
        activePositionRef={previewSpreadPositionRef} />}
    {showStartHelpers &&
      <Group name={"grid-start-helpers"}>
        <Line
          name={"grid-x-crosshair"}
          position={[0, previewStartWorld.y, previewStartZ]}
          color={"white"}
          transparent={true}
          opacity={0.9}
          lineWidth={2}
          points={[
            [zero.x, 0, 0],
            [extents.x, 0, 0],
          ]} />
        <Line
          name={"grid-y-crosshair"}
          position={[previewStartWorld.x, 0, previewStartZ]}
          color={"white"}
          transparent={true}
          opacity={0.9}
          lineWidth={2}
          points={[
            [0, zero.y, 0],
            [0, extents.y, 0],
          ]} />
        <AlignmentIndicators
          ref={alignmentIndicatorRef}
          config={props.config}
          plants={props.plants}
          weeds={props.weeds}
          points={props.mapPoints}
          showPlants={props.showPlants}
          showPoints={props.showPoints}
          showWeeds={props.showWeeds}
          getZ={props.getZ} />
        {phase == "pick-start" &&
          <>
            {!pointGrid &&
              <Group
                name={"grid-start-spread-sphere"}
                position={[
                  previewStartWorld.x,
                  previewStartWorld.y,
                  previewStartZ,
                ]}>
                <PlantPlacementSphere
                  config={props.config}
                  spread={metadata.spread} />
              </Group>}
            <PlacementCoordinateLabel
              coordinates={{
                x: previewStart.x,
                y: previewStart.y,
                z: props.getZ(previewStart.x, previewStart.y),
              }}
              position={[
                previewStartWorld.x,
                previewStartWorld.y,
                previewStartZ
                  + (pointGrid ? POINT_PIN_HEIGHT : size)
                  + 45,
              ]} />
          </>}
      </Group>}
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
          color={"white"}
          {...GRID_CONTROL_FOREGROUND_PROPS}>
          {`${grid.numPlantsH} x ${grid.numPlantsV}`}
        </Text>
      </Billboard>}
    <GridFinalAdjustment
      phase={phase}
      position={actionPosition}
      config={props.config}
      grid={grid}
      gridSize={props.addPlantProps.gridSize}
      getZ={props.getZ}
      onChange={setGrid}
      pointRadius={pointGrid ? pointRadius : undefined}
      onPointRadiusChange={pointGrid ? updatePointRadius : undefined}
      onStartInteractionChange={setAdjustingStart}
      saving={saving}
      pointColor={pointGrid ? pointColor : undefined}
      onPointColorChange={pointGrid ? updatePointColor : undefined}
      onCancel={restart}
      onSave={save} />
  </Group>;
});

GridPlanting.displayName = "GridPlanting";
