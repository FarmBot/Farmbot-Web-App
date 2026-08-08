import React from "react";
import {
  Group, MeshPhongMaterial, Mesh, PlaneGeometry, MeshBasicMaterial,
} from "../../components";
import {
  Billboard, Html, Line, Sphere, useTexture,
} from "@react-three/drei";
import {
  DEFAULT_PLANT_RADIUS, findCropIcon, findCropMetadata,
} from "../../../crops/metadata";
import { Mode } from "../../../farm_designer/map/interfaces";
import {
  getMode, round, xyDistance,
} from "../../../farm_designer/map/util";
import { isMobile } from "../../../screen_size";
import { HOVER_OBJECT_MODES, DRAW_POINT_MODES, RenderOrder } from "../../constants";
import {
  DrawnPoint,
  getBoundsCenter,
  getHalfSize,
  outOfBoundsShaderModification,
  POINT_CYLINDER_SCALE_FACTOR,
  ThreeDGardenPlant,
  WEED_IMG_SIZE_FRACTION,
} from "../../garden";
import {
  zero as zeroFunc,
  extents as extentsFunc,
  getGardenPositionFunc,
  get3DPositionFunc,
  getWorldPositionFunc,
  zZero,
} from "../../helpers";
import { Config } from "../../config";
import {
  SpecialStatus, TaggedGenericPointer, TaggedWeedPointer,
} from "farmbot";
import { AddPlantProps } from "../bed";
import { clamp, isUndefined, round as mathRound } from "lodash";
import { Mesh as MeshType, Group as GroupType, Color } from "three";
import { Path } from "../../../internal_urls";
import { ThreeEvent } from "@react-three/fiber";
import { dropPlant3D } from "../../plant_actions";
import { createPoint } from "../../../points/create_point_action";
import { Actions } from "../../../constants";
import { NavigateFunction } from "react-router";
import {
  DrawnPointPayl, PointPlacementPhase,
} from "../../../farm_designer/interfaces";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import {
  getPlantIconTexture,
  getPlantIconTextureUrl,
} from "../../garden/plant_icon_atlas";
import { clickWasDragged } from "../../click_event";
import {
  AlignmentIndicatorRef, AlignmentIndicators,
} from "./alignment_indicators";
import {
  PlacementCoordinateLabel,
  PlacementCoordinateLabelRef,
} from "./placement_coordinate_label";
import {
  ControlArrow, ControlDragEvent, ControlHandle, ControlSphere,
  CONTROL_ARROW_WIDTH, CONTROL_RENDER_ORDER, planeConstraint,
  stopThreeDPopupEvent,
} from "../../controls";
import { ColorPickerCluster } from "../../../ui";
import { ResourceColor } from "../../../interfaces";
import { t } from "../../../i18next_wrapper";

export type { PlacementCoordinateLabelRef };

export type PointerPlantRef = React.RefObject<GroupType | null>;
export type RadiusRef = React.RefObject<MeshType | null>;
export type TorusRef = React.RefObject<MeshType | null>;
export type BillboardRef = React.RefObject<GroupType | null>;
export type ImageRef = React.RefObject<MeshType | null>;
export type XCrosshairRef = React.RefObject<Line2 | null>;
export type YCrosshairRef = React.RefObject<Line2 | null>;
export type ActivePositionRef = React.RefObject<{ x: number, y: number } | null>;
export interface SinglePointRadiusControlRef {
  update(cursor: { x: number, y: number }): void;
}
export type SinglePointRadiusRef =
  React.RefObject<SinglePointRadiusControlRef | null>;

interface AllRefs {
  pointerPlantRef: PointerPlantRef;
  radiusRef: RadiusRef;
  torusRef: TorusRef;
  billboardRef: BillboardRef;
  imageRef: ImageRef;
  xCrosshairRef: XCrosshairRef;
  yCrosshairRef: YCrosshairRef;
  alignmentIndicatorRef: AlignmentIndicatorRef;
  placementCoordinateLabelRef: PlacementCoordinateLabelRef;
  singlePointRadiusRef: SinglePointRadiusRef;
}

export interface PointerObjectsProps extends AllRefs {
  config: Config;
  mapPoints: TaggedGenericPointer[];
  plants: ThreeDGardenPlant[];
  weeds: TaggedWeedPointer[];
  showPlants: boolean;
  showPoints: boolean;
  showWeeds: boolean;
  getZ(x: number, y: number): number;
  addPlantProps: AddPlantProps;
  activePositionRef: ActivePositionRef;
  navigate: NavigateFunction;
}

interface PlantPlacementSphereProps {
  config: Config;
  spread: number;
}

export const PlantPlacementSphere = (
  props: PlantPlacementSphereProps,
) => {
  const boundsCenter = React.useMemo(
    () => getBoundsCenter(props.config)(), [props.config]);
  const halfSize = React.useMemo(
    () => getHalfSize(props.config)(), [props.config]);
  return <Sphere args={[props.spread / 2 * 10, 32, 32]}>
    <MeshPhongMaterial
      color={"white"}
      transparent={true}
      opacity={0.4}
      onBeforeCompile={shader => {
        shader.uniforms.uBoundsCenter = { value: boundsCenter };
        shader.uniforms.uHalfSize = { value: halfSize };
        shader.uniforms.uInside = { value: new Color("white") };
        shader.uniforms.uOutside = { value: new Color("red") };
        shader.uniforms.uMirrorX = {
          value: props.config.mirrorX ? -1 : 1,
        };
        shader.uniforms.uMirrorY = {
          value: props.config.mirrorY ? -1 : 1,
        };
        outOfBoundsShaderModification(shader);
      }}
      depthWrite={false} />
  </Sphere>;
};

export const PointerObjects = (props: PointerObjectsProps) => {
  const mode = getMode();
  if (!HOVER_OBJECT_MODES.includes(mode) || isMobile()) { return <></>; }
  return <ActivePointerObjects
    {...props}
    mode={mode}
    cropSlug={Path.getCropSlug()} />;
};

interface ActivePointerObjectsProps extends PointerObjectsProps {
  mode: Mode;
  cropSlug: string;
}

const PREVIEW_CONFIG_KEYS: (keyof Config)[] = [
  "bedLengthOuter",
  "bedWallThickness",
  "bedWidthOuter",
  "bedXOffset",
  "bedYOffset",
  "botSizeX",
  "botSizeY",
  "botSizeZ",
  "columnLength",
  "mirrorX",
  "mirrorY",
  "zGantryOffset",
];

export const hasDirtyGridPreview = (mapPoints: TaggedGenericPointer[]) =>
  mapPoints.some(p =>
    p.specialStatus == SpecialStatus.DIRTY && p.body.meta.gridId);

const samePreviewConfig = (prev: Config, next: Config) =>
  PREVIEW_CONFIG_KEYS.every(key => prev[key] === next[key]);

const sameDrawnPoint = (
  prev: AddPlantProps["designer"]["drawnPoint"],
  next: AddPlantProps["designer"]["drawnPoint"],
) =>
  prev === next ||
  !!prev && !!next &&
  prev.cx === next.cx &&
  prev.cy === next.cy &&
  prev.name === next.name &&
  prev.z === next.z &&
  prev.r === next.r &&
  prev.color === next.color &&
  prev.at_soil_level === next.at_soil_level &&
  prev.placementPhase === next.placementPhase;

const samePreviewRefs = (
  prev: ActivePointerObjectsProps,
  next: ActivePointerObjectsProps,
) =>
  prev.pointerPlantRef === next.pointerPlantRef &&
  prev.radiusRef === next.radiusRef &&
  prev.torusRef === next.torusRef &&
  prev.billboardRef === next.billboardRef &&
  prev.imageRef === next.imageRef &&
  prev.xCrosshairRef === next.xCrosshairRef &&
  prev.yCrosshairRef === next.yCrosshairRef &&
  prev.alignmentIndicatorRef === next.alignmentIndicatorRef &&
  prev.placementCoordinateLabelRef === next.placementCoordinateLabelRef &&
  prev.singlePointRadiusRef === next.singlePointRadiusRef &&
  prev.activePositionRef === next.activePositionRef;

const samePreviewDesigner = (
  prev: AddPlantProps["designer"],
  next: AddPlantProps["designer"],
) =>
  prev.cropRadius == next.cropRadius &&
  sameDrawnPoint(prev.drawnPoint, next.drawnPoint);

const sameGridPreviewState = (
  prev: TaggedGenericPointer[],
  next: TaggedGenericPointer[],
) =>
  prev === next || hasDirtyGridPreview(prev) == hasDirtyGridPreview(next);

export const activePointerObjectsPropsEqual = (
  prev: ActivePointerObjectsProps,
  next: ActivePointerObjectsProps,
) =>
  prev.mode === next.mode &&
  prev.cropSlug === next.cropSlug &&
  prev.navigate === next.navigate &&
  samePreviewRefs(prev, next) &&
  prev.getZ === next.getZ &&
  prev.plants === next.plants &&
  prev.weeds === next.weeds &&
  prev.mapPoints === next.mapPoints &&
  prev.showPlants === next.showPlants &&
  prev.showPoints === next.showPoints &&
  prev.showWeeds === next.showWeeds &&
  samePreviewConfig(prev.config, next.config) &&
  samePreviewDesigner(
    prev.addPlantProps.designer,
    next.addPlantProps.designer) &&
  sameGridPreviewState(prev.mapPoints, next.mapPoints);

interface PointerPlantIconProps {
  icon: string;
  iconSize: number;
}

const PointerPlantIcon = (props: PointerPlantIconProps) => {
  const baseTexture = useTexture(getPlantIconTextureUrl(props.icon));
  const plantIconTexture = React.useMemo(
    () => getPlantIconTexture(baseTexture, props.icon),
    [baseTexture, props.icon]);
  return <Billboard follow={true} position={[0, 0, props.iconSize / 2]}>
    <Mesh
      name={"pointerPlant"}
      renderOrder={RenderOrder.pointerPlant}>
      <PlaneGeometry args={[props.iconSize, props.iconSize]} />
      <MeshBasicMaterial
        map={plantIconTexture}
        alphaTest={0.1}
        transparent={true} />
    </Mesh>
  </Billboard>;
};

const PointerPlantLoading = (props: { iconSize: number }) =>
  <Sphere
    name={"pointerPlant"}
    args={[props.iconSize / 4, 16, 16]}
    position={[0, 0, props.iconSize / 2]}
    renderOrder={RenderOrder.pointerPlant}>
    <MeshBasicMaterial
      color={"green"}
      transparent={true}
      opacity={0.65} />
  </Sphere>;

const SINGLE_POINT_RADIUS_ARROW_LENGTH = 100;
const SINGLE_POINT_RADIUS_CONTROL_Z = 20;
const SINGLE_POINT_START_CONTROL_Z = 125;
const SINGLE_POINT_ACTION_CONTROL_Z = 200;
const SINGLE_POINT_MARKER_RADIUS = 28;
const SINGLE_POINT_START_ARROW_LENGTH = 130;
const DEFAULT_RADIUS_DIRECTION = {
  x: -1 / Math.sqrt(2),
  y: -1 / Math.sqrt(2),
};

export const singlePointRadiusFromCursor = (
  center: { x: number, y: number },
  cursor: { x: number, y: number },
) => Math.max(0, round(xyDistance(center, cursor)));

const radiusDirectionFromCursor = (
  center: { x: number, y: number },
  cursor: { x: number, y: number },
  fallback = DEFAULT_RADIUS_DIRECTION,
) => {
  const distance = xyDistance(center, cursor);
  return distance < 1
    ? fallback
    : {
      x: (cursor.x - center.x) / distance,
      y: (cursor.y - center.y) / distance,
    };
};

interface SinglePointRadiusControlProps {
  config: Config;
  point: DrawnPointPayl;
  getZ?(x: number, y: number): number;
  editable?: boolean;
  onChange?(radius: number): void;
}

export const SinglePointRadiusControl = React.forwardRef<
  SinglePointRadiusControlRef,
  SinglePointRadiusControlProps
>((props, ref) => {
  const center = React.useMemo(() => ({
    x: props.point.cx ?? 0,
    y: props.point.cy ?? 0,
  }), [props.point.cx, props.point.cy]);
  const initialRadius = Math.max(0, props.point.r);
  const initialCursor = {
    x: center.x + DEFAULT_RADIUS_DIRECTION.x * initialRadius,
    y: center.y + DEFAULT_RADIUS_DIRECTION.y * initialRadius,
  };
  const [previewRadius, setPreviewRadius] =
    React.useState(initialRadius);
  const radius = props.editable
    ? Math.max(0, props.point.r)
    : previewRadius;
  const [direction, setDirection] = React.useState(
    radiusDirectionFromCursor(center, initialCursor),
  );
  const dragStart = React.useRef({
    radius: initialRadius,
    projection: 0,
  });
  React.useImperativeHandle(ref, () => ({
    update: cursor => {
      setDirection(previous =>
        radiusDirectionFromCursor(center, cursor, previous));
      setPreviewRadius(singlePointRadiusFromCursor(center, cursor));
    },
  }), [center]);
  const pointAtRadius = (offset: number) => ({
    x: center.x + direction.x * offset,
    y: center.y + direction.y * offset,
  });
  const endGarden = pointAtRadius(radius);
  const startGarden = pointAtRadius(
    radius + SINGLE_POINT_RADIUS_ARROW_LENGTH,
  );
  const get3DPosition = get3DPositionFunc(props.config);
  const start = get3DPosition(startGarden);
  const end = get3DPosition(endGarden);
  const previewZ = props.point.at_soil_level
    ? props.point.z ?? 0
    : props.getZ?.(center.x, center.y) ?? 0;
  const z = zZero(props.config)
    + previewZ
    + SINGLE_POINT_RADIUS_CONTROL_Z;
  const getGardenPosition = React.useMemo(
    () => getGardenPositionFunc(props.config, false),
    [props.config],
  );
  const projection = (point: { x: number, y: number }) =>
    (point.x - center.x) * direction.x
    + (point.y - center.y) * direction.y;
  const updateRadius = (event: ControlDragEvent) => {
    const pointer = getGardenPosition(event.point);
    const nextRadius = Math.max(0, round(
      dragStart.current.radius
      + projection(pointer)
      - dragStart.current.projection,
    ));
    props.onChange?.(nextRadius);
  };
  const arrow = (hovered: boolean, dragging: boolean) =>
    <ControlArrow
      name={"single-point-radius-arrow"}
      start={[start.x, start.y, z]}
      end={[end.x, end.y, z]}
      width={CONTROL_ARROW_WIDTH}
      color={props.point.color}
      hovered={hovered}
      enabled={props.editable}
      heads={"end"}
      headLength={40}
      headWidthScale={1.7}
      depthTest={true}
      depthWrite={true}
      renderOrder={CONTROL_RENDER_ORDER}
      label={`r${radius}`}
      labelDepthTest={false}
      labelDepthWrite={false}
      labelRenderOrder={CONTROL_RENDER_ORDER}
      labelVisible={!props.editable || hovered || dragging} />;
  if (!props.editable) { return arrow(false, false); }
  return <ControlHandle
    name={"single-point-radius-control"}
    constraint={planeConstraint("xy", [0, 0, z])}
    onDragStart={event => {
      const pointer = getGardenPosition(event.point);
      dragStart.current = {
        radius,
        projection: projection(pointer),
      };
    }}
    onDrag={updateRadius}>
    {state => arrow(state.hovered, state.dragging)}
  </ControlHandle>;
});

SinglePointRadiusControl.displayName = "SinglePointRadiusControl";

export const pointPlacementPhase = (
  mode: Mode,
  drawnPoint: DrawnPointPayl | undefined,
): PointPlacementPhase => {
  if (mode == Mode.createPoint && drawnPoint?.placementPhase) {
    return drawnPoint.placementPhase;
  }
  return isUndefined(drawnPoint?.cx) || isUndefined(drawnPoint.cy)
    ? "position"
    : "finalize";
};

interface PointPositionDrag {
  axis?: "x" | "y";
  offset: { x: number, y: number };
}

export interface SinglePointFinalControlsProps {
  config: Config;
  point: DrawnPointPayl;
  gridSize: { x: number, y: number };
  getZ(x: number, y: number): number;
  onChange(point: DrawnPointPayl): void;
  onCancel(): void;
  onSave(): void;
}

export const SinglePointFinalControls = (
  props: SinglePointFinalControlsProps,
) => {
  const { onSave } = props;
  const [colorPickerOpen, setColorPickerOpen] = React.useState(false);
  const drag = React.useRef<PointPositionDrag | undefined>(undefined);
  const getGardenPosition = React.useMemo(
    () => getGardenPositionFunc(props.config, false),
    [props.config],
  );
  const get3DPosition = React.useMemo(
    () => get3DPositionFunc(props.config),
    [props.config],
  );
  const center = {
    x: props.point.cx ?? 0,
    y: props.point.cy ?? 0,
  };
  const world = get3DPosition(center);
  const soilZ = props.getZ(center.x, center.y);
  const controlZ = zZero(props.config)
    + soilZ
    + SINGLE_POINT_START_CONTROL_Z;
  const point = (
    position: { x: number, y: number },
  ): [number, number, number] => {
    const worldPosition = get3DPosition(position);
    return [worldPosition.x, worldPosition.y, controlZ];
  };
  const startDrag = (
    axis: PointPositionDrag["axis"],
    event: ControlDragEvent,
  ) => {
    const cursor = getGardenPosition(event.point);
    drag.current = {
      axis,
      offset: {
        x: center.x - cursor.x,
        y: center.y - cursor.y,
      },
    };
  };
  const updatePosition = (event: ControlDragEvent) => {
    const activeDrag = drag.current;
    if (!activeDrag) { return; }
    const cursor = getGardenPosition(event.point);
    const requested = {
      x: cursor.x + activeDrag.offset.x,
      y: cursor.y + activeDrag.offset.y,
    };
    const next = {
      x: activeDrag.axis == "y"
        ? center.x
        : clamp(round(requested.x), 0, props.gridSize.x),
      y: activeDrag.axis == "x"
        ? center.y
        : clamp(round(requested.y), 0, props.gridSize.y),
    };
    props.onChange({
      ...props.point,
      cx: next.x,
      cy: next.y,
    });
  };
  const finishDrag = () => {
    drag.current = undefined;
  };
  const handlers = (axis?: "x" | "y") => ({
    constraint: planeConstraint("xy", [0, 0, controlZ]),
    onDragStart: (event: ControlDragEvent) => startDrag(axis, event),
    onDrag: updatePosition,
    onDragEnd: finishDrag,
    onDragCancel: finishDrag,
  });
  const coordinateLabel = () =>
    <PlacementCoordinateLabel
      coordinates={{ ...center, z: soilZ }}
      position={[
        world.x,
        world.y,
        controlZ + SINGLE_POINT_MARKER_RADIUS + 30,
      ]} />;
  const renderOptions = {
    transparent: true,
    depthTest: true,
    depthWrite: true,
    renderOrder: CONTROL_RENDER_ORDER,
  } as const;
  React.useEffect(() => {
    const saveOnEnter = (event: KeyboardEvent) => {
      if (event.key != "Enter") { return; }
      event.preventDefault();
      onSave();
    };
    window.addEventListener("keydown", saveOnEnter);
    return () => window.removeEventListener("keydown", saveOnEnter);
  }, [onSave]);
  return <Group name={"single-point-final-controls"}>
    <ControlHandle
      name={"single-point-start-marker-control"}
      {...handlers()}>
      {state => <>
        <ControlSphere
          name={"single-point-start-marker"}
          position={[world.x, world.y, controlZ]}
          radius={SINGLE_POINT_MARKER_RADIUS}
          colorType={"origin"}
          hovered={state.hovered}
          {...renderOptions} />
        {(state.hovered || state.dragging) && coordinateLabel()}
      </>}
    </ControlHandle>
    {(["x", "y"] as const).map(axis => {
      const axisStart = {
        ...center,
        [axis]: center[axis] + SINGLE_POINT_MARKER_RADIUS,
      };
      const axisEnd = {
        ...center,
        [axis]: center[axis] + SINGLE_POINT_START_ARROW_LENGTH,
      };
      return <ControlHandle
        key={axis}
        name={`single-point-start-${axis}-arrow`}
        {...handlers(axis)}>
        {state => <>
          <ControlArrow
            name={`single-point-start-${axis}-arrow-shape`}
            start={point(axisStart)}
            end={point(axisEnd)}
            width={CONTROL_ARROW_WIDTH}
            colorType={axis}
            hovered={state.hovered}
            headLength={40}
            headWidthScale={1.7}
            {...renderOptions} />
          {(state.hovered || state.dragging) && coordinateLabel()}
        </>}
      </ControlHandle>;
    })}
    <Html
      name={"single-point-action-controls"}
      wrapperClass={"grid-action-controls-wrapper"}
      center={true}
      position={[
        world.x,
        world.y,
        zZero(props.config)
          + soilZ
          + SINGLE_POINT_ACTION_CONTROL_Z,
      ]}>
      <div
        data-testid={"single-point-action-controls"}
        className={"grid-action-controls"}
        onPointerDown={stopThreeDPopupEvent}
        onContextMenu={stopThreeDPopupEvent}
        onWheel={stopThreeDPopupEvent}
        onClick={stopThreeDPopupEvent}>
        <button
          type={"button"}
          name={"single-point-cancel-control"}
          className={
            "grid-action-button grid-action-cancel fa fa-times"}
          title={t("Cancel")}
          aria-label={t("Cancel")}
          onClick={props.onCancel} />
        <div className={"grid-point-color-picker"}>
          <button
            type={"button"}
            name={"single-point-color-control"}
            className={[
              "grid-action-button",
              "grid-action-color",
              "fa",
              "fa-paint-brush",
              props.point.color,
            ].join(" ")}
            title={t("Select color")}
            aria-label={t("Select color")}
            onClick={() => setColorPickerOpen(!colorPickerOpen)} />
          {colorPickerOpen &&
            <div className={"grid-point-color-menu colorpicker-menu"}>
              <ColorPickerCluster
                current={props.point.color as ResourceColor}
                onChange={color => {
                  props.onChange({ ...props.point, color });
                  setColorPickerOpen(false);
                }} />
            </div>}
        </div>
        <button
          type={"button"}
          name={"single-point-save-control"}
          className={
            "grid-action-button grid-action-save fa fa-check"}
          title={t("Save")}
          aria-label={t("Save")}
          onClick={onSave} />
      </div>
    </Html>
  </Group>;
};

// eslint-disable-next-line complexity
const ActivePointerObjects = React.memo((props: ActivePointerObjectsProps) => {
  const {
    config, mapPoints, addPlantProps,
    pointerPlantRef, radiusRef, torusRef, billboardRef, imageRef,
    xCrosshairRef, yCrosshairRef, alignmentIndicatorRef,
    placementCoordinateLabelRef,
    singlePointRadiusRef,
    activePositionRef, getZ, mode, cropSlug,
  } = props;
  const zero = zeroFunc(config);
  const extents = extentsFunc(config);
  const iconSize = (addPlantProps.designer.cropRadius || DEFAULT_PLANT_RADIUS) * 2;
  const icon = findCropIcon(cropSlug);

  const { drawnPoint } = addPlantProps.designer;
  const hasCenter =
    !(isUndefined(drawnPoint?.cx) || isUndefined(drawnPoint.cy));
  const placementPhase = pointPlacementPhase(mode, drawnPoint);
  const finalizingPoint =
    mode == Mode.createPoint && placementPhase == "finalize";
  const gridPreview = hasDirtyGridPreview(mapPoints);
  React.useLayoutEffect(() => {
    const activePosition = activePositionRef.current;
    if (hasCenter) {
      pointerPlantRef.current?.position?.set(0, 0, 0);
      return;
    }
    if (!activePosition || gridPreview) { return; }
    const gardenPosition = getGardenPositionFunc(config)(activePosition);
    const gardenZ = getZ(gardenPosition.x, gardenPosition.y);
    const [x, y, z] = getWorldPositionFunc(config)({
      ...gardenPosition,
      z: gardenZ,
    });
    xCrosshairRef.current?.position.set(0, y, z);
    yCrosshairRef.current?.position.set(x, 0, z);
    alignmentIndicatorRef.current?.update(gardenPosition);
    placementCoordinateLabelRef.current?.update({
      ...gardenPosition,
      z: gardenZ,
    });
    pointerPlantRef.current?.position?.set(x, y, z);
  }, [
    alignmentIndicatorRef,
    config,
    gridPreview,
    placementCoordinateLabelRef,
    pointerPlantRef,
    activePositionRef,
    getZ,
    hasCenter,
    xCrosshairRef,
    yCrosshairRef,
  ]);
  return (
    <Group name={"hover-elements"}>
      {!hasCenter &&
        !gridPreview &&
        <Group name={"helpers"}>
          <Line
            ref={xCrosshairRef}
            name={"x-crosshair"}
            color={"white"}
            transparent={true}
            opacity={0.9}
            lineWidth={2}
            points={[
              [zero.x, 0, 0],
              [extents.x, 0, 0],
            ]} />
          <Line
            ref={yCrosshairRef}
            name={"y-crosshair"}
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
            config={config}
            plants={props.plants}
            weeds={props.weeds}
            points={mapPoints}
            showPlants={props.showPlants}
            showPoints={props.showPoints}
            showWeeds={props.showWeeds}
            getZ={props.getZ} />
        </Group>}
      <Group ref={pointerPlantRef} position={[0, 0, 0]}>
        <Group position={[0, 0, 0]}>
          {DRAW_POINT_MODES.includes(mode) &&
            !gridPreview &&
            drawnPoint &&
            <DrawnPoint
              radiusRef={radiusRef}
              torusRef={torusRef}
              billboardRef={billboardRef}
              imageRef={imageRef}
              config={config}
              getZ={getZ}
              designer={addPlantProps.designer}
              usePosition={hasCenter} />}
          {mode == Mode.createPoint && hasCenter && drawnPoint &&
            <SinglePointRadiusControl
              ref={singlePointRadiusRef}
              config={config}
              point={drawnPoint}
              getZ={getZ}
              editable={finalizingPoint}
              onChange={finalizingPoint
                ? radius => addPlantProps.dispatch({
                  type: Actions.SET_DRAWN_POINT_DATA,
                  payload: { ...drawnPoint, r: radius },
                })
                : undefined} />}
          {finalizingPoint && drawnPoint && !gridPreview &&
            <SinglePointFinalControls
              config={config}
              point={drawnPoint}
              gridSize={addPlantProps.gridSize}
              getZ={getZ}
              onChange={point => addPlantProps.dispatch({
                type: Actions.SET_DRAWN_POINT_DATA,
                payload: point,
              })}
              onCancel={() => addPlantProps.dispatch({
                type: Actions.SET_DRAWN_POINT_DATA,
                payload: {
                  ...drawnPoint,
                  cx: undefined,
                  cy: undefined,
                  r: 0,
                  placementPhase: "position",
                },
              })}
              onSave={() => createPoint({
                dispatch: addPlantProps.dispatch,
                drawnPoint,
                navigate: props.navigate,
              })} />}
          {mode == Mode.clickToAdd &&
            <Group>
              <React.Suspense
                fallback={<PointerPlantLoading iconSize={iconSize} />}>
                <PointerPlantIcon
                  icon={icon}
                  iconSize={iconSize} />
              </React.Suspense>
              <PlantPlacementSphere
                config={config}
                spread={findCropMetadata(cropSlug).spread} />
            </Group>}
          {!hasCenter && !gridPreview &&
            <PlacementCoordinateLabel
              ref={placementCoordinateLabelRef}
              position={[0, 0, iconSize + 45]} />}
        </Group>
      </Group>
    </Group>
  );
}, activePointerObjectsPropsEqual);

export interface SoilClickProps {
  config: Config;
  addPlantProps: AddPlantProps;
  pointerPlantRef: PointerPlantRef;
  navigate: NavigateFunction;
  getZ(x: number, y: number): number;
}

interface DrawPointSoilClickProps extends SoilClickProps {
  mode: Mode;
  cursor: { x: number, y: number };
}

const pointLocationPayload = (
  point: DrawnPointPayl,
  cursor: { x: number, y: number },
): DrawnPointPayl => ({
  ...point,
  cx: cursor.x,
  cy: cursor.y,
  r: 0,
  placementPhase: "finalize",
});

const weedClickPayload = (
  point: DrawnPointPayl,
  cursor: { x: number, y: number },
  hasCenter: boolean,
): DrawnPointPayl => hasCenter
  ? {
    ...point,
    r: singlePointRadiusFromCursor({
      x: point.cx ?? 0,
      y: point.cy ?? 0,
    }, cursor),
  }
  : {
    ...point,
    cx: cursor.x,
    cy: cursor.y,
  };

const drawPointSoilClick = (props: DrawPointSoilClickProps) => {
  const {
    addPlantProps, cursor, mode, navigate, pointerPlantRef,
  } = props;
  const { drawnPoint } = addPlantProps.designer;
  if (isUndefined(drawnPoint)) { return; }
  const hasCenter =
    !isUndefined(drawnPoint.cx) && !isUndefined(drawnPoint.cy);
  const phase = pointPlacementPhase(mode, drawnPoint);
  if (mode == Mode.createPoint && phase == "finalize") { return; }
  pointerPlantRef.current?.position?.set(0, 0, 0);
  if (mode == Mode.createPoint) {
    addPlantProps.dispatch({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: pointLocationPayload(drawnPoint, cursor),
    });
    return;
  }
  const payload = weedClickPayload(drawnPoint, cursor, hasCenter);
  addPlantProps.dispatch({
    type: Actions.SET_DRAWN_POINT_DATA,
    payload,
  });
  if (hasCenter && payload.r > 0) {
    createPoint({
      dispatch: addPlantProps.dispatch,
      drawnPoint: payload,
      navigate,
    });
  }
};

export const soilClick = (props: SoilClickProps) =>
  (e: ThreeEvent<MouseEvent>) => {
    const { config, addPlantProps } = props;
    const getGardenPosition = getGardenPositionFunc(config);
    const mode = getMode();
    e.stopPropagation();
    if (clickWasDragged(e)) { return; }
    if (mode == Mode.clickToAdd) {
      dropPlant3D({
        gardenCoords: getGardenPosition(e.point),
        gridSize: addPlantProps.gridSize,
        dispatch: addPlantProps.dispatch,
        getConfigValue: addPlantProps.getConfigValue,
        designer: addPlantProps.designer,
      });
    }
    if (!DRAW_POINT_MODES.includes(mode)) { return; }
    drawPointSoilClick({
      ...props,
      mode,
      cursor: getGardenPosition(e.point),
    });
  };

export interface SoilPointerMoveProps extends AllRefs {
  config: Config;
  addPlantProps: AddPlantProps;
  getZ(x: number, y: number): number;
  activePositionRef: ActivePositionRef;
}

// eslint-disable-next-line complexity
export const soilPointerMove = (props: SoilPointerMoveProps) =>
  (() => {
    const {
      config, addPlantProps,
      pointerPlantRef,
      radiusRef, torusRef, billboardRef, imageRef,
      xCrosshairRef, yCrosshairRef, activePositionRef,
      alignmentIndicatorRef,
      placementCoordinateLabelRef,
      singlePointRadiusRef,
    } = props;
    const getGardenPosition = getGardenPositionFunc(config);
    const get3DPosition = get3DPositionFunc(config);
    const getWorldPosition = getWorldPositionFunc(config);
    let frame = 0;
    let pendingGardenPosition: ReturnType<typeof getGardenPosition> | undefined;
    let lastRenderedPosition: { x: number, y: number } | undefined;

    // eslint-disable-next-line complexity
    const updatePointer = () => {
      frame = 0;
      const gardenPosition = pendingGardenPosition;
      pendingGardenPosition = undefined;
      if (!gardenPosition
        || !addPlantProps
        || !HOVER_OBJECT_MODES.includes(getMode())
        || isMobile()
        || !pointerPlantRef.current) { return; }
      const { x, y } = get3DPosition(gardenPosition);
      if (lastRenderedPosition?.x === x && lastRenderedPosition.y === y) {
        return;
      }
      const gardenZ = props.getZ(gardenPosition.x, gardenPosition.y);
      const [, , z] = getWorldPosition({
        ...gardenPosition,
        z: gardenZ,
      });
      xCrosshairRef.current?.position.set(0, y, z);
      yCrosshairRef.current?.position.set(x, 0, z);
      activePositionRef.current = { x, y };
      placementCoordinateLabelRef.current?.update({
        ...gardenPosition,
        z: gardenZ,
      });
      alignmentIndicatorRef.current?.update(gardenPosition);
      lastRenderedPosition = { x, y };
      if (getMode() == Mode.clickToAdd) {
        pointerPlantRef.current.position?.set(x, y, z);
      }
      if (DRAW_POINT_MODES.includes(getMode())) {
        const { drawnPoint } = addPlantProps.designer;
        if (isUndefined(drawnPoint)) { return; }
        const mode = getMode();
        const phase = pointPlacementPhase(mode, drawnPoint);
        const hasCenter =
          !isUndefined(drawnPoint.cx) && !isUndefined(drawnPoint.cy);
        if (mode == Mode.createPoint && phase == "finalize") { return; }
        if (!hasCenter || phase == "position") {
          pointerPlantRef.current.position?.set(x, y, z);
        } else {
          const radius = singlePointRadiusFromCursor(
            { x: drawnPoint.cx ?? 0, y: drawnPoint.cy ?? 0 },
            gardenPosition);
          singlePointRadiusRef.current?.update(gardenPosition);
          radiusRef.current?.scale.set(radius, radius, radius);
          torusRef.current?.scale.set(
            radius, radius, POINT_CYLINDER_SCALE_FACTOR);
          const imgSize = mathRound(radius * WEED_IMG_SIZE_FRACTION);
          billboardRef.current?.position.set(0, 0, imgSize / 2);
          imageRef.current?.scale.set(imgSize, imgSize, imgSize);
        }
      }
    };

    // eslint-disable-next-line complexity
    return (e: ThreeEvent<MouseEvent>) => {
      pendingGardenPosition = getGardenPosition(e.point);
      if (!frame) {
        frame = requestAnimationFrame(updatePointer);
      }
    };
  })();
