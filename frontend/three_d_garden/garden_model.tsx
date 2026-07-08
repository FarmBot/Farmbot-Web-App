import React from "react";
import { ThreeEvent, useThree } from "@react-three/fiber";
import { useLocation, useNavigate } from "react-router";
import {
  GizmoHelper, GizmoViewcube,
  OrbitControls, PerspectiveCamera,
  Stats, OrthographicCamera,
  Line,
  Sphere,
  StatsGl,
  Billboard,
} from "@react-three/drei";
import {
  BackSide,
  DoubleSide,
  MeshBasicMaterial as ThreeMeshBasicMaterial,
  type Object3D,
  OrthographicCamera as ThreeOrthographicCamera,
  PerspectiveCamera as ThreePerspectiveCamera,
} from "three";
import {
  AddPlantProps, Bed, getRenderSoilSurfaceGeometry,
} from "./bed";
import {
  Sky, Solar, Sun, sunPosition, ZoomBeacons,
  PlantInstances,
  PlantSpreadInstances,
  PointInstances, Grid, Clouds, Ground, WeedInstances,
  ThreeDGardenPlant,
  NorthArrow,
  skyColor,
  ThreeDPlantLabel,
  ZoomBeaconsProps,
  POINT_PIN_HEIGHT,
  POINT_PIN_RADIUS,
} from "./garden";
import { Config, PositionConfig } from "./config";
import { useSpring, animated } from "@react-spring/three";
import { Lab, Greenhouse } from "./scenes";
import { getCamera } from "./zoom_beacons_constants";
import {
  AmbientLight, AxesHelper, Group, Mesh, MeshBasicMaterial,
} from "./components";
import { isUndefined, round, uniq } from "lodash";
import {
  PointType, TaggedGenericPointer, TaggedImage, TaggedPoint, TaggedPointGroup,
  TaggedSensor,
  TaggedSensorReading,
  TaggedDevice,
  TaggedFbosConfig,
  TaggedSequence,
  TaggedTool,
  TaggedWeedPointer,
} from "farmbot";
import { BooleanSetting } from "../session_keys";
import { Actions } from "../constants";
import { SlotWithTool } from "../resources/interfaces";
import { cameraInit } from "./camera";
import { filterSoilPoints, getSurface } from "./triangles";
import { BigDistance, HOVER_OBJECT_MODES, RenderOrder } from "./constants";
import { getZFunc, serializeTriangles } from "./triangle_functions";
import { GroupOrderVisual } from "./group_order_visual";
import { MoistureReadings } from "./garden/moisture_texture";
import { FPSProbe } from "./fps_probe";
import { CameraSelectionUI } from "./camera_selection_ui";
import {
  PerfMark, perfMark, perfMeasure, usePerfRenderCount,
} from "../performance/perf";
import {
  botLoadInConfig, FallInGroup, GridRevealGroup, LoadStepReady, PopInGroup,
  ThreeDLoadProgress, ThreeDLoadProgressOverlay, THREE_D_LOAD_STEPS,
  ThreeDLoadStepId,
  useThreeDLoadProgress,
} from "./progressive_load";
import {
  FocusTransitionProvider, FocusVisibilityGroup, SmoothCameraControls,
  useSmoothCamera,
} from "./focus_transition";
import { type PlantIconAtlas } from "./garden/plant_icon_atlas";
import { Mode, TaggedPlant } from "../farm_designer/map/interfaces";
import { getMode } from "../farm_designer/map/util";
import { BotPosition, BotState, UserEnv } from "../devices/interfaces";
import { MovementState, TimeSettings } from "../interfaces";
import { Path } from "../internal_urls";
import {
  createSelectionLookup, hoverSelectionFromDesigner, pathForThreeDSelection,
  pointTypeForSelectionKind,
  routeLocationSelectionFromPath, routeSelectionFromPath,
  selectionForUuid, selectionKindAllowed,
  ThreeDObjectSelectionLayer,
  uuidForSelection,
} from "./selection";
import {
  ThreeDLocationSelection, ThreeDObjectHoverHandler, ThreeDObjectSelection,
  ThreeDObjectSelectionHandler,
} from "./selection_types";
import { setPanelOpen3D } from "./panel_actions";
import {
  get3DPositionFunc, getGardenPositionFunc, getWorldPositionFunc, threeSpace,
  zero as zeroFunc, zZero as zZeroFunc,
} from "./helpers";
import { clickWasDragged } from "./click_event";
import { clickMapPlant, selectPoint } from "../farm_designer/map/actions";
import { POINTER_TYPES } from "../point_groups/criteria/interfaces";
import { pointsSelectedByGroup } from "../point_groups/criteria/apply";
import { Text } from "./elements";
import {
  getToolSlotRenderPosition,
} from "./bot/components/tool_slot_position";
import { TaggedSceneObject } from "../scene_objects/interfaces";
import {
  SceneObjects, useSceneObjectPlacement,
} from "./scene_objects";

const AnimatedGroup = animated(Group);
const GRID_HOVER_TARGET_Z_OFFSET = 1;
const GRID_SELECTION_BLOCKED_MODES = [
  ...HOVER_OBJECT_MODES,
  Mode.boxSelect,
  Mode.editGroup,
  Mode.cameraSelection,
];
const gridSelectionAllowed = () =>
  !GRID_SELECTION_BLOCKED_MODES.includes(getMode());
const PROMO_POPUP_DISABLED_KINDS = ["camera", "utm", "electronics"];
const promoPopupDisabled = (
  promo: boolean | undefined,
  selection: ThreeDObjectSelection,
) => !!promo && PROMO_POPUP_DISABLED_KINDS.includes(selection.kind);
const HOVER_LABEL_FONT_SIZE = 50;
const HOVER_LABEL_PADDING = 40;
const TOOL_LABEL_Z_OFFSET = 35;
const TOOL_LABEL_TEXT_OFFSET = 80;
const useMultiSelectModifier = () => {
  const modifierRef = React.useRef(false);
  React.useEffect(() => {
    const updateModifier = (event: KeyboardEvent) => {
      modifierRef.current = event.ctrlKey || event.metaKey;
    };
    const clearModifier = () => { modifierRef.current = false; };
    window.addEventListener("keydown", updateModifier);
    window.addEventListener("keyup", updateModifier);
    window.addEventListener("blur", clearModifier);
    return () => {
      window.removeEventListener("keydown", updateModifier);
      window.removeEventListener("keyup", updateModifier);
      window.removeEventListener("blur", clearModifier);
    };
  }, []);
  return modifierRef;
};

const selectionPointTypeFor = (
  selection: ThreeDObjectSelection | undefined,
) => selection && pointTypeForSelectionKind(selection.kind);

const selectionPointTypesFor = (
  currentType: PointType,
  selectionType: PointType,
) => currentType == selectionType ? [currentType] : [...POINTER_TYPES];

const LazyBot = React.lazy(() =>
  import("./bot").then(module => ({ default: module.Bot })));
const LazyVisualization = React.lazy(() =>
  import("./visualization").then(module => ({
    default: module.Visualization,
  })));
export const SMOOTH_XL_CAMERA_BED_SCALE = 1.9;
export const SMOOTH_XL_CAMERA_HEIGHT_SCALE = 1.45;

interface ObjectHoverLabelProps {
  label: string;
  position: [number, number, number];
  textOffset: number;
}

const ObjectHoverLabel = (props: ObjectHoverLabelProps) =>
  <Billboard follow={true} position={props.position}>
    <Text
      renderOrder={RenderOrder.plantLabels}
      fontSize={HOVER_LABEL_FONT_SIZE}
      color={"white"}
      position={[0, props.textOffset, 0]}
      rotation={[0, 0, 0]}>
      {props.label}
    </Text>
  </Billboard>;

interface ObjectHoverLabelLookupProps {
  selection: ThreeDObjectSelection;
  config: Config;
  configPosition: PositionConfig;
  getZ(x: number, y: number): number;
  mapPoints: TaggedGenericPointer[];
  toolSlots: SlotWithTool[];
  weeds: TaggedWeedPointer[];
}

const weedHoverLabel = (props: ObjectHoverLabelLookupProps) => {
  const weed = props.weeds.find(resource =>
    resource.body.id == props.selection.id);
  if (!weed) { return undefined; }
  const radius = weed.body.radius == 0 ? 50 : weed.body.radius;
  return <ObjectHoverLabel
    label={weed.body.name || "" + weed.body.id}
    position={getWorldPositionFunc(props.config)({
      x: weed.body.x,
      y: weed.body.y,
      z: props.getZ(weed.body.x, weed.body.y),
    })}
    textOffset={radius + HOVER_LABEL_PADDING} />;
};

const pointHoverLabel = (props: ObjectHoverLabelLookupProps) => {
  const point = props.mapPoints.find(resource =>
    resource.body.id == props.selection.id);
  if (!point) { return undefined; }
  return <ObjectHoverLabel
    label={point.body.name || "" + point.body.id}
    position={getWorldPositionFunc(props.config)({
      x: point.body.x,
      y: point.body.y,
      z: props.getZ(point.body.x, point.body.y) + POINT_PIN_HEIGHT,
    })}
    textOffset={POINT_PIN_RADIUS + HOVER_LABEL_PADDING} />;
};

const slotHoverLabel = (props: ObjectHoverLabelLookupProps) => {
  const slot = props.toolSlots.find(resource =>
    resource.toolSlot.body.id == props.selection.id);
  if (!slot) { return undefined; }
  const position =
    getToolSlotRenderPosition(props.config, props.configPosition, slot);
  return <ObjectHoverLabel
    label={slot.tool?.body.name || "Empty slot"}
    position={[position.x, position.y, position.z + TOOL_LABEL_Z_OFFSET]}
    textOffset={TOOL_LABEL_TEXT_OFFSET} />;
};

const objectHoverLabel = (props: ObjectHoverLabelLookupProps) => {
  switch (props.selection.kind) {
    case "weed": return weedHoverLabel(props);
    case "point": return pointHoverLabel(props);
    case "slot": return slotHoverLabel(props);
    default: return undefined;
  }
};

interface ZoomBeaconsLoadInProps extends ZoomBeaconsProps {
  reveal?: boolean;
  onRest?: () => void;
}

const ZoomBeaconsLoadIn = (props: ZoomBeaconsLoadInProps) => {
  const { onRest, reveal: revealProp, ...zoomBeaconProps } = props;
  const reveal = revealProp !== false;
  const { scale, opacity } = useSpring({
    from: { scale: 0.35, opacity: 0 },
    to: {
      scale: reveal ? 1 : 0.35,
      opacity: reveal ? 1 : 0,
    },
    immediate: !reveal,
    onRest: reveal ? onRest : undefined,
    config: {
      tension: 220,
      friction: 26,
    },
  });

  return <Group name={"zoom-beacons-load-in"}>
    <ZoomBeacons
      {...zoomBeaconProps}
      loadInScale={scale}
      loadInOpacity={opacity} />
  </Group>;
};

interface SceneBoundaryProps {
  markName?: string;
  loadProgress?: ThreeDLoadProgress;
  markStep?: ThreeDLoadProgress["markStep"];
  loadStep?: ThreeDLoadStepId;
  reveal?: boolean;
  markReadyOnMount?: boolean;
  children?: React.ReactNode;
}

const SceneBoundary = (props: SceneBoundaryProps) => {
  const reveal = props.reveal !== false;
  const markReadyOnMount = props.markReadyOnMount !== false;
  const markStep = props.markStep || props.loadProgress?.markStep;
  return <React.Suspense fallback={undefined}>
    <Group name={props.loadStep && `${props.loadStep}-scene-boundary`}
      visible={reveal}>
      {props.children}
    </Group>
    {reveal && markReadyOnMount && props.loadStep && markStep &&
      <LoadStepReady
        step={props.loadStep}
        markStep={markStep} />}
    {reveal && props.markName && <PerfMark name={props.markName} />}
  </React.Suspense>;
};

export interface GardenModelProps {
  config: Config;
  configPosition: PositionConfig;
  activeFocus: string;
  setActiveFocus(focus: string): void;
  threeDPlants: ThreeDGardenPlant[];
  plants?: TaggedPlant[];
  addPlantProps?: AddPlantProps;
  mapPoints?: TaggedGenericPointer[];
  weeds?: TaggedWeedPointer[];
  toolSlots?: SlotWithTool[];
  tools?: TaggedTool[];
  sequences?: TaggedSequence[];
  fbosConfig?: TaggedFbosConfig;
  timeSettings?: TimeSettings;
  botOnline?: boolean;
  arduinoBusy?: boolean;
  currentBotLocation?: BotPosition;
  movementState?: MovementState;
  defaultAxes?: string;
  noUTM?: boolean;
  deviceAccount?: TaggedDevice;
  bot?: BotState;
  mountedToolName?: string | undefined;
  startTimeRef?: React.RefObject<number>;
  allPoints?: TaggedPoint[];
  groups?: TaggedPointGroup[];
  images?: TaggedImage[];
  sensorReadings?: TaggedSensorReading[];
  sensors?: TaggedSensor[];
  env?: UserEnv;
  set3DConfigValue?(key: keyof Config, value: string): void;
  sceneObjects?: TaggedSceneObject[];
  smoothFocusTransitions?: boolean;
  smoothConfigTransitions?: boolean;
  plantIconCapacities?: Record<string, number>;
  plantIconAtlas?: PlantIconAtlas;
  plantInstanceCapacity?: number;
  seasonResetKey?: number;
  preloadEnvironmentScenes?: boolean;
  showFarmbotLayerLoadProgress?: boolean;
  promo?: boolean;
  onDetailsRevealStart?(): void;
  onLoadComplete?(): void;
}

const EMPTY_GENERIC_POINTERS: TaggedGenericPointer[] = [];
const EMPTY_WEEDS: TaggedWeedPointer[] = [];
const EMPTY_POINTS: TaggedPoint[] = [];
const EMPTY_POINT_GROUPS: TaggedPointGroup[] = [];
const EMPTY_PLANTS: TaggedPlant[] = [];
const EMPTY_TOOLS: TaggedTool[] = [];
const EMPTY_TOOL_SLOTS: SlotWithTool[] = [];
const EMPTY_BOT_POSITION: BotPosition =
  { x: undefined, y: undefined, z: undefined };
const EMPTY_MOVEMENT_STATE: MovementState = {
  start: EMPTY_BOT_POSITION,
  distance: { x: 0, y: 0, z: 0 },
};
const EMPTY_IMAGES: TaggedImage[] = [];
const EMPTY_SENSORS: TaggedSensor[] = [];
const EMPTY_SENSOR_READINGS: TaggedSensorReading[] = [];
const EMPTY_SEQUENCES: TaggedSequence[] = [];
const EMPTY_ENV: UserEnv = {};

const smoothConfigSpringConfig = {
  tension: 160,
  friction: 24,
};

const SMOOTH_CONFIG_FIELDS = [
  "bedLengthOuter",
  "bedWidthOuter",
  "bedZOffset",
  "botSizeX",
  "botSizeY",
  "beamLength",
] as const;

type SmoothConfigField = typeof SMOOTH_CONFIG_FIELDS[number];
type SmoothConfigValues = Record<SmoothConfigField, number>;

const getSmoothConfigValues = (config: Config): SmoothConfigValues =>
  SMOOTH_CONFIG_FIELDS.reduce((values, field) => ({
    ...values,
    [field]: config[field],
  }), {} as SmoothConfigValues);

const useSmoothConfig = (
  config: Config,
  enabled: boolean | undefined,
): Config => {
  const initialValues = React.useMemo(() => getSmoothConfigValues(config), [
    config,
  ]);
  const [values, setValues] = React.useState(initialValues);
  const valuesRef = React.useRef(initialValues);
  const [, api] = useSpring(() => initialValues);
  const setCurrentValues = React.useCallback((next: SmoothConfigValues) => {
    valuesRef.current = next;
    setValues(next);
  }, []);

  React.useEffect(() => {
    if (!enabled) {
      valuesRef.current = initialValues;
      return;
    }
    api.start({
      from: valuesRef.current,
      to: initialValues,
      immediate: !config.animate,
      onChange: result => {
        const value = result.value as Partial<SmoothConfigValues>;
        setCurrentValues({ ...valuesRef.current, ...value });
      },
      onRest: () => setCurrentValues(initialValues),
      config: smoothConfigSpringConfig,
    });
  }, [
    api,
    config.animate,
    enabled,
    initialValues,
    setCurrentValues,
  ]);

  return React.useMemo(() => {
    if (!enabled) { return config; }
    return { ...config, ...values };
  }, [config, enabled, values]);
};

interface GardenLayerVisibility {
  showPlants: boolean;
  plantsVisible: boolean;
  farmbotVisible: boolean;
  showPoints: boolean;
  showWeeds: boolean;
  showSpread: boolean;
  showMoistureMap: boolean;
  showMoistureReadings: boolean;
  topDownAtStart: boolean;
}

interface GardenLayerVisibilityParams {
  addPlantProps: AddPlantProps | undefined;
  activeFocus: string;
  botVisibleInConfig: boolean;
  showSoilPoints: boolean;
}

// eslint-disable-next-line complexity
function getGardenLayerVisibility(
  params: GardenLayerVisibilityParams,
): GardenLayerVisibility {
  const getConfigValue = params.addPlantProps?.getConfigValue;
  const showPlants = !params.addPlantProps
    || !!getConfigValue?.(BooleanSetting.show_plants);
  const plantsVisible = params.activeFocus != "Planter bed" && showPlants;
  const showFarmbot = !params.addPlantProps
    || !!getConfigValue?.(BooleanSetting.show_farmbot);
  const farmbotVisible =
    params.activeFocus != "Planter bed"
    && showFarmbot
    && params.botVisibleInConfig;
  const showPoints = params.showSoilPoints
    || !!getConfigValue?.(BooleanSetting.show_points);
  const showWeeds = !params.addPlantProps
    || !!getConfigValue?.(BooleanSetting.show_weeds);
  const showSpread = !!getConfigValue?.(BooleanSetting.show_spread);
  const showMoistureMap = !!getConfigValue?.(
    BooleanSetting.show_moisture_interpolation_map);
  const showMoistureReadings = !!getConfigValue?.(
    BooleanSetting.show_sensor_readings);
  const topDownAtStart = !!getConfigValue?.(
    BooleanSetting.top_down_view);
  return {
    showPlants,
    plantsVisible,
    farmbotVisible,
    showPoints,
    showWeeds,
    showSpread,
    showMoistureMap,
    showMoistureReadings,
    topDownAtStart,
  };
}

interface StaticGardenLayersProps {
  config: Config;
  markStep: ThreeDLoadProgress["markStep"];
  environmentReveal: boolean;
  bedReveal: boolean;
  gridReveal: boolean;
  plantsReveal: boolean;
  weedsReveal: boolean;
  pointsReveal: boolean;
  skyRef: React.RefObject<ThreeMeshBasicMaterial | null>;
  activePositionRef: React.RefObject<{ x: number, y: number } | null>;
  soilSurfaceGeometry: ReturnType<typeof getSurface>["geometry"];
  getZ(x: number, y: number): number;
  images: TaggedImage[];
  activeFocus: string;
  mapPoints: TaggedGenericPointer[];
  showMoistureMap: boolean;
  showMoistureReadings: boolean;
  sensors: TaggedSensor[];
  sensorReadings: TaggedSensorReading[];
  addPlantProps: AddPlantProps | undefined;
  plantLabelNodes: React.ReactNode;
  plantsVisible: boolean;
  plantIconAtlas: PlantIconAtlas | undefined;
  setHover(active: boolean):
    ((e: ThreeEvent<PointerEvent>) => void) | undefined;
  threeDPlants: ThreeDGardenPlant[];
  plantIconCapacities: Record<string, number> | undefined;
  startTimeRef: React.RefObject<number> | undefined;
  dispatch: Function | undefined;
  showSpread: boolean;
  plantInstanceCapacity: number | undefined;
  routeKey: string;
  seasonResetKey: number | undefined;
  showWeeds: boolean;
  weeds: TaggedWeedPointer[];
  showPoints: boolean;
  plantsSelectable: boolean;
  pointsSelectable: boolean;
  weedsSelectable: boolean;
  onSelectObject?: ThreeDObjectSelectionHandler;
  onHoverObject?: ThreeDObjectHoverHandler;
  onHoverLabel?(selection: ThreeDObjectSelection | undefined): void;
  onPlantHoverChange(hovered: boolean): void;
  sceneObjectClick?: (e: ThreeEvent<MouseEvent>) => void;
  sceneObjectPointerMove?: (e: ThreeEvent<MouseEvent>) => void;
  sceneObjectPreview?: React.ReactNode;
}

// eslint-disable-next-line complexity
const StaticGardenLayersBase = (props: StaticGardenLayersProps) => {
  const {
    config, markStep, environmentReveal, bedReveal, gridReveal,
    plantsReveal, weedsReveal, pointsReveal, skyRef, activePositionRef,
    soilSurfaceGeometry, getZ, images, activeFocus, mapPoints,
    showMoistureMap, showMoistureReadings, sensors, sensorReadings,
    addPlantProps, plantLabelNodes, plantsVisible,
    plantIconAtlas, setHover, threeDPlants, plantIconCapacities, startTimeRef,
    dispatch, showSpread,
    plantInstanceCapacity, routeKey, seasonResetKey, showWeeds, weeds,
    showPoints, plantsSelectable, pointsSelectable, weedsSelectable,
    onSelectObject, onHoverObject, onHoverLabel, onPlantHoverChange,
    sceneObjectClick, sceneObjectPointerMove, sceneObjectPreview,
  } = props;
  const seasonLayerKey = `${config.plants}-${seasonResetKey || 0}`;
  const gridVisible = config.grid && activeFocus != "Planter bed";
  const plantLayerHasWork =
    threeDPlants.length > 0
    || React.Children.count(plantLabelNodes) > 0;
  const weedLayerHasWork = weeds.length > 0;
  const pointLayerHasWork = mapPoints.length > 0;
  const plantsLayerReveal = plantsReveal && plantsVisible;
  const weedsLayerReveal = weedsReveal && showWeeds;
  const pointsLayerReveal = pointsReveal && showPoints;
  const handlePlantPointerEnter = React.useCallback((e: ThreeEvent<PointerEvent>) => {
    setHover(true)?.(e);
    onPlantHoverChange(true);
  }, [onPlantHoverChange, setHover]);
  const handlePlantPointerMove = React.useCallback((e: ThreeEvent<PointerEvent>) => {
    setHover(true)?.(e);
    onPlantHoverChange(true);
  }, [onPlantHoverChange, setHover]);
  const handlePlantPointerLeave = React.useCallback((e: ThreeEvent<PointerEvent>) => {
    setHover(false)?.(e);
    onPlantHoverChange(false);
  }, [onPlantHoverChange, setHover]);

  return <>
    <SceneBoundary
      loadStep={"environment"}
      markStep={markStep}
      reveal={environmentReveal}
      markName={"three_d_ground_ready"}>
      <Sky sunPosition={sunPosition(0, 0, 0)} />
      <Sphere args={[BigDistance.sky, 8, 16]}>
        <MeshBasicMaterial
          ref={skyRef}
          color={skyColor(config.sun)}
          side={BackSide} />
      </Sphere>
      <Sun
        config={config}
        skyRef={skyRef}
        startTimeRef={startTimeRef} />
      <AmbientLight intensity={config.ambient / 100} />
      {config.ground &&
        <Ground
          config={config}
          onClick={sceneObjectClick}
          onPointerMove={sceneObjectPointerMove} />}
      {sceneObjectPreview}
    </SceneBoundary>
    <SceneBoundary
      loadStep={"bed"}
      markStep={markStep}
      reveal={bedReveal}
      markReadyOnMount={false}
      markName={"three_d_bed_ready"}>
      {config.north && <NorthArrow config={config} />}
      <PopInGroup
        name={"bed-load-in"}
        reveal={bedReveal}
        onRest={() => markStep("bed")}
        distance={config.bedHeight + config.bedZOffset}>
        <Bed
          config={config}
          soilSurfaceGeometry={soilSurfaceGeometry}
          getZ={getZ}
          images={images}
          activeFocus={activeFocus}
          mapPoints={mapPoints}
          showMoistureMap={showMoistureMap}
          showMoistureReadings={showMoistureReadings}
          sensors={sensors}
          sensorReadings={sensorReadings}
          activePositionRef={activePositionRef}
          addPlantProps={addPlantProps} />
      </PopInGroup>
    </SceneBoundary>
    <SceneBoundary
      loadStep={"grid"}
      markStep={markStep}
      reveal={gridReveal}
      markReadyOnMount={!gridVisible}
      markName={"three_d_grid_ready"}>
      {gridVisible &&
        <GridRevealGroup
          name={"grid-load-in"}
          reveal={gridReveal}
          onRest={() => markStep("grid")}>
          <Grid
            config={config}
            getZ={getZ}
            activeFocus={activeFocus} />
        </GridRevealGroup>}
    </SceneBoundary>
    <SceneBoundary
      loadStep={"plants"}
      markStep={markStep}
      reveal={plantsReveal}
      markReadyOnMount={!plantLayerHasWork || !plantsVisible}
      markName={"three_d_core_ready"}>
      {plantLayerHasWork &&
        <PopInGroup
          key={seasonLayerKey}
          name={"plants-load-in"}
          reveal={plantsLayerReveal}
          onRest={() => markStep("plants")}
          distance={200}
          animateExit={true}
          hideAfterExit={true}>
          <FocusVisibilityGroup
            name={"plant-labels"}
            visible={!activeFocus}>
            {plantLabelNodes}
          </FocusVisibilityGroup>
          <FocusVisibilityGroup name={"plants"}
            visible={true}
            keepMounted={true}
            onPointerEnter={plantsSelectable ? handlePlantPointerEnter : undefined}
            onPointerMove={plantsSelectable ? handlePlantPointerMove : undefined}
            onPointerLeave={plantsSelectable ? handlePlantPointerLeave : undefined}>
            <PlantInstances
              plants={threeDPlants}
              config={config}
              getZ={getZ}
              visible={true}
              iconCapacities={plantIconCapacities}
              plantIconAtlas={plantIconAtlas}
              startTimeRef={startTimeRef}
              onSelectObject={plantsSelectable ? onSelectObject : undefined}
              onHoverObject={plantsSelectable ? onPlantHoverChange : undefined}
              dispatch={plantsSelectable ? dispatch : undefined} />
            <PlantSpreadInstances
              plants={threeDPlants}
              visible={true}
              spreadVisible={showSpread}
              config={config}
              instanceCapacity={plantInstanceCapacity}
              activePositionRef={activePositionRef}
              routeKey={routeKey}
              getZ={getZ}
              onSelectObject={plantsSelectable ? onSelectObject : undefined}
              onHoverObject={plantsSelectable ? onPlantHoverChange : undefined}
              dispatch={plantsSelectable ? dispatch : undefined} />
          </FocusVisibilityGroup>
        </PopInGroup>}
    </SceneBoundary>
    <SceneBoundary
      loadStep={"weeds"}
      markStep={markStep}
      reveal={weedsReveal}
      markReadyOnMount={!weedLayerHasWork || !showWeeds}
      markName={"three_d_weeds_ready"}>
      {weedLayerHasWork &&
        <PopInGroup
          name={"weeds-load-in"}
          reveal={weedsLayerReveal}
          onRest={() => markStep("weeds")}
          distance={200}
          animateExit={true}
          hideAfterExit={true}>
          <Group name={"weeds"}
            visible={true}>
            <WeedInstances
              weeds={weeds}
              visible={true}
              config={config}
              getZ={getZ}
              plantIconAtlas={plantIconAtlas}
              onSelectObject={weedsSelectable ? onSelectObject : undefined}
              onHoverObject={weedsSelectable ? onHoverObject : undefined}
              onHoverLabel={weedsSelectable ? onHoverLabel : undefined}
              dispatch={weedsSelectable ? dispatch : undefined} />
          </Group>
        </PopInGroup>}
    </SceneBoundary>
    <SceneBoundary
      loadStep={"points"}
      markStep={markStep}
      reveal={pointsReveal}
      markReadyOnMount={!pointLayerHasWork || !showPoints}
      markName={"three_d_points_ready"}>
      {pointLayerHasWork &&
        <PopInGroup
          name={"points-load-in"}
          reveal={pointsLayerReveal}
          onRest={() => markStep("points")}
          distance={200}
          animateExit={true}
          hideAfterExit={true}>
          <Group name={"points"}
            visible={true}>
            <PointInstances
              points={mapPoints}
              visible={true}
              config={config}
              getZ={getZ}
              onSelectObject={pointsSelectable ? onSelectObject : undefined}
              onHoverObject={pointsSelectable ? onHoverObject : undefined}
              onHoverLabel={pointsSelectable ? onHoverLabel : undefined}
              dispatch={pointsSelectable ? dispatch : undefined} />
          </Group>
        </PopInGroup>}
    </SceneBoundary>
  </>;
};

const isStaticGardenLayerIgnoredProp = (
  key: keyof StaticGardenLayersProps,
) =>
  key == "markStep"
  || key == "onSelectObject"
  || key == "onHoverObject"
  || key == "onHoverLabel"
  || key == "onPlantHoverChange";

const staticGardenLayersPropsEqual = (
  prev: StaticGardenLayersProps,
  next: StaticGardenLayersProps,
) =>
  (Object.keys(prev) as (keyof StaticGardenLayersProps)[])
    .every(key =>
      isStaticGardenLayerIgnoredProp(key) || prev[key] === next[key]);

const StaticGardenLayers = React.memo(
  StaticGardenLayersBase, staticGardenLayersPropsEqual);

const ENVIRONMENT_SCENES = ["Outdoor", "Lab", "Greenhouse"] as const;
type EnvironmentScene = typeof ENVIRONMENT_SCENES[number];

const sceneMatches = (configScene: string, scene: EnvironmentScene) =>
  configScene.toLowerCase() == scene.toLowerCase();

const environmentSceneConfig = (
  config: Config,
  scene: EnvironmentScene,
): Config => {
  const bedType =
    scene != "Outdoor" && config.sizePreset != "Genesis XL"
      ? "Mobile"
      : "Standard";
  return {
    ...config,
    scene,
    clouds: scene == "Outdoor",
    people: scene != "Outdoor",
    bedType,
    bedZOffset: bedType == "Mobile" ? 500 : 0,
    legsFlush: false,
  };
};

interface EnvironmentScenePreloaderProps {
  config: Config;
  enabled: boolean;
  plantIconAtlas: PlantIconAtlas | undefined;
}

const EnvironmentScenePreloader = (props: EnvironmentScenePreloaderProps) => {
  if (!props.enabled) { return undefined; }
  return <React.Suspense fallback={undefined}>
    <Group name={"environment-scene-preloader"} visible={false}>
      {ENVIRONMENT_SCENES
        .filter(scene => !sceneMatches(props.config.scene, scene))
        .map(scene => {
          const config = environmentSceneConfig(props.config, scene);
          return <React.Fragment key={scene}>
            <Ground config={config} />
            {scene == "Outdoor" && <Clouds config={config} />}
            {scene == "Lab" &&
              <Lab
                config={config}
                activeFocus={""}
                reveal={false} />}
            {scene == "Greenhouse" &&
              <Greenhouse
                config={config}
                activeFocus={""}
                plantIconAtlas={props.plantIconAtlas}
                reveal={false} />}
          </React.Fragment>;
        })}
    </Group>
  </React.Suspense>;
};

const ignoredLoadStep = (_step: ThreeDLoadStepId) => undefined;
const allowLoadStep = () => true;

const farmbotLayerLoadProgress: ThreeDLoadProgress = {
  readyStepTimes: {},
  currentStep: { id: "farmbot", label: "Loading FarmBot" },
  progress: 6 / THREE_D_LOAD_STEPS.length * 100,
  complete: false,
  markStep: ignoredLoadStep,
  isStepAllowed: allowLoadStep,
};

interface FarmbotLoadInProps {
  activeFocus: string;
  config: Config;
  configPosition: PositionConfig;
  detailsReveal: boolean;
  dispatch: Function | undefined;
  getZ(x: number, y: number): number;
  loadInComplete: boolean;
  mountedToolName: string | undefined;
  onExitRest?(): void;
  onLoadInComplete(): void;
  reveal: boolean;
  toolSlots: SlotWithTool[] | undefined;
  onSelectObject?: ThreeDObjectSelectionHandler;
  onHoverObject?: ThreeDObjectHoverHandler;
  onToolSlotHoverObject?: ThreeDObjectHoverHandler;
  onHoverLabel?(selection: ThreeDObjectSelection | undefined): void;
}

const FarmbotLoadIn = (props: FarmbotLoadInProps) =>
  <FallInGroup
    name={"bot-load-in"}
    reveal={props.reveal}
    onRest={props.onLoadInComplete}
    onExitRest={props.onExitRest}
    config={botLoadInConfig}
    distance={props.config.columnLength + 1500}
    fadeIn={true}
    animateExit={true}
    hideAfterExit={true}
    preserveDepthWrite={true}>
    <LazyBot
      dispatch={props.dispatch}
      config={props.config}
      configPosition={props.configPosition}
      getZ={props.getZ}
      trailReady={props.reveal && props.detailsReveal && props.loadInComplete}
      activeFocus={props.activeFocus}
      mountedToolName={props.mountedToolName}
      onSelectObject={props.onSelectObject}
      onHoverObject={props.onHoverObject}
      onToolSlotHoverObject={props.onToolSlotHoverObject}
      onHoverLabel={props.onHoverLabel}
      toolSlots={props.toolSlots} />
  </FallInGroup>;

interface FarmbotLayerProps
  extends Omit<FarmbotLoadInProps,
    "loadInComplete" | "onLoadInComplete"> {
  layerVisible: boolean;
  loadProgress: ThreeDLoadProgress;
  markStep: ThreeDLoadProgress["markStep"];
  showLoadProgress: boolean;
}

const FarmbotLayer = (props: FarmbotLayerProps) => {
  const { markStep, onExitRest } = props;
  const [loadInComplete, setLoadInComplete] = React.useState(false);
  const markFarmbotLoaded = React.useCallback(() => {
    setLoadInComplete(true);
    markStep("farmbot");
  }, [markStep]);
  const markFarmbotHidden = React.useCallback(() => {
    onExitRest?.();
  }, [onExitRest]);
  const layerReveal = props.reveal && props.layerVisible;

  return <>
    {props.showLoadProgress && props.detailsReveal && props.layerVisible &&
      <ThreeDLoadProgressOverlay
        progress={farmbotLayerLoadProgress}
        complete={loadInComplete} />}
    <SceneBoundary
      loadStep={"farmbot"}
      loadProgress={props.loadProgress}
      reveal={props.reveal}
      markReadyOnMount={false}
      markName={"three_d_bot_ready"}>
      <FarmbotLoadIn
        activeFocus={props.activeFocus}
        config={props.config}
        configPosition={props.configPosition}
        detailsReveal={props.detailsReveal}
        dispatch={props.dispatch}
        getZ={props.getZ}
        loadInComplete={loadInComplete}
        mountedToolName={props.mountedToolName}
        onExitRest={markFarmbotHidden}
        onLoadInComplete={markFarmbotLoaded}
        onHoverObject={props.onHoverObject}
        onToolSlotHoverObject={props.onToolSlotHoverObject}
        onSelectObject={props.onSelectObject}
        onHoverLabel={props.onHoverLabel}
        reveal={layerReveal}
        toolSlots={props.toolSlots} />
    </SceneBoundary>
  </>;
};

interface OptionalFarmbotLayerProps
  extends Omit<FarmbotLayerProps, "layerVisible"> {
  visible: boolean;
}

const OptionalFarmbotLayer = (props: OptionalFarmbotLayerProps) => {
  const { visible, ...layerProps } = props;
  const [mounted, setMounted] = React.useState(visible);

  React.useEffect(() => {
    if (!visible) { return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, [visible]);

  const handleExitRest = React.useCallback(() => {
    setMounted(false);
  }, []);

  if (!mounted) {
    return <SceneBoundary
      loadStep={"farmbot"}
      loadProgress={props.loadProgress}
      reveal={props.reveal}
      markReadyOnMount={true}
      markName={"three_d_bot_ready"} />;
  }

  return <FarmbotLayer
    {...layerProps}
    layerVisible={visible}
    onExitRest={handleExitRest} />;
};

type SceneCursorValue = "grab" | "grabbing" | "pointer" | "crosshair";

interface SceneCursorProps {
  cursor: SceneCursorValue;
}

const SceneCursor = (props: SceneCursorProps) => {
  const state = useThree();
  React.useEffect(() => {
    const targets: HTMLElement[] = [];
    const addTarget = (target: EventTarget | undefined) => {
      if (target instanceof HTMLElement && !targets.includes(target)) {
        targets.push(target);
      }
    };
    const canvas = state.gl.domElement as HTMLElement | undefined;
    addTarget(state.events?.connected as EventTarget | undefined);
    addTarget(canvas);
    addTarget(canvas?.closest<HTMLElement>(".garden-bed-3d-model") || undefined);
    const previousCursors = targets.map(target => ({
      target,
      cursor: target.style.cursor,
    }));
    targets.forEach(target => { target.style.cursor = props.cursor; });
    return () => previousCursors.forEach(({ target, cursor }) => {
      target.style.cursor = cursor;
    });
  }, [state, props.cursor]);
  return <></>;
};

interface GridHoverPosition {
  x: number;
  y: number;
}

const isPlantIntersectionObject = (object: Object3D | undefined) => {
  const plantIndexes = object?.userData?.plantIndexes as unknown;
  return Array.isArray(plantIndexes);
};

const hasPlantIntersection = (event: ThreeEvent<PointerEvent>) =>
  event.intersections.some(intersection =>
    isPlantIntersectionObject(intersection.object));

interface GridHoverTargetProps {
  config: Config;
  enabled: boolean;
  getZ(x: number, y: number): number;
  soilSurfaceGeometry: ReturnType<typeof getSurface>["geometry"];
  onHoverPositionChange(position: GridHoverPosition | undefined): void;
  onLocationSelect(selection: ThreeDLocationSelection): void;
}

const inGardenGrid = (config: Config, position: GridHoverPosition) =>
  position.x >= 0
  && position.x <= config.botSizeX
  && position.y >= 0
  && position.y <= config.botSizeY;

const GridHoverTarget = (props: GridHoverTargetProps) => {
  const {
    config, enabled, getZ, onHoverPositionChange, onLocationSelect,
    soilSurfaceGeometry,
  } = props;
  const getGardenPosition = React.useMemo(() =>
    getGardenPositionFunc(config, false), [config]);
  const {
    bedLengthOuter, bedWidthOuter, bedXOffset, bedYOffset,
    columnLength, mirrorX, mirrorY, zGantryOffset,
  } = config;
  const hoverGeometryConfig = React.useMemo(() => ({
    bedLengthOuter,
    bedWidthOuter,
    bedXOffset,
    bedYOffset,
    mirrorX,
    mirrorY,
  }), [
    bedLengthOuter,
    bedWidthOuter,
    bedXOffset,
    bedYOffset,
    mirrorX,
    mirrorY,
  ]);
  const hoverGeometry = React.useMemo(() =>
    getRenderSoilSurfaceGeometry(hoverGeometryConfig, soilSurfaceGeometry), [
    hoverGeometryConfig,
    soilSurfaceGeometry,
  ]);
  const hoverPosition = React.useMemo((): [number, number, number] => [
    threeSpace(0, bedLengthOuter) + bedXOffset,
    threeSpace(0, bedWidthOuter) + bedYOffset,
    zZeroFunc({ columnLength, zGantryOffset }) + GRID_HOVER_TARGET_Z_OFFSET,
  ], [
    bedLengthOuter,
    bedWidthOuter,
    bedXOffset,
    bedYOffset,
    columnLength,
    zGantryOffset,
  ]);
  const getGridPosition = React.useCallback((
    point: { x: number, y: number },
  ): GridHoverPosition | undefined => {
    const position = getGardenPosition({
      x: point.x,
      y: point.y,
    });
    return inGardenGrid(config, position) ? position : undefined;
  }, [config, getGardenPosition]);
  const updateHover = React.useCallback((event: ThreeEvent<PointerEvent>) => {
    if (!enabled || !gridSelectionAllowed()) {
      onHoverPositionChange(undefined);
      return;
    }
    onHoverPositionChange(getGridPosition(event.point));
  }, [enabled, getGridPosition, onHoverPositionChange]);
  const clearHover = React.useCallback(() => {
    onHoverPositionChange(undefined);
  }, [onHoverPositionChange]);
  const selectLocation = React.useCallback((event: ThreeEvent<MouseEvent>) => {
    if (!enabled || clickWasDragged(event)) { return; }
    if (!gridSelectionAllowed()) { return; }
    const position = getGridPosition(event.point);
    if (!position) { return; }
    event.stopPropagation?.();
    const x = round(position.x);
    const y = round(position.y);
    onLocationSelect({
      kind: "location",
      x,
      y,
      z: round(getZ(x, y)),
    });
  }, [enabled, getGridPosition, getZ, onLocationSelect]);
  return <Mesh
    name={"grid-hover-target"}
    geometry={hoverGeometry}
    // eslint-disable-next-line no-null/no-null
    dispose={null}
    position={hoverPosition}
    onPointerOver={updateHover}
    onPointerMove={updateHover}
    onPointerOut={clearHover}
    onClick={selectLocation}>
    <MeshBasicMaterial
      color={"white"}
      transparent={true}
      opacity={0}
      depthWrite={false}
      side={DoubleSide} />
  </Mesh>;
};

interface GridHoverCrosshairsProps {
  config: Config;
  getZ(x: number, y: number): number;
  position: GridHoverPosition;
}

const GridHoverCrosshairs = (props: GridHoverCrosshairsProps) => {
  const { config, position } = props;
  const get3DPosition = React.useMemo(() =>
    get3DPositionFunc(config), [config]);
  const zero = get3DPosition({ x: 0, y: 0 });
  const extents = get3DPosition({ x: config.botSizeX, y: config.botSizeY });
  const hover = get3DPosition(position);
  const minX = Math.min(zero.x, extents.x);
  const maxX = Math.max(zero.x, extents.x);
  const minY = Math.min(zero.y, extents.y);
  const maxY = Math.max(zero.y, extents.y);
  const z = zeroFunc(config).z + props.getZ(position.x, position.y) + 6;
  return <Group name={"grid-hover-crosshairs"}>
    <Line
      name={"grid-hover-x-crosshair"}
      points={[[minX, hover.y, z], [maxX, hover.y, z]]}
      color={"white"}
      transparent={true}
      opacity={0.75}
      lineWidth={1.5} />
    <Line
      name={"grid-hover-y-crosshair"}
      points={[[hover.x, minY, z], [hover.x, maxY, z]]}
      color={"white"}
      transparent={true}
      opacity={0.75}
      lineWidth={1.5} />
  </Group>;
};

// eslint-disable-next-line complexity
export const GardenModel = (props: GardenModelProps) => {
  usePerfRenderCount("GardenModel");
  const {
    config: baseConfig, addPlantProps, onDetailsRevealStart, onLoadComplete,
    threeDPlants,
  } = props;
  const config = useSmoothConfig(
    baseConfig,
    props.smoothConfigTransitions,
  );
  const configPosition = props.configPosition;
  const cameraConfig = props.smoothConfigTransitions
    ? baseConfig
    : config;
  const dispatch = addPlantProps?.dispatch;
  const routeLocation = useLocation();
  const navigate = useNavigate();
  const mapPoints = props.mapPoints || EMPTY_GENERIC_POINTERS;
  const weeds = props.weeds || EMPTY_WEEDS;
  const allPoints = props.allPoints || EMPTY_POINTS;
  const groups = props.groups || EMPTY_POINT_GROUPS;
  const plants = props.plants || EMPTY_PLANTS;
  const toolSlots = props.toolSlots || EMPTY_TOOL_SLOTS;
  const tools = props.tools || EMPTY_TOOLS;
  const sequences = props.sequences || EMPTY_SEQUENCES;
  const images = props.images || EMPTY_IMAGES;
  const sensors = props.sensors || EMPTY_SENSORS;
  const sensorReadings = props.sensorReadings || EMPTY_SENSOR_READINGS;
  const Camera = config.perspective ? PerspectiveCamera : OrthographicCamera;
  const mode = getMode();
  const selectionPanelOpen = mode == Mode.boxSelect;
  const groupPanelOpen = mode == Mode.editGroup;
  const objectSelectionMode = selectionPanelOpen || groupPanelOpen;
  const selectionPointType = addPlantProps?.designer.selectionPointType;
  const kindSelectable = (kind: ThreeDObjectSelection["kind"]) =>
    !objectSelectionMode || selectionKindAllowed(kind, selectionPointType);
  const plantsSelectable = kindSelectable("plant");
  const pointsSelectable = kindSelectable("point");
  const weedsSelectable = kindSelectable("weed");
  const slotsSelectable = kindSelectable("slot");
  const selectionLookup = React.useMemo(() => createSelectionLookup({
    plants,
    points: mapPoints,
    weeds,
    toolSlots,
    sceneObjects: props.sceneObjects || [],
  }), [
    mapPoints,
    plants,
    props.sceneObjects,
    toolSlots,
    weeds,
  ]);
  const multiSelectModifier = useMultiSelectModifier();

  const [hoveredPlant, setHoveredPlant] =
    React.useState<number | undefined>(undefined);
  const [hoveredObjectLabel, setHoveredObjectLabel] =
    React.useState<ThreeDObjectSelection | undefined>(undefined);
  const [selectableObjectHoverCount, setSelectableObjectHoverCount] =
    React.useState(0);
  const [plantIntersected, setPlantIntersected] = React.useState(false);
  const selectableObjectHovered = selectableObjectHoverCount > 0 || plantIntersected;
  const [cameraDragging, setCameraDragging] = React.useState(false);
  const [gridHoverPosition, setGridHoverPosition] =
    React.useState<GridHoverPosition | undefined>(undefined);
  const setSelectableObjectHover = React.useCallback(
    (hovered: boolean) => setSelectableObjectHoverCount(count =>
      hovered ? count + 1 : Math.max(0, count - 1)),
    []);
  const setObjectHoverLabel = React.useCallback(
    (selection: ThreeDObjectSelection | undefined) =>
      setHoveredObjectLabel(selection),
    []);
  const handleCameraDragStart = React.useCallback(() => {
    setSelectableObjectHoverCount(0);
    setHoveredObjectLabel(undefined);
    setCameraDragging(true);
  }, []);
  const handleCameraDragEnd = React.useCallback(() => {
    setCameraDragging(false);
  }, []);
  const handleScenePointerLeave = React.useCallback(() => {
    setSelectableObjectHoverCount(0);
    setPlantIntersected(false);
    setHoveredObjectLabel(undefined);
    setGridHoverPosition(undefined);
  }, []);
  const handleScenePointerMove = React.useCallback((event: ThreeEvent<PointerEvent>) => {
    if (config.eventDebug) {
      console.log(event.intersections.map(x => x.object.name));
    }
    const nextPlantIntersected =
      plantsSelectable && hasPlantIntersection(event);
    setPlantIntersected(current =>
      current == nextPlantIntersected ? current : nextPlantIntersected);
  }, [config.eventDebug, plantsSelectable]);

  const getI = React.useCallback((e: ThreeEvent<PointerEvent>) => {
    if (e.buttons) { return -1; }
    const intersection = e.intersections[0];
    const instanceId = intersection.instanceId;
    if (!isUndefined(instanceId)) {
      const plantIndexes =
        intersection.object.userData.plantIndexes as number[] | undefined;
      if (plantIndexes) {
        return plantIndexes[instanceId];
      }
    }
    return parseInt(intersection.object.name);
  }, []);

  const setHover = React.useCallback((active: boolean) => {
    return config.labelsOnHover
      ? (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation?.();
        const nextHover = active ? getI(e) : undefined;
        setHoveredPlant(nextHover);
      }
      : undefined;
  }, [config.labelsOnHover, getI]);

  const isXL = cameraConfig.sizePreset == "Genesis XL";
  let modelScale = 1;
  if (!props.smoothFocusTransitions && isXL) {
    modelScale = 1.75;
  }
  const { scale } = useSpring({
    scale: modelScale,
    immediate: props.smoothFocusTransitions && !config.animate,
    config: {
      tension: 300,
      friction: 40,
    },
  });

  const baseAngle = 0;
  const heading = Math.ceil(cameraConfig.viewpointHeading / 90) * 90;
  const topDownCameraAngle = cameraConfig.topDown
    ? baseAngle + heading * Math.PI / 180
    : undefined;
  const cameraBedScale = props.smoothFocusTransitions && isXL
    ? SMOOTH_XL_CAMERA_BED_SCALE
    : 1;
  const cameraBedSize = React.useMemo(() => ({
    x: cameraConfig.bedLengthOuter * cameraBedScale,
    y: cameraConfig.bedWidthOuter * cameraBedScale,
  }), [
    cameraConfig.bedLengthOuter,
    cameraConfig.bedWidthOuter,
    cameraBedScale,
  ]);
  const defaultCamera = React.useMemo(
    () => {
      const nextCamera = cameraInit({
        topDown: cameraConfig.topDown,
        viewpointHeading: cameraConfig.viewpointHeading,
        bedSize: cameraBedSize,
        zoomFactor: config.zoomFactor,
      });
      return props.smoothFocusTransitions && isXL
        ? {
          ...nextCamera,
          position: [
            nextCamera.position[0],
            nextCamera.position[1],
            nextCamera.position[2] * SMOOTH_XL_CAMERA_HEIGHT_SCALE,
          ] as typeof nextCamera.position,
        }
        : nextCamera;
    },
    [
      cameraBedSize,
      cameraConfig.topDown,
      cameraConfig.viewpointHeading,
      isXL,
      props.smoothFocusTransitions,
      config.zoomFactor,
    ]);
  const camera = props.activeFocus
    ? getCamera(
      cameraConfig,
      props.configPosition,
      props.activeFocus,
      defaultCamera,
    )
    : defaultCamera;
  const [controlsCamera, setControlsCamera] =
    // eslint-disable-next-line no-null/no-null
    React.useState<ThreePerspectiveCamera | ThreeOrthographicCamera | null>(null);
  const [controls, setControls] =
    // eslint-disable-next-line no-null/no-null
    React.useState<SmoothCameraControls | null>(null);
  const loadProgress = useThreeDLoadProgress();
  const environmentReveal = loadProgress.isStepAllowed("environment");
  const bedReveal = loadProgress.isStepAllowed("bed");
  const gridReveal = loadProgress.isStepAllowed("grid");
  const plantsReveal = loadProgress.isStepAllowed("plants");
  const weedsReveal = loadProgress.isStepAllowed("weeds");
  const pointsReveal = loadProgress.isStepAllowed("points");
  const farmbotReveal = loadProgress.isStepAllowed("farmbot");
  const detailsReveal = loadProgress.isStepAllowed("details");
  const gridLoaded = loadProgress.readyStepTimes.grid !== undefined;
  const detailsRevealNotified = React.useRef(false);
  const loadCompleteNotified = React.useRef(false);
  const markLoadStep = loadProgress.markStep;
  const markDetailsLoaded = React.useCallback(() => {
    markLoadStep("details");
  }, [markLoadStep]);
  const [popupSelection, setPopupSelection] =
    React.useState<ThreeDObjectSelection | undefined>(undefined);
  const [locationSelection, setLocationSelection] =
    React.useState<ThreeDLocationSelection | undefined>(undefined);
  const routeSelection = React.useMemo(
    () => routeSelectionFromPath(routeLocation.pathname),
    [routeLocation.pathname]);
  const activePopupSelection = objectSelectionMode ? undefined : popupSelection;
  const activeLocationSelection =
    objectSelectionMode ? undefined : locationSelection;
  const activePopupSelectionRef =
    React.useRef<ThreeDObjectSelection | undefined>(activePopupSelection);
  const activeLocationSelectionRef =
    React.useRef<ThreeDLocationSelection | undefined>(activeLocationSelection);
  React.useLayoutEffect(() => {
    activePopupSelectionRef.current = activePopupSelection;
    activeLocationSelectionRef.current = activeLocationSelection;
  }, [activeLocationSelection, activePopupSelection]);
  const closePopup = React.useCallback(() => {
    setPopupSelection(undefined);
    setLocationSelection(undefined);
  }, []);
  const openMultiSelectPanel = React.useCallback((
    selection: ThreeDObjectSelection,
  ) => {
    if (!dispatch) { return false; }
    const currentSelection = activePopupSelection || routeSelection;
    const currentType = selectionPointTypeFor(currentSelection);
    const selectionType = selectionPointTypeFor(selection);
    const currentUuid = currentSelection &&
      uuidForSelection(selectionLookup, currentSelection);
    const selectionUuid = uuidForSelection(selectionLookup, selection);
    if (!currentUuid || !selectionUuid || currentUuid == selectionUuid) {
      return false;
    }
    if (!currentType || !selectionType) { return false; }
    dispatch({
      type: Actions.SET_SELECTION_POINT_TYPE,
      payload: selectionPointTypesFor(currentType, selectionType),
    });
    dispatch(selectPoint(uniq([currentUuid, selectionUuid])));
    dispatch(setPanelOpen3D(true));
    navigate(Path.plants("select"));
    closePopup();
    return true;
  }, [
    activePopupSelection,
    closePopup,
    dispatch,
    navigate,
    routeSelection,
    selectionLookup,
  ]);
  const onSelectObject = React.useCallback((
    selection: ThreeDObjectSelection,
  ) => {
    if (promoPopupDisabled(props.promo, selection)) {
      setLocationSelection(undefined);
      setPopupSelection(undefined);
      return true;
    }
    if (objectSelectionMode) {
      const uuid = uuidForSelection(selectionLookup, selection);
      if (uuid && selectionKindAllowed(selection.kind, selectionPointType)) {
        dispatch?.(clickMapPlant(uuid));
        setLocationSelection(undefined);
        setPopupSelection(undefined);
        return true;
      }
      return false;
    }
    if (multiSelectModifier.current && openMultiSelectPanel(selection)) {
      return true;
    }
    const activeSelection = activePopupSelectionRef.current;
    if (activeSelection?.kind == selection.kind &&
      activeSelection.id == selection.id) {
      closePopup();
      return true;
    }
    setLocationSelection(undefined);
    setPopupSelection(selection);
    return true;
  }, [
    closePopup,
    dispatch,
    multiSelectModifier,
    objectSelectionMode,
    openMultiSelectPanel,
    props.promo,
    selectionLookup,
    selectionPointType,
  ]);
  const onSelectLocation = React.useCallback((
    selection: ThreeDLocationSelection,
  ) => {
    const activeSelection = activeLocationSelectionRef.current;
    if (activeSelection?.x == selection.x &&
      activeSelection.y == selection.y &&
      activeSelection.z == selection.z) {
      closePopup();
      return;
    }
    setPopupSelection(undefined);
    setLocationSelection(selection);
  }, [closePopup]);
  const updateLocationSelection = React.useCallback((
    selection: ThreeDLocationSelection,
  ) => {
    setLocationSelection(selection);
  }, []);
  const openSelectedObjectPanel = React.useCallback((
    selection: ThreeDObjectSelection,
  ) => {
    dispatch?.(setPanelOpen3D(true));
    navigate(pathForThreeDSelection(selection));
    closePopup();
  }, [closePopup, dispatch, navigate]);
  const openSelectedLocationPanel = React.useCallback((
    selection: ThreeDLocationSelection,
  ) => {
    dispatch?.(setPanelOpen3D(true));
    navigate(Path.location(selection));
    closePopup();
  }, [closePopup, dispatch, navigate]);

  React.useEffect(() => {
    perfMark("garden_model_mounted");
  }, []);

  React.useEffect(() => {
    if (!activePopupSelection && !activeLocationSelection) { return; }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key == "Escape") { closePopup(); }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activeLocationSelection, activePopupSelection, closePopup]);

  React.useEffect(() => {
    if (!detailsReveal || detailsRevealNotified.current) { return; }
    detailsRevealNotified.current = true;
    onDetailsRevealStart?.();
  }, [detailsReveal, onDetailsRevealStart]);

  React.useEffect(() => {
    if (!loadProgress.complete || loadCompleteNotified.current) { return; }
    loadCompleteNotified.current = true;
    onLoadComplete?.();
  }, [loadProgress.complete, onLoadComplete]);

  const layerVisibility = React.useMemo(() => getGardenLayerVisibility({
    addPlantProps,
    activeFocus: props.activeFocus,
    botVisibleInConfig: config.bot,
    showSoilPoints: config.showSoilPoints,
  }), [
    addPlantProps,
    config.bot,
    config.showSoilPoints,
    props.activeFocus,
  ]);
  const {
    plantsVisible, farmbotVisible, showPoints, showWeeds,
    showSpread, showMoistureMap,
    showMoistureReadings, topDownAtStart,
  } = layerVisibility;
  const routeKey = `${routeLocation.pathname}?${routeLocation.search}`;
  const groupIdFromPath = React.useMemo(() => {
    const groupId = parseInt(
      routeLocation.pathname.split("/").filter(Boolean).pop() || "");
    return isFinite(groupId) ? groupId : undefined;
  }, [routeLocation.pathname]);
  const groupSelectedPoints = React.useMemo(() => {
    if (!groupPanelOpen || groupIdFromPath == undefined) { return undefined; }
    const group = groups.filter(group => group.body.id == groupIdFromPath)[0];
    return group ? pointsSelectedByGroup(group, allPoints) : undefined;
  }, [allPoints, groupIdFromPath, groupPanelOpen, groups]);
  const selectedObjectSelections = React.useMemo(() => {
    const selectedPoints = selectionPanelOpen
      ? addPlantProps?.designer.selectedPoints
      : groupSelectedPoints?.map(point => point.uuid);
    if (!selectedPoints) { return undefined; }
    const selections: ThreeDObjectSelection[] = [];
    selectedPoints.forEach(uuid => {
      const selection = selectionForUuid(selectionLookup, uuid);
      if (selection) { selections.push(selection); }
    });
    return selections;
  }, [
    addPlantProps?.designer.selectedPoints,
    groupSelectedPoints,
    selectionLookup,
    selectionPanelOpen,
  ]);
  const selectedLocation = React.useMemo(
    () => routeLocationSelectionFromPath(
      routeLocation.pathname,
      routeLocation.search,
    ), [routeLocation.pathname, routeLocation.search]);
  const hoverSelection = React.useMemo(() =>
    hoverSelectionFromDesigner(
      addPlantProps?.designer,
      plants,
      mapPoints,
      weeds,
      toolSlots,
      props.sceneObjects || [],
    ), [
    addPlantProps?.designer,
    plants,
    mapPoints,
    props.sceneObjects,
    weeds,
    toolSlots,
  ]);
  const visualSelection =
    activePopupSelection || hoverSelection || routeSelection;
  const gridHoverEnabled =
    !props.promo
    && config.grid
    && props.activeFocus != "Planter bed"
    && gridSelectionAllowed();
  const activeGridHoverPosition = gridHoverEnabled
    ? gridHoverPosition
    : undefined;
  const showGridHoverCrosshairs =
    gridLoaded
    && !!activeGridHoverPosition
    && !cameraDragging
    && !selectableObjectHovered;
  let sceneCursor: SceneCursorValue = "grab";
  if (activeGridHoverPosition) {
    sceneCursor = "crosshair";
  }
  if (selectableObjectHovered) {
    sceneCursor = "pointer";
  }
  if (cameraDragging) {
    sceneCursor = "grabbing";
  }

  const soilPointConfig = React.useMemo(() => ({
    bedHeight: config.bedHeight,
    bedLengthOuter: config.bedLengthOuter,
    bedWallThickness: config.bedWallThickness,
    bedWidthOuter: config.bedWidthOuter,
    bedXOffset: config.bedXOffset,
    bedYOffset: config.bedYOffset,
    columnLength: config.columnLength,
    exaggeratedZ: config.exaggeratedZ,
    perspective: config.perspective,
    soilHeight: config.soilHeight,
    zGantryOffset: config.zGantryOffset,
  }), [
    config.bedHeight,
    config.bedLengthOuter,
    config.bedWallThickness,
    config.bedWidthOuter,
    config.bedXOffset,
    config.bedYOffset,
    config.columnLength,
    config.exaggeratedZ,
    config.perspective,
    config.soilHeight,
    config.zGantryOffset,
  ]);
  const soilPoints = React.useMemo(
    () => perfMeasure("soilPointFilterMs", () =>
      filterSoilPoints({ points: mapPoints, config: soilPointConfig })),
    [mapPoints, soilPointConfig]);
  const soilSurface = React.useMemo(() =>
    perfMeasure("soilSurfaceMs", () => getSurface(soilPoints)), [soilPoints]);
  React.useEffect(() => {
    perfMeasure("soilStorageMs", () => {
      sessionStorage.setItem("soilSurfaceTriangles",
        serializeTriangles(soilSurface.triangles));
    });
  }, [soilSurface.triangles]);
  const getZ = React.useMemo(
    () => getZFunc(soilSurface.triangles, -config.soilHeight),
    [soilSurface.triangles, config.soilHeight]);
  const addingSceneObject = location.pathname == Path.sceneObjects("add");
  const editingSceneObject = Path.startsWith(Path.sceneObjects())
    && !addingSceneObject
    && !!Path.getSlug(Path.sceneObjects());
  const sceneObjectPlacement = useSceneObjectPlacement({
    config,
    enabled: addingSceneObject,
    dispatch,
    sceneObjects: props.sceneObjects,
    drawnSceneObject: props.addPlantProps?.designer.drawnSceneObject,
  });

  const sceneDetailsLoadIn =
    config.scene == "Lab" || config.scene == "Greenhouse";
  const animatedDetailsLoadIn = sceneDetailsLoadIn || config.zoomBeacons;

  const topDownZoomLevel = 0.25 * 3000 / cameraConfig.bedLengthOuter;
  const targetZoom = cameraConfig.topDown ? topDownZoomLevel : 1;
  const focusTransitionsEnabled =
    !!props.smoothFocusTransitions && config.animate;
  const solarVisible =
    config.solar || props.activeFocus == "What you need to provide";
  const renderSolar = focusTransitionsEnabled || solarVisible;
  const renderedCamera = useSmoothCamera({
    camera,
    zoom: targetZoom,
    enabled: focusTransitionsEnabled,
    cameraObject: controlsCamera,
    controls,
    updateStateDuringTransition: !focusTransitionsEnabled,
  });

  // eslint-disable-next-line no-null/no-null
  const skyRef = React.useRef<ThreeMeshBasicMaterial>(null);
  // eslint-disable-next-line no-null/no-null
  const activePositionRef = React.useRef<{ x: number, y: number }>(null);

  const plantLabelConfig = React.useMemo(() => ({
    bedLengthOuter: config.bedLengthOuter,
    bedWidthOuter: config.bedWidthOuter,
    bedXOffset: config.bedXOffset,
    bedYOffset: config.bedYOffset,
    columnLength: config.columnLength,
    labels: config.labels,
    labelsOnHover: config.labelsOnHover,
    mirrorX: config.mirrorX,
    mirrorY: config.mirrorY,
    zGantryOffset: config.zGantryOffset,
  }), [
    config.bedLengthOuter,
    config.bedWidthOuter,
    config.bedXOffset,
    config.bedYOffset,
    config.columnLength,
    config.labels,
    config.labelsOnHover,
    config.mirrorX,
    config.mirrorY,
    config.zGantryOffset,
  ]);
  const plantLabelNodes = React.useMemo(
    () => {
      if (!plantLabelConfig.labels && !plantLabelConfig.labelsOnHover) {
        return undefined;
      }
      if (plantLabelConfig.labelsOnHover) {
        if (hoveredPlant === undefined) { return undefined; }
        const plant = threeDPlants[hoveredPlant];
        return plant &&
          <ThreeDPlantLabel key={hoveredPlant} i={hoveredPlant}
            plant={plant}
            config={plantLabelConfig}
            getZ={getZ}
            hoveredPlant={hoveredPlant} />;
      }
      return threeDPlants.map((plant, i) =>
        <ThreeDPlantLabel key={i} i={i}
          plant={plant}
          config={plantLabelConfig}
          getZ={getZ}
          hoveredPlant={hoveredPlant} />);
    },
    [
      threeDPlants,
      getZ,
      hoveredPlant,
      plantLabelConfig,
    ]);
  const objectHoverLabelNode = React.useMemo(() => {
    if (!config.labelsOnHover || !hoveredObjectLabel) { return undefined; }
    return objectHoverLabel({
      selection: hoveredObjectLabel,
      config,
      configPosition,
      getZ,
      mapPoints,
      toolSlots,
      weeds,
    });
  }, [
    config,
    configPosition,
    getZ,
    hoveredObjectLabel,
    mapPoints,
    toolSlots,
    weeds,
  ]);

  let cameraScale: number | typeof scale = scale;
  if (props.smoothFocusTransitions || props.activeFocus) {
    cameraScale = 1;
  }
  const cameraProps = focusTransitionsEnabled
    ? {}
    : { position: renderedCamera.position, zoom: renderedCamera.zoom };
  const orbitControlProps = focusTransitionsEnabled
    ? {}
    : { target: renderedCamera.target };

  return <FocusTransitionProvider enabled={focusTransitionsEnabled}>
    {/* eslint-disable-next-line no-null/no-null */}
    <Group dispose={null}
      onPointerMove={handleScenePointerMove}
      onPointerLeave={handleScenePointerLeave}>
      <FPSProbe />
      <PerfMark name={"garden_model_rendered"} />
      <SceneCursor cursor={sceneCursor} />
      <AnimatedGroup scale={cameraScale}>
        <Camera
          ref={setControlsCamera}
          makeDefault={true}
          name={"camera"}
          fov={40} near={10} far={BigDistance.far}
          {...cameraProps}
          up={[0, 0, 1]} />
      </AnimatedGroup>
      {controlsCamera &&
        <OrbitControls
          ref={setControls}
          camera={controlsCamera}
          maxPolarAngle={Math.PI / 2}
          minAzimuthAngle={topDownCameraAngle}
          maxAzimuthAngle={topDownCameraAngle}
          enableRotate={config.rotate}
          enableZoom={config.zoom}
          zoomToCursor={true}
          enablePan={config.pan}
          dampingFactor={0.2}
          {...orbitControlProps}
          onStart={handleCameraDragStart}
          onEnd={handleCameraDragEnd}
          minZoom={config.lightsDebug ? 0 : 0.05}
          maxZoom={10}
          minDistance={config.lightsDebug ? 50 : 500}
          maxDistance={config.lightsDebug ? BigDistance.devZoom : BigDistance.zoom} />}
      <ThreeDLoadProgressOverlay
        progress={loadProgress}
        complete={detailsReveal} />
      <StaticGardenLayers
        config={config}
        markStep={markLoadStep}
        environmentReveal={environmentReveal}
        bedReveal={bedReveal}
        gridReveal={gridReveal}
        plantsReveal={plantsReveal}
        weedsReveal={weedsReveal}
        pointsReveal={pointsReveal}
        skyRef={skyRef}
        activePositionRef={activePositionRef}
        soilSurfaceGeometry={soilSurface.geometry}
        getZ={getZ}
        images={images}
        activeFocus={props.activeFocus}
        mapPoints={mapPoints}
        showMoistureMap={showMoistureMap}
        showMoistureReadings={showMoistureReadings}
        sensors={sensors}
        sensorReadings={sensorReadings}
        addPlantProps={addPlantProps}
        plantLabelNodes={plantLabelNodes}
        plantsVisible={plantsVisible}
        plantIconAtlas={props.plantIconAtlas}
        setHover={setHover}
        threeDPlants={threeDPlants}
        plantIconCapacities={props.plantIconCapacities}
        startTimeRef={props.startTimeRef}
        dispatch={dispatch}
        showSpread={showSpread}
        plantInstanceCapacity={props.plantInstanceCapacity}
        routeKey={routeKey}
        seasonResetKey={props.seasonResetKey}
        showWeeds={showWeeds}
        weeds={weeds}
        plantsSelectable={plantsSelectable}
        pointsSelectable={pointsSelectable}
        weedsSelectable={weedsSelectable}
        onSelectObject={onSelectObject}
        onHoverObject={setSelectableObjectHover}
        onHoverLabel={config.labelsOnHover ? setObjectHoverLabel : undefined}
        onPlantHoverChange={setPlantIntersected}
        showPoints={showPoints}
        sceneObjectClick={addingSceneObject
          ? sceneObjectPlacement.onClick
          : undefined}
        sceneObjectPointerMove={addingSceneObject && !editingSceneObject
          ? sceneObjectPlacement.onPointerMove
          : undefined}
        sceneObjectPreview={addingSceneObject
          ? sceneObjectPlacement.preview
          : undefined} />
      {objectHoverLabelNode}
      {gridHoverEnabled &&
        <GridHoverTarget
          config={config}
          enabled={gridHoverEnabled}
          getZ={getZ}
          soilSurfaceGeometry={soilSurface.geometry}
          onLocationSelect={onSelectLocation}
          onHoverPositionChange={setGridHoverPosition} />}
      {showGridHoverCrosshairs && activeGridHoverPosition &&
        <GridHoverCrosshairs
          config={config}
          getZ={getZ}
          position={activeGridHoverPosition} />}
      <OptionalFarmbotLayer
        activeFocus={props.activeFocus}
        config={config}
        configPosition={props.configPosition}
        detailsReveal={detailsReveal}
        dispatch={objectSelectionMode ? undefined : dispatch}
        getZ={getZ}
        loadProgress={loadProgress}
        markStep={markLoadStep}
        mountedToolName={props.mountedToolName}
        reveal={farmbotReveal}
        showLoadProgress={props.showFarmbotLayerLoadProgress !== false}
        toolSlots={props.toolSlots}
        onSelectObject={slotsSelectable ? onSelectObject : undefined}
        onHoverObject={objectSelectionMode ? undefined : setSelectableObjectHover}
        onToolSlotHoverObject={objectSelectionMode && slotsSelectable
          ? setSelectableObjectHover
          : undefined}
        onHoverLabel={config.labelsOnHover && slotsSelectable
          ? setObjectHoverLabel
          : undefined}
        visible={farmbotVisible} />
      <ThreeDObjectSelectionLayer
        config={config}
        configPosition={props.configPosition}
        selection={visualSelection}
        selectedObjects={selectedObjectSelections}
        popupSelection={activePopupSelection}
        locationSelection={activeLocationSelection}
        selectedLocation={selectedLocation}
        onClosePopup={closePopup}
        onOpenPanel={openSelectedObjectPanel}
        onOpenLocationPanel={openSelectedLocationPanel}
        onUpdateLocationSelection={updateLocationSelection}
        plants={plants}
        points={mapPoints}
        weeds={weeds}
        toolSlots={toolSlots}
        tools={tools}
        sequences={sequences}
        sensors={sensors}
        fbosConfig={props.fbosConfig}
        timeSettings={props.timeSettings}
        botOnline={!!props.botOnline}
        arduinoBusy={!!props.arduinoBusy}
        currentBotLocation={props.currentBotLocation || EMPTY_BOT_POSITION}
        movementState={props.movementState || EMPTY_MOVEMENT_STATE}
        defaultAxes={props.defaultAxes || "XY"}
        noUTM={!!props.noUTM}
        deviceAccount={props.deviceAccount}
        bot={props.bot}
        env={props.env || EMPTY_ENV}
        set3DConfigValue={props.set3DConfigValue}
        dispatch={dispatch}
        gridLoaded={gridLoaded}
        getZ={getZ} />
      <SceneBoundary
        loadStep={"details"}
        loadProgress={loadProgress}
        reveal={detailsReveal}
        markReadyOnMount={false}
        markName={"three_d_details_ready"}>
        {config.stats && <StatsGl className={"stats-gl"} />}
        {config.stats && <Stats />}
        {config.zoomBeacons &&
          <ZoomBeaconsLoadIn
            config={config}
            configPosition={props.configPosition}
            activeFocus={props.activeFocus}
            setActiveFocus={props.setActiveFocus}
            reveal={detailsReveal}
            onRest={!sceneDetailsLoadIn ? markDetailsLoaded : undefined} />}
        {config.threeAxes && <AxesHelper args={[5000]} />}
        {config.viewCube && <GizmoHelper><GizmoViewcube /></GizmoHelper>}
        {config.clouds && <Clouds config={config} />}
        {showMoistureMap && config.moistureDebug &&
          <MoistureReadings
            color={"green"}
            radius={50}
            applyOffset={true}
            config={config}
            readings={sensorReadings} />}
        <GroupOrderVisual
          allPoints={allPoints}
          groups={groups}
          config={config}
          tryGroupSortType={props.addPlantProps?.designer.tryGroupSortType}
          getZ={getZ} />
        {props.addPlantProps?.designer.visualizedSequence &&
          <LazyVisualization
            visualizedSequenceUUID={props.addPlantProps?.designer.visualizedSequence}
            config={config}
            configPosition={props.configPosition} />}
        {renderSolar &&
          <Solar config={config} activeFocus={props.activeFocus} />}
        {config.scene == "Lab" &&
          <Lab
            config={config}
            activeFocus={props.activeFocus}
            reveal={detailsReveal}
            onDetailsLoadInRest={markDetailsLoaded} />}
        {config.scene == "Greenhouse" &&
          <Greenhouse
            config={config}
            activeFocus={props.activeFocus}
            plantIconAtlas={props.plantIconAtlas}
            reveal={detailsReveal}
            onDetailsLoadInRest={markDetailsLoaded} />}
        {config.cameraSelectionView &&
          <CameraSelectionUI
            config={config}
            dispatch={dispatch}
            topDownAtStart={topDownAtStart} />}
        <EnvironmentScenePreloader
          config={config}
          enabled={!!props.preloadEnvironmentScenes && loadProgress.complete}
          plantIconAtlas={props.plantIconAtlas} />
        {detailsReveal && !animatedDetailsLoadIn &&
          <LoadStepReady
            step={"details"}
            markStep={loadProgress.markStep} />}
        <SceneObjects
          config={config}
          activeFocus={props.activeFocus}
          dispatch={dispatch}
          designer={addPlantProps?.designer}
          hoverSelection={hoverSelection}
          sceneObjects={props.sceneObjects} />
      </SceneBoundary>
    </Group>
  </FocusTransitionProvider>;
};
