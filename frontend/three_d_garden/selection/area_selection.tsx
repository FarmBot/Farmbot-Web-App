import React from "react";
import { Line } from "@react-three/drei";
import { DoubleSide } from "three";
import { PointType, TaggedPointGroup } from "farmbot";
import { Config } from "../config";
import {
  getGardenPositionFunc, getWorldPositionFunc,
} from "../helpers";
import {
  ControlArrow, ControlDragEvent, ControlHandle, ControlLabel,
  noControlRaycast, planeConstraint, ThreeDPopup,
} from "../controls";
import { AxisNumberProperty } from
  "../../farm_designer/map/interfaces";
import {
  isPointType, POINTER_TYPE_DDI_LOOKUP, POINTER_TYPE_LIST,
} from "../../plants/select_plants";
import { DropDownItem, FBSelect } from "../../ui";
import { t } from "../../i18next_wrapper";
import { POINTER_TYPES } from
  "../../point_groups/criteria/interfaces";
import {
  BufferAttribute, BufferGeometry, Group, Mesh, MeshBasicMaterial,
} from "../components";
import { RenderOrder } from "../constants";
import type { TriangleData } from "../triangle_functions";

export const AREA_SELECTION_GHOST_SIZE = 200;
const AREA_SELECTION_LINE_Z_OFFSET = 8;
const AREA_SELECTION_LABEL_Z_OFFSET = 80;
const AREA_SELECTION_POPUP_Z_OFFSET = 180;
const AREA_SELECTION_ARROW_LENGTH = 100;
const AREA_SELECTION_ARROW_WIDTH = 12;
const AREA_SELECTION_COLOR = "dodgerblue";
const AREA_SELECTION_HOVER_COLOR = "deepskyblue";
const AREA_SELECTION_RENDER_ORDER = 1001;

export interface AreaSelectionBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export type AreaSelectionPointType = PointType | "All";

export interface GardenAreaSelection {
  phase: "firstCorner" | "drawing" | "complete";
  box: AreaSelectionBox;
  pointType: AreaSelectionPointType;
}

export const normalizeAreaSelectionBox = (
  box: AreaSelectionBox,
): AreaSelectionBox => ({
  x0: Math.min(box.x0, box.x1),
  y0: Math.min(box.y0, box.y1),
  x1: Math.max(box.x0, box.x1),
  y1: Math.max(box.y0, box.y1),
});

type SoilSurfacePoint = TriangleData["a"];
type ClipAxis = 0 | 1;

export interface AreaSelectionGeometry {
  fillIndices: Uint16Array | Uint32Array;
  fillVertices: Float32Array;
  outlinePoints: [number, number, number][];
}

const AREA_SELECTION_GEOMETRY_EPSILON = 1e-6;

const areaSelectionPointKey = (point: SoilSurfacePoint) =>
  `${Math.round(point[0] / AREA_SELECTION_GEOMETRY_EPSILON)}:`
  + `${Math.round(point[1] / AREA_SELECTION_GEOMETRY_EPSILON)}`;

const clipAreaSelectionPolygon = (
  polygon: SoilSurfacePoint[],
  axis: ClipAxis,
  boundary: number,
  keepGreater: boolean,
) => {
  if (polygon.length == 0) { return polygon; }
  const inside = (point: SoilSurfacePoint) => keepGreater
    ? point[axis] >= boundary
    : point[axis] <= boundary;
  const intersection = (
    start: SoilSurfacePoint,
    end: SoilSurfacePoint,
  ): SoilSurfacePoint => {
    const ratio = (boundary - start[axis]) / (end[axis] - start[axis]);
    return [
      start[0] + (end[0] - start[0]) * ratio,
      start[1] + (end[1] - start[1]) * ratio,
      start[2] + (end[2] - start[2]) * ratio,
    ];
  };
  const result: SoilSurfacePoint[] = [];
  let previous = polygon[polygon.length - 1];
  let previousInside = inside(previous);
  polygon.forEach(current => {
    const currentInside = inside(current);
    if (currentInside != previousInside) {
      result.push(intersection(previous, current));
    }
    if (currentInside) { result.push(current); }
    previous = current;
    previousInside = currentInside;
  });
  return result;
};

const clipAreaSelectionTriangle = (
  triangle: TriangleData,
  box: AreaSelectionBox,
) => {
  const boundaries: [ClipAxis, number, boolean][] = [
    [0, box.x0, true],
    [0, box.x1, false],
    [1, box.y0, true],
    [1, box.y1, false],
  ];
  return boundaries.reduce(
    (polygon, [axis, boundary, keepGreater]) =>
      clipAreaSelectionPolygon(polygon, axis, boundary, keepGreater),
    [triangle.a, triangle.b, triangle.c],
  );
};

const areaSelectionTriangleArea = (
  a: SoilSurfacePoint,
  b: SoilSurfacePoint,
  c: SoilSurfacePoint,
) => Math.abs(
  (b[0] - a[0]) * (c[1] - a[1])
  - (b[1] - a[1]) * (c[0] - a[0]),
);

const uniqueAreaSelectionPoints = (points: SoilSurfacePoint[]) =>
  [...new Map(points.map(point =>
    [areaSelectionPointKey(point), point])).values()];

export const getAreaSelectionGeometry = (
  selectionBox: AreaSelectionBox,
  config: Config,
  soilSurfaceTriangles: TriangleData[],
): AreaSelectionGeometry => {
  const box = normalizeAreaSelectionBox(selectionBox);
  const getWorldPosition = getWorldPositionFunc(config);
  const vertexLookup = new Map<string, number>();
  const fillVertexValues: number[] = [];
  const fillIndexValues: number[] = [];
  const boundaryPoints: SoilSurfacePoint[] = [];
  const vertexIndex = (point: SoilSurfacePoint) => {
    const key = areaSelectionPointKey(point);
    const existing = vertexLookup.get(key);
    if (existing !== undefined) { return existing; }
    const index = vertexLookup.size;
    vertexLookup.set(key, index);
    fillVertexValues.push(...getWorldPosition({
      x: point[0],
      y: point[1],
      z: point[2] + AREA_SELECTION_LINE_Z_OFFSET,
    }));
    return index;
  };

  soilSurfaceTriangles.forEach(triangle => {
    if (
      triangle.maxX < box.x0 || triangle.minX > box.x1
      || triangle.maxY < box.y0 || triangle.minY > box.y1
    ) { return; }
    const polygon = clipAreaSelectionTriangle(triangle, box);
    if (polygon.length < 3) { return; }
    polygon.forEach(point => {
      if (
        Math.abs(point[0] - box.x0) < AREA_SELECTION_GEOMETRY_EPSILON
        || Math.abs(point[0] - box.x1) < AREA_SELECTION_GEOMETRY_EPSILON
        || Math.abs(point[1] - box.y0) < AREA_SELECTION_GEOMETRY_EPSILON
        || Math.abs(point[1] - box.y1) < AREA_SELECTION_GEOMETRY_EPSILON
      ) {
        boundaryPoints.push(point);
      }
    });
    for (let i = 1; i < polygon.length - 1; i++) {
      if (areaSelectionTriangleArea(
        polygon[0], polygon[i], polygon[i + 1],
      ) < AREA_SELECTION_GEOMETRY_EPSILON) { continue; }
      fillIndexValues.push(
        vertexIndex(polygon[0]),
        vertexIndex(polygon[i]),
        vertexIndex(polygon[i + 1]),
      );
    }
  });

  const onBoundary = (value: number, boundary: number) =>
    Math.abs(value - boundary) < AREA_SELECTION_GEOMETRY_EPSILON;
  const uniqueBoundaryPoints = uniqueAreaSelectionPoints(boundaryPoints);
  const bottom = uniqueBoundaryPoints
    .filter(point => onBoundary(point[1], box.y0))
    .sort((a, b) => a[0] - b[0]);
  const right = uniqueBoundaryPoints
    .filter(point => onBoundary(point[0], box.x1))
    .sort((a, b) => a[1] - b[1]);
  const top = uniqueBoundaryPoints
    .filter(point => onBoundary(point[1], box.y1))
    .sort((a, b) => b[0] - a[0]);
  const left = uniqueBoundaryPoints
    .filter(point => onBoundary(point[0], box.x0))
    .sort((a, b) => b[1] - a[1]);
  const orderedBoundary: SoilSurfacePoint[] = [];
  [...bottom, ...right, ...top, ...left].forEach(point => {
    const previous = orderedBoundary[orderedBoundary.length - 1];
    if (!previous
      || areaSelectionPointKey(point) != areaSelectionPointKey(previous)) {
      orderedBoundary.push(point);
    }
  });
  if (orderedBoundary.length > 0
    && areaSelectionPointKey(orderedBoundary[0])
      != areaSelectionPointKey(orderedBoundary[orderedBoundary.length - 1])) {
    orderedBoundary.push(orderedBoundary[0]);
  }
  const outlinePoints = orderedBoundary.map(point => getWorldPosition({
    x: point[0],
    y: point[1],
    z: point[2] + AREA_SELECTION_LINE_Z_OFFSET,
  }));
  const IndexArray = vertexLookup.size > 65535 ? Uint32Array : Uint16Array;
  return {
    fillIndices: new IndexArray(fillIndexValues),
    fillVertices: new Float32Array(fillVertexValues),
    outlinePoints,
  };
};

const ghostEnd = (start: number, maximum: number) =>
  start + AREA_SELECTION_GHOST_SIZE <= maximum
    ? start + AREA_SELECTION_GHOST_SIZE
    : Math.max(0, start - AREA_SELECTION_GHOST_SIZE);

export const getGhostAreaSelectionBox = (
  position: AxisNumberProperty,
  config: Pick<Config, "botSizeX" | "botSizeY">,
): AreaSelectionBox => ({
  x0: position.x,
  y0: position.y,
  x1: ghostEnd(position.x, config.botSizeX),
  y1: ghostEnd(position.y, config.botSizeY),
});

export const areaSelectionPointTypes = (
  pointType: AreaSelectionPointType,
): PointType[] => pointType == "All"
  ? [...POINTER_TYPES]
  : [pointType];

const AREA_SELECTION_NAME_LOOKUP = () => ({
  Plant: { singular: t("plant"), plural: t("plants") },
  GenericPointer: { singular: t("point"), plural: t("points") },
  Weed: { singular: t("weed"), plural: t("weeds") },
  ToolSlot: { singular: t("slot"), plural: t("slots") },
  All: { singular: t("object"), plural: t("objects") },
});

export const areaSelectionTitle = (
  count: number,
  pointType: AreaSelectionPointType,
) => {
  const names = AREA_SELECTION_NAME_LOOKUP()[pointType];
  return `${count} ${count == 1 ? names.singular : names.plural}`;
};

export type AreaSelectionEdge = "x0" | "x1" | "y0" | "y1";

export const resizeAreaSelectionBox = (
  box: AreaSelectionBox,
  edge: AreaSelectionEdge,
  value: number,
  config: Pick<Config, "botSizeX" | "botSizeY">,
): AreaSelectionBox => {
  const normalized = normalizeAreaSelectionBox(box);
  switch (edge) {
    case "x0": return {
      ...normalized,
      x0: Math.max(0, Math.min(normalized.x1, value)),
    };
    case "x1": return {
      ...normalized,
      x1: Math.max(normalized.x0, Math.min(config.botSizeX, value)),
    };
    case "y0": return {
      ...normalized,
      y0: Math.max(0, Math.min(normalized.y1, value)),
    };
    case "y1": return {
      ...normalized,
      y1: Math.max(normalized.y0, Math.min(config.botSizeY, value)),
    };
  }
};

interface AreaSelectionRectangleProps {
  box: AreaSelectionBox;
  config: Config;
  ghost: boolean;
  gridLayer?: boolean;
  name?: string;
  soilSurfaceTriangles: TriangleData[];
}

const AreaSelectionRectangle = (props: AreaSelectionRectangleProps) => {
  const geometry = React.useMemo(() => getAreaSelectionGeometry(
    props.box,
    props.config,
    props.soilSurfaceTriangles,
  ), [props.box, props.config, props.soilSurfaceTriangles]);
  return <>
    <Mesh
      name={props.ghost
        ? "area-selection-ghost-fill"
        : "area-selection-fill"}
      renderOrder={RenderOrder.default}
      raycast={noControlRaycast}>
      <BufferGeometry>
        <BufferAttribute
          attach={"index"}
          args={[geometry.fillIndices, 1]} />
        <BufferAttribute
          attach={"attributes-position"}
          args={[geometry.fillVertices, 3]} />
      </BufferGeometry>
      <MeshBasicMaterial
        color={"white"}
        transparent={true}
        opacity={0.3}
        depthTest={true}
        depthWrite={false}
        side={DoubleSide} />
    </Mesh>
    <Line
      name={props.name || (props.ghost
        ? "area-selection-ghost"
        : "area-selection-rectangle")}
      points={geometry.outlinePoints}
      color={"white"}
      dashed={true}
      dashSize={25}
      gapSize={20}
      lineWidth={2}
      transparent={true}
      opacity={0.95}
      depthTest={!!props.gridLayer}
      depthWrite={true}
      renderOrder={RenderOrder.default}
      raycast={noControlRaycast} />
  </>;
};

interface AreaSelectionEdgeControlProps {
  box: AreaSelectionBox;
  config: Config;
  edge: AreaSelectionEdge;
  getZ(x: number, y: number): number;
  onChange(box: AreaSelectionBox): void;
  onCommit?(box: AreaSelectionBox): void;
}

const AreaSelectionEdgeControl = (
  props: AreaSelectionEdgeControlProps,
) => {
  const box = normalizeAreaSelectionBox(props.box);
  const xEdge = props.edge == "x0" || props.edge == "x1";
  const coordinate = box[props.edge];
  const position = {
    x: xEdge ? coordinate : (box.x0 + box.x1) / 2,
    y: xEdge ? (box.y0 + box.y1) / 2 : coordinate,
  };
  const getWorldPosition = getWorldPositionFunc(props.config);
  const worldPosition = getWorldPosition({
    ...position,
    z: props.getZ(position.x, position.y) + AREA_SELECTION_LINE_Z_OFFSET,
  });
  const getGardenPosition = getGardenPositionFunc(props.config, false);
  const dragStartBox = React.useRef(box);
  const updatedBox = (event: ControlDragEvent) => {
    const start = event.point.clone().sub(event.delta);
    const startGarden = getGardenPosition(start);
    const currentGarden = getGardenPosition(event.point);
    const axis = xEdge ? "x" : "y";
    const initial = dragStartBox.current[props.edge];
    return resizeAreaSelectionBox(
      dragStartBox.current,
      props.edge,
      initial + currentGarden[axis] - startGarden[axis],
      props.config,
    );
  };
  const update = (event: ControlDragEvent) =>
    props.onChange(updatedBox(event));
  const commit = (event: ControlDragEvent) => {
    const nextBox = updatedBox(event);
    props.onChange(nextBox);
    props.onCommit?.(nextBox);
  };
  const lowerEdge = props.edge == "x0" || props.edge == "y0";
  const mirrored = xEdge ? props.config.mirrorX : props.config.mirrorY;
  const outwardDirection = (lowerEdge ? -1 : 1) * (mirrored ? -1 : 1);
  const arrowStart: [number, number, number] = [0, 0, 0];
  const arrowEnd: [number, number, number] = xEdge
    ? [outwardDirection * AREA_SELECTION_ARROW_LENGTH, 0, 0]
    : [0, outwardDirection * AREA_SELECTION_ARROW_LENGTH, 0];
  return <ControlHandle
    name={`area-selection-${props.edge}-control`}
    position={worldPosition}
    constraint={planeConstraint("xy", worldPosition)}
    onDragStart={() => { dragStartBox.current = box; }}
    onDrag={update}
    onDragEnd={commit}>
    {state => <>
      <ControlArrow
        name={`area-selection-${props.edge}-arrow`}
        start={arrowStart}
        end={arrowEnd}
        heads={"end"}
        width={AREA_SELECTION_ARROW_WIDTH}
        color={AREA_SELECTION_COLOR}
        hoverColor={AREA_SELECTION_HOVER_COLOR}
        hovered={state.hovered || state.dragging}
        depthTest={false}
        depthWrite={false}
        renderOrder={AREA_SELECTION_RENDER_ORDER} />
    </>}
  </ControlHandle>;
};

interface AreaSelectionCountLabelProps {
  box: AreaSelectionBox;
  config: Config;
  count: number;
  getZ(x: number, y: number): number;
  pointType: AreaSelectionPointType;
}

const AreaSelectionCountLabel = (
  props: AreaSelectionCountLabelProps,
) => {
  const { x1: x, y1: y } = props.box;
  const position = getWorldPositionFunc(props.config)({
    x,
    y,
    z: props.getZ(x, y) + AREA_SELECTION_LABEL_Z_OFFSET,
  });
  return <ControlLabel
    name={"area-selection-count-label"}
    position={position}
    fontSize={34}
    color={"white"}
    depthTest={false}
    depthWrite={false}
    renderOrder={AREA_SELECTION_RENDER_ORDER + 1}
    enabled={false}>
    {areaSelectionTitle(props.count, props.pointType)}
  </ControlLabel>;
};

interface AreaSelectionPopupProps {
  box: AreaSelectionBox;
  config: Config;
  count: number;
  getZ(x: number, y: number): number;
  pointType: AreaSelectionPointType;
  onClose(): void;
  onCreateGroup(): void;
  onDelete(): void;
  onOpenPanel(): void;
  onPointTypeChange(pointType: AreaSelectionPointType): void;
}

const AreaSelectionPopup = (props: AreaSelectionPopupProps) => {
  const box = normalizeAreaSelectionBox(props.box);
  const center = {
    x: (box.x0 + box.x1) / 2,
    y: (box.y0 + box.y1) / 2,
  };
  const getWorldPosition = getWorldPositionFunc(props.config);
  const position = getWorldPosition({
    ...center,
    z: props.getZ(center.x, center.y) + AREA_SELECTION_POPUP_Z_OFFSET,
  });
  const changeType = (item: DropDownItem) => {
    if (item.value == "All") {
      props.onPointTypeChange("All");
    } else if (isPointType(item.value)) {
      props.onPointTypeChange(item.value);
    }
  };
  return <ThreeDPopup
    name={"area-selection-popup"}
    position={position}
    title={areaSelectionTitle(props.count, props.pointType)}
    headerActions={
      <button
        type={"button"}
        className={"fa fa-external-link fb-icon-button invert"}
        title={t("open panel")}
        onClick={props.onOpenPanel} />}
    onClose={props.onClose}>
    <div className={"row grid-exp-1"}>
      <label>{t("selection type")}</label>
      <FBSelect
        key={props.pointType}
        list={POINTER_TYPE_LIST()}
        selectedItem={POINTER_TYPE_DDI_LOOKUP()[props.pointType]}
        usePortal={false}
        onChange={changeType} />
    </div>
    <div className={"row half-gap"}>
      <button
        type={"button"}
        className={"fb-button red"}
        title={t("Delete")}
        disabled={props.count == 0}
        onClick={props.onDelete}>
        {t("Delete")}
      </button>
      <button
        type={"button"}
        className={"fb-button dark-blue"}
        title={t("Create group")}
        disabled={props.count == 0}
        onClick={props.onCreateGroup}>
        {t("Create group")}
      </button>
    </div>
  </ThreeDPopup>;
};

export interface GardenAreaSelectionOverlayProps {
  config: Config;
  getZ(x: number, y: number): number;
  ghostPosition: AxisNumberProperty | undefined;
  selection: GardenAreaSelection | undefined;
  shiftPressed: boolean;
  soilSurfaceTriangles: TriangleData[];
  selectedCount: number;
  onBoxChange(box: AreaSelectionBox): void;
  onClose(): void;
  onCreateGroup(): void;
  onDelete(): void;
  onOpenPanel(): void;
  onPointTypeChange(pointType: AreaSelectionPointType): void;
}

const getAreaSelectionDisplay = (
  props: GardenAreaSelectionOverlayProps,
) => {
  if (props.selection?.phase == "firstCorner") {
    return {
      box: props.ghostPosition
        ? getGhostAreaSelectionBox(props.ghostPosition, props.config)
        : undefined,
      ghost: true,
    };
  }
  if (props.selection) {
    return { box: props.selection.box, ghost: false };
  }
  return {
    box: props.shiftPressed && props.ghostPosition
      ? getGhostAreaSelectionBox(props.ghostPosition, props.config)
      : undefined,
    ghost: true,
  };
};

export const GardenAreaSelectionOverlay = (
  props: GardenAreaSelectionOverlayProps,
) => {
  const { box, ghost } = getAreaSelectionDisplay(props);
  if (!box) { return <></>; }
  const complete = props.selection?.phase == "complete";
  const drawing = props.selection?.phase == "drawing";
  return <>
    <AreaSelectionRectangle
      box={box}
      config={props.config}
      ghost={ghost}
      soilSurfaceTriangles={props.soilSurfaceTriangles} />
    {drawing && props.selection &&
      <AreaSelectionCountLabel
        box={box}
        config={props.config}
        count={props.selectedCount}
        getZ={props.getZ}
        pointType={props.selection.pointType} />}
    {complete && (["x0", "x1", "y0", "y1"] as const).map(edge =>
      <AreaSelectionEdgeControl
        key={edge}
        box={box}
        config={props.config}
        edge={edge}
        getZ={props.getZ}
        onChange={props.onBoxChange} />)}
    {complete && props.selection &&
      <AreaSelectionPopup
        box={box}
        config={props.config}
        count={props.selectedCount}
        getZ={props.getZ}
        pointType={props.selection.pointType}
        onClose={props.onClose}
        onCreateGroup={props.onCreateGroup}
        onDelete={props.onDelete}
        onOpenPanel={props.onOpenPanel}
        onPointTypeChange={props.onPointTypeChange} />}
  </>;
};

export interface GroupAreaSelectionOverlayProps {
  box: AreaSelectionBox;
  config: Config;
  getZ(x: number, y: number): number;
  onBoxChange(box: AreaSelectionBox): void;
  soilSurfaceTriangles: TriangleData[];
}

type GroupAreaConfig = Pick<Config, "botSizeX" | "botSizeY">;

export const getGroupAreaSelectionBox = (
  group: TaggedPointGroup,
  config: GroupAreaConfig,
  includeUnbounded = false,
): AreaSelectionBox | undefined => {
  const gt = group.body.criteria.number_gt;
  const lt = group.body.criteria.number_lt;
  const bounds = [gt.x, gt.y, lt.x, lt.y];
  if (!includeUnbounded && !bounds.some(value => typeof value == "number")) {
    return undefined;
  }
  return {
    x0: gt.x ?? 0,
    y0: gt.y ?? 0,
    x1: lt.x ?? config.botSizeX,
    y1: lt.y ?? config.botSizeY,
  };
};

export interface GroupAreaVisualProps {
  box: AreaSelectionBox;
  config: Config;
  gridLayer?: boolean;
  name?: string;
  soilSurfaceTriangles: TriangleData[];
}

export const GroupAreaVisual = (props: GroupAreaVisualProps) =>
  <Group name={props.name || "group-area-visual"}>
    <AreaSelectionRectangle
      box={props.box}
      config={props.config}
      ghost={false}
      gridLayer={props.gridLayer}
      name={props.name ? `${props.name}-rectangle` : undefined}
      soilSurfaceTriangles={props.soilSurfaceTriangles} />
  </Group>;

export const GroupAreaSelectionOverlay = (
  props: GroupAreaSelectionOverlayProps,
) => {
  const externalBoxKey = [
    props.box.x0,
    props.box.x1,
    props.box.y0,
    props.box.y1,
  ].join(":");
  const [state, setState] = React.useState(() => ({
    box: props.box,
    externalBoxKey,
  }));
  let box = state.box;
  if (state.externalBoxKey != externalBoxKey) {
    box = props.box;
    setState({ box, externalBoxKey });
  }
  const previewBox = (nextBox: AreaSelectionBox) =>
    setState(current => ({ ...current, box: nextBox }));
  return <Group name={"group-area-selection"}>
    <GroupAreaVisual
      box={box}
      config={props.config}
      soilSurfaceTriangles={props.soilSurfaceTriangles} />
    {(["x0", "x1", "y0", "y1"] as const).map(edge =>
      <AreaSelectionEdgeControl
        key={edge}
        box={box}
        config={props.config}
        edge={edge}
        getZ={props.getZ}
        onChange={previewBox}
        onCommit={props.onBoxChange} />)}
  </Group>;
};
