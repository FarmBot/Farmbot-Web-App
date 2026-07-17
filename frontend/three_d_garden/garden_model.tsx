import React from "react";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useLocation, useNavigate } from "react-router";
import {
  OrbitControls, PerspectiveCamera,
  Stats,
  Line,
  Sphere,
  StatsGl,
  Billboard,
} from "@react-three/drei";
import {
  BackSide,
  DoubleSide,
  MeshBasicMaterial as ThreeMeshBasicMaterial,
  Group as ThreeGroup,
  type Object3D,
  PerspectiveCamera as ThreePerspectiveCamera,
  Vector3,
} from "three";
import {
  AddPlantProps, Bed, getRenderSoilSurfaceGeometry,
} from "./bed";
import {
  Sky, LegacySolar, Sun, sunPosition, ZoomBeacons,
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
  GroundTexturePreloader,
} from "./garden";
import { Config, PositionConfig } from "./config";
import { useSpring } from "@react-spring/three";
import { Lab, Greenhouse } from "./scenes";
import { Camera, getCamera } from "./zoom_beacons_constants";
import {
  AmbientLight, AxesHelper, Group, Mesh, MeshBasicMaterial,
} from "./components";
import { isUndefined, range, round, uniq } from "lodash";
import {
  PointType, TaggedGenericPointer, TaggedImage, TaggedPoint, TaggedPointGroup,
  TaggedSensor,
  TaggedSensorReading,
  TaggedDevice,
  TaggedFbosConfig,
  TaggedSequence,
  TaggedTool,
  TaggedWeedPointer,
  TaggedPeripheral,
  TaggedSceneObject,
} from "farmbot";
import { BooleanSetting } from "../session_keys";
import { PeripheralValues } from
  "../farm_designer/map/layers/farmbot/bot_trail";
import { Actions } from "../constants";
import { SlotWithTool } from "../resources/interfaces";
import {
  applyCameraClippingRange, cameraInit, cameraPositionForFov,
  CameraViewport, canonicalCamera, distanceForFov, getCameraFit,
  getCameraFromUrlParams,
  NARROW_CAMERA_FOV, getCameraClippingRange, nearestCardinalTopViewDirection,
  NORMAL_CAMERA_FOV, positionForViewDirection, setCameraUrlParams,
} from "./camera";
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
  applySmoothCameraState, CameraInterpolation, FocusTransitionProvider,
  FocusVisibilityGroup, SmoothCameraControls, readSmoothCameraState,
  SmoothCameraState,
  useSmoothCamera,
} from "./focus_transition";
import { type PlantIconAtlas } from "./garden/plant_icon_atlas";
import { Mode, TaggedPlant } from "../farm_designer/map/interfaces";
import { DesignerState, ThreeDViewMode } from "../farm_designer/interfaces";
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
import {
  SceneObjects, staticSceneObjects, useSceneObjectPlacement,
} from "./scene_objects";
import {
  getSectionClippingPlanes, getSectionOutsidePlaneConstants,
  sectionNearPlaneIndex,
  SECTION_CLIPPING_EXEMPT, useAnimatedSectionPlanes, useSectionClipping,
} from "./section";
import { effectiveSectionCenter } from
  "../farm_designer/three_d_section";
import {
  getStargazingCamera, Telescope,
} from "./bed/objects/telescope";
import { SectionCutFaces } from "./section_cut_faces";
import { SectionGroundOverlays } from "./section_overlays";
import { SectionControls } from "./section_controls";
import { getBotKinematics } from "./bot/kinematics";
import {
  BotPositionSnapshotStore, createBotPositionSnapshotStore,
  useBotPositionSnapshot,
} from "./bot/position_spring";
import {
  ViewPrism, VIEW_PRISM_BOUNDING_BOX_HALF_SIZE, ViewPrismDirection,
  VIEW_PRISM_TOP_CENTER, VIEW_PRISM_TOP_CENTER_BOUNDING_RADIUS,
} from "./view_prism";
import { success } from "../toast/toast";
import { t } from "../i18next_wrapper";
import { STARGAZING_DEFAULT_FOV } from
  "../farm_designer/stargazing_constants";
import { markConstellationFound } from
  "../farm_designer/stargazing_progress";

const CAMERA_SCENE_RADIUS = BigDistance.sky + 1000;

export const notifyStartingCameraSaved = () => success(
  "",
  { title: t("Saved starting camera view") },
);

export interface GardenCameraRequest {
  camera: Camera;
  fov: number;
  interpolation?: CameraInterpolation;
  onRest?(): void;
}

export const SPACEFLIGHT_CAMERA: Camera = {
  position: [50000, 0, 10000],
  target: [0, 0, 12000],
};
export const SPACEFLIGHT_FOV = 60;
const SPACEFLIGHT_ORBIT_SPEED = Math.PI / 60;
const SPACEFLIGHT_ORBIT_RADIUS = 50000;
const SPACEFLIGHT_POLAR_ANGLE = Math.atan2(
  SPACEFLIGHT_ORBIT_RADIUS,
  SPACEFLIGHT_CAMERA.position[2] - SPACEFLIGHT_CAMERA.target[2],
);

export const advanceSpaceflightOrbit = (
  camera: Camera,
  deltaSeconds: number,
): Camera => {
  const angle = Math.atan2(
    camera.position[1] - SPACEFLIGHT_CAMERA.target[1],
    camera.position[0] - SPACEFLIGHT_CAMERA.target[0],
  ) + SPACEFLIGHT_ORBIT_SPEED * deltaSeconds;
  return {
    target: SPACEFLIGHT_CAMERA.target,
    position: [
      SPACEFLIGHT_CAMERA.target[0]
      + Math.cos(angle) * SPACEFLIGHT_ORBIT_RADIUS,
      SPACEFLIGHT_CAMERA.target[1]
      + Math.sin(angle) * SPACEFLIGHT_ORBIT_RADIUS,
      SPACEFLIGHT_CAMERA.position[2],
    ],
  };
};

export const cameraAtRadius = (camera: Camera, radius: number): Camera => {
  const direction = camera.position.map((value, index) =>
    value - camera.target[index]) as Camera["position"];
  return {
    target: camera.target,
    position: positionForViewDirection(direction, camera.target, radius),
  };
};

export const createStartingCameraSelector = (
  setCameraRequest: (request: GardenCameraRequest) => void,
  bedSize: { x: number; y: number },
  zoomFactor: number,
  bootstrapRadius: number,
) => (heading: number, topDown: boolean) => {
  const startingCamera = cameraInit({
    topDownAtStart: topDown,
    viewpointHeading: heading,
    bedSize,
    zoomFactor,
  });
  const camera = cameraAtRadius(startingCamera, bootstrapRadius);
  setCameraRequest({
    camera,
    fov: NORMAL_CAMERA_FOV,
    onRest: notifyStartingCameraSaved,
  });
};

export const retargetCameraRequestFov = (
  activeRequest: GardenCameraRequest | undefined,
  desiredFov: number,
  readCamera: () => SmoothCameraState,
): GardenCameraRequest => {
  if (activeRequest?.fov == desiredFov) { return activeRequest; }
  const current = readCamera();
  return {
    camera: {
      target: current.target,
      position: cameraPositionForFov(
        current.position,
        current.target,
        current.fov,
        desiredFov,
      ),
    },
    fov: desiredFov,
  };
};

export const createCameraFitRequest = (
  current: SmoothCameraState,
  referenceRadius: number,
): GardenCameraRequest => {
  const target: Camera["target"] = [0, 0, 0];
  const direction = current.position.map((value, index) =>
    value - current.target[index]) as Camera["position"];
  const radius = distanceForFov(
    referenceRadius,
    NORMAL_CAMERA_FOV,
    current.fov,
  );
  return {
    camera: {
      target,
      position: positionForViewDirection(direction, target, radius),
    },
    fov: current.fov,
  };
};

export const cameraRadius = (camera: Camera) => Math.hypot(
  camera.position[0] - camera.target[0],
  camera.position[1] - camera.target[1],
  camera.position[2] - camera.target[2],
);

export const cameraFitRadiusForZoom = (
  radius: number,
  zoomFactor: number,
) => radius * 10 / zoomFactor;

export const createViewDirectionRequest = (
  direction: ViewPrismDirection,
  current: SmoothCameraState,
  bootstrapRadius: number,
  azimuth?: number,
  viewport?: CameraViewport,
): GardenCameraRequest => {
  const selectedDirection = direction[0] == 0
    && direction[1] == 0
    && direction[2] > 0
    ? nearestCardinalTopViewDirection(
      current.position,
      current.target,
      azimuth,
      viewport,
    )
    : direction;
  const target: Camera["target"] = [0, 0, 0];
  const radius = distanceForFov(
    bootstrapRadius,
    NORMAL_CAMERA_FOV,
    current.fov,
  );
  return {
    camera: {
      target,
      position: positionForViewDirection(
        selectedDirection,
        target,
        radius,
      ),
    },
    fov: current.fov,
  };
};

const VIEW_PRISM_COLOR_FALLBACKS = {
  color: "#f0f0f0",
  hoverColor: "#22a273",
  textColor: "#333",
  strokeColor: "#777",
};

export const getViewPrismColors = (element: Element | undefined) => {
  if (!element) { return VIEW_PRISM_COLOR_FALLBACKS; }
  const style = window.getComputedStyle(element);
  const read = (property: string, fallback: string) =>
    style.getPropertyValue(property).trim() || fallback;
  return {
    color: read("--main-bg", VIEW_PRISM_COLOR_FALLBACKS.color),
    hoverColor: read(
      "--view-prism-hover-color",
      VIEW_PRISM_COLOR_FALLBACKS.hoverColor,
    ),
    textColor: read("--text-color", VIEW_PRISM_COLOR_FALLBACKS.textColor),
    strokeColor: read(
      "--border-color",
      VIEW_PRISM_COLOR_FALLBACKS.strokeColor,
    ),
  };
};

export const VIEW_PRISM_VIEWPORT_SIZE = Math.ceil(
  VIEW_PRISM_BOUNDING_BOX_HALF_SIZE * 2 + 4,
);

export const getViewPrismCameraProjection = (
  viewportHeight: number,
  fov: number,
) => {
  const framingHeight = Math.max(
    viewportHeight,
    VIEW_PRISM_TOP_CENTER_BOUNDING_RADIUS * 2 + 4,
  );
  const distance = framingHeight
    / (2 * Math.tan(fov * Math.PI / 360));
  const clippingDepth = VIEW_PRISM_TOP_CENTER_BOUNDING_RADIUS * 1.1;
  return {
    distance,
    near: Math.max(0.1, distance - clippingDepth),
    far: distance + clippingDepth,
  };
};

export interface ViewPrismBridge {
  camera?: ThreePerspectiveCamera;
  selectDirection?(direction: ViewPrismDirection): void;
}

interface FarmDesignerViewPrismProps {
  bridgeRef: React.RefObject<ViewPrismBridge | null>;
}

export const updateViewPrismCamera = (
  camera: ThreePerspectiveCamera,
  viewportHeight: number,
  fov: number,
) => {
  const projection = getViewPrismCameraProjection(viewportHeight, fov);
  camera.position.set(0, 0, projection.distance);
  camera.fov = fov;
  camera.near = projection.near;
  camera.far = projection.far;
  camera.updateProjectionMatrix();
};

export const FarmDesignerViewPrism = (props: FarmDesignerViewPrismProps) => {
  const { camera, gl, size } = useThree();
  const colorElement = typeof Element != "undefined"
    && gl.domElement instanceof Element
    ? gl.domElement
    : undefined;
  const viewPrismColors = getViewPrismColors(colorElement);
  const [gizmoGroup] = React.useState(() => new ThreeGroup());
  const [topCenter] = React.useState(() =>
    new Vector3(...VIEW_PRISM_TOP_CENTER));
  const [rotatedTopCenter] = React.useState(() => new Vector3());
  useFrame(() => {
    const sourceCamera = props.bridgeRef.current?.camera;
    if (sourceCamera instanceof ThreePerspectiveCamera) {
      gizmoGroup.quaternion.copy(sourceCamera.quaternion).invert();
      gizmoGroup.position.copy(
        rotatedTopCenter
          .copy(topCenter)
          .applyQuaternion(gizmoGroup.quaternion),
      ).multiplyScalar(-1);
    }
    if (camera instanceof ThreePerspectiveCamera) {
      updateViewPrismCamera(
        camera,
        size.height,
        sourceCamera?.fov ?? NORMAL_CAMERA_FOV,
      );
    }
  });
  return <primitive object={gizmoGroup}>
    <ViewPrism
      {...viewPrismColors}
      onDirection={direction =>
        props.bridgeRef.current?.selectDirection?.(direction)} />
  </primitive>;
};

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
const CAMERA_URL_SAVE_DELAY_MS = 150;

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
  peripherals?: TaggedPeripheral[];
  peripheralValues?: PeripheralValues;
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
  threeDTime?: string;
  timeTravelDispatch?: Function;
  celestialView?: {
    mode: ThreeDViewMode;
    fov: number;
    dispatch: Function;
  };
  onDetailsRevealStart?(): void;
  onLoadComplete?(): void;
  viewPrismBridgeRef?: React.RefObject<ViewPrismBridge | null>;
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
  return {
    showPlants,
    plantsVisible,
    farmbotVisible,
    showPoints,
    showWeeds,
    showSpread,
    showMoistureMap,
    showMoistureReadings,
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
  showTelescope: boolean;
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
  stargazing: boolean;
  spaceflight: boolean;
  cameraSideStarClipEnabled: boolean;
  constellationDiscoveryEnabled: boolean;
  stargazingDispatch: Function | undefined;
  threeDTime: string | undefined;
  timeTravelDispatch: Function | undefined;
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
    showMoistureMap, showMoistureReadings, showTelescope,
    sensors, sensorReadings,
    addPlantProps, plantLabelNodes, plantsVisible,
    plantIconAtlas, setHover, threeDPlants, plantIconCapacities, startTimeRef,
    dispatch, stargazing, spaceflight, cameraSideStarClipEnabled,
    constellationDiscoveryEnabled, stargazingDispatch, showSpread,
    plantInstanceCapacity, routeKey, seasonResetKey, showWeeds, weeds,
    showPoints, plantsSelectable, pointsSelectable, weedsSelectable,
    onSelectObject, onHoverObject, onHoverLabel, onPlantHoverChange,
    sceneObjectClick, sceneObjectPointerMove, sceneObjectPreview,
  } = props;
  const seasonLayerKey = `${config.plants}-${seasonResetKey || 0}`;
  const gridVisible = config.grid
    && activeFocus != "Planter bed"
    && !spaceflight;
  const plantLayerHasWork =
    threeDPlants.length > 0
    || React.Children.count(plantLabelNodes) > 0;
  const weedLayerHasWork = weeds.length > 0;
  const pointLayerHasWork = mapPoints.length > 0;
  const plantsLayerReveal = plantsReveal && plantsVisible;
  const weedsLayerReveal = weedsReveal && showWeeds;
  const pointsLayerReveal = pointsReveal && showPoints;
  const [sunIsSet, setSunIsSet] =
    React.useState<boolean | undefined>(undefined);
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
      <Group name={"sky"}
        userData={{ [SECTION_CLIPPING_EXEMPT]: true }}>
        <Sky sunPosition={sunPosition(0, 0, 0)} />
        <Sphere args={[BigDistance.sky, 8, 16]}>
          <MeshBasicMaterial
            ref={skyRef}
            color={skyColor(config.sun, config.scene)}
            side={BackSide} />
        </Sphere>
      </Group>
      <Sun
        config={config}
        skyRef={skyRef}
        cameraSideClipEnabled={cameraSideStarClipEnabled}
        constellationDiscoveryEnabled={constellationDiscoveryEnabled}
        showSun={!spaceflight}
        startTimeRef={startTimeRef}
        onSunSetChange={setSunIsSet}
        onConstellationFound={markConstellationFound} />
      {showTelescope &&
        <Telescope
          config={config}
          sunIsSet={sunIsSet}
          stargazing={stargazing}
          dispatch={stargazingDispatch}
          timeTravelDispatch={props.timeTravelDispatch
            ?? dispatch} />}
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
          plants={threeDPlants}
          weeds={weeds}
          showPlants={plantsVisible}
          showPoints={showPoints}
          showWeeds={showWeeds}
          showMoistureMap={showMoistureMap}
          showMoistureReadings={showMoistureReadings}
          sensors={sensors}
          sensorReadings={sensorReadings}
          activePositionRef={activePositionRef}
          onSelectObject={onSelectObject}
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

const ENVIRONMENT_SCENES = ["Outdoor", "Lab", "Greenhouse", "Mars"] as const;
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
  positionStore: BotPositionSnapshotStore;
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
      positionStore={props.positionStore}
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
        positionStore={props.positionStore}
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

const CAMERA_FIT_DEBUG_SEGMENTS = 128;
const cameraFitCirclePoints = (radius: number) =>
  range(0, CAMERA_FIT_DEBUG_SEGMENTS + 1).map(index => {
    const angle = index / CAMERA_FIT_DEBUG_SEGMENTS * Math.PI * 2;
    return [
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      0,
    ] as [number, number, number];
  });

interface CameraFitDebugProps {
  circumscribedRadius: number;
}

export const CameraFitDebug = (props: CameraFitDebugProps) =>
  <Group name={"camera-fit-debug"}>
    <Line
      name={"camera-fit-circumscribed-circle"}
      points={cameraFitCirclePoints(props.circumscribedRadius)}
      color={"#ff9800"}
      lineWidth={2}
      depthTest={false} />
  </Group>;

export interface GardenCameraControllerProps {
  baseCamera: Camera;
  viewMode: ThreeDViewMode;
  stargazingFov: number;
  stargazingCamera: Camera;
  desiredFov: number;
  cameraFitRadius: number;
  promo: boolean;
  activeFocus: string;
  controlsCamera: ThreePerspectiveCamera | null;
  controls: SmoothCameraControls | null;
  cameraBedSize: { x: number; y: number };
  zoomFactor: number;
  viewportSize: CameraViewport;
  viewPrismBridgeRef?: React.RefObject<ViewPrismBridge | null>;
}

const STARGAZING_MIN_POLAR_ANGLE = Math.PI / 2;
export type GardenCameraPhase =
  "normal" | "transitioning" | "stargazing" | "spaceflight";

export const stargazingOrbitPolarLimits = (
  phase: GardenCameraPhase,
) => phase == "spaceflight"
  ? {
    min: SPACEFLIGHT_POLAR_ANGLE,
    max: SPACEFLIGHT_POLAR_ANGLE,
  }
  : {
    min: phase == "stargazing" ? STARGAZING_MIN_POLAR_ANGLE : 0,
    max: phase == "normal" ? Math.PI / 2 : Math.PI,
  };

export const cameraSideStarClipEnabled = (
  phase: GardenCameraPhase,
) => phase != "stargazing";

export const constellationDiscoveryEnabled = (
  viewMode: ThreeDViewMode,
  phase: GardenCameraPhase,
) => viewMode != "normal" && phase == viewMode;

export const useGardenCameraController = (
  props: GardenCameraControllerProps,
) => {
  const [cameraPhase, setCameraPhase] =
    React.useState<GardenCameraPhase>(() => {
      return props.viewMode;
    });
  const [cameraRequest, setCameraRequest] =
    React.useState<GardenCameraRequest | undefined>(() => ({
      camera: {
        target: props.baseCamera.target,
        position: cameraPositionForFov(
          props.baseCamera.position,
          props.baseCamera.target,
          NORMAL_CAMERA_FOV,
          props.desiredFov,
        ),
      },
      fov: props.desiredFov,
    }));
  const camera = cameraRequest?.camera || props.baseCamera;
  const cameraFov = cameraRequest?.fov ?? props.desiredFov;
  const cameraSpringCancelRef =
    React.useRef<(() => void) | undefined>(undefined);
  const liveCameraState = React.useCallback(() => readSmoothCameraState({
    position: camera.position,
    target: camera.target,
    zoom: 1,
    fov: cameraFov,
  }, props.controlsCamera, props.controls), [
    camera.position,
    camera.target,
    cameraFov,
    props.controls,
    props.controlsCamera,
  ]);
  const previousPromoFitRadiusRef = React.useRef(props.cameraFitRadius);
  React.useEffect(() => {
    if (!props.promo || props.activeFocus
      || previousPromoFitRadiusRef.current == props.cameraFitRadius) {
      return;
    }
    previousPromoFitRadiusRef.current = props.cameraFitRadius;
    if (props.viewMode != "normal") { return; }
    // Bed-size and viewport changes intentionally retarget the camera spring.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCameraRequest(createCameraFitRequest(
      liveCameraState(),
      props.cameraFitRadius,
    ));
  }, [
    liveCameraState,
    props.activeFocus,
    props.cameraFitRadius,
    props.promo,
    props.viewMode,
  ]);
  const previousDesiredFovRef = React.useRef(props.desiredFov);
  React.useEffect(() => {
    const fovChanged = previousDesiredFovRef.current != props.desiredFov;
    previousDesiredFovRef.current = props.desiredFov;
    if (props.viewMode != "normal" || !fovChanged) { return; }
    // Projection changes intentionally create a new spring target.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCameraRequest(activeRequest => retargetCameraRequestFov(
      activeRequest,
      props.desiredFov,
      liveCameraState,
    ));
  // Retarget only when the projection setting changes. Including the live
  // camera callback would restart the spring as OrbitControls updates.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.desiredFov, props.viewMode]);
  const previousStargazingFovRef = React.useRef(props.stargazingFov);
  React.useEffect(() => {
    const fovChanged = previousStargazingFovRef.current
      != props.stargazingFov;
    previousStargazingFovRef.current = props.stargazingFov;
    if (props.viewMode != "stargazing" || !fovChanged) { return; }
    const current = liveCameraState();
    // Stargazing FOV changes preserve the current orbit and spring the lens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCameraRequest(activeRequest => ({
      camera: cameraPhase == "transitioning" && activeRequest
        ? activeRequest.camera
        : {
          position: current.position,
          target: current.target,
        },
      fov: props.stargazingFov,
      interpolation: cameraPhase == "transitioning"
        ? activeRequest?.interpolation
        : "linear",
      onRest: cameraPhase == "transitioning"
        ? () => setCameraPhase("stargazing")
        : undefined,
    }));
  // Reading the live callback here is intentional, but depending on it would
  // restart the spring after every imperative camera update.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.stargazingFov,
    props.viewMode,
    cameraPhase,
  ]);
  const previousViewModeRef = React.useRef<ThreeDViewMode>("normal");
  const normalReturnStateRef =
    React.useRef<SmoothCameraState>({
      position: camera.position,
      target: camera.target,
      zoom: 1,
      fov: cameraFov,
    });
  // Commit mode boundaries before paint so the destination scene never
  // renders for a frame with the previous mode's camera request.
  React.useLayoutEffect(() => {
    const previousMode = previousViewModeRef.current;
    if (previousMode == props.viewMode) { return; }
    previousViewModeRef.current = props.viewMode;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCameraPhase("transitioning");
    const current = liveCameraState();
    if (previousMode == "normal") {
      normalReturnStateRef.current = current;
    }
    if (props.viewMode == "spaceflight") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCameraRequest({
        camera: SPACEFLIGHT_CAMERA,
        fov: SPACEFLIGHT_FOV,
        interpolation: previousMode == "stargazing"
          ? "linear"
          : "orbit",
        onRest: () => setCameraPhase("spaceflight"),
      });
    } else if (props.viewMode == "stargazing") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCameraRequest({
        camera: props.stargazingCamera,
        fov: props.stargazingFov,
        interpolation: previousMode == "spaceflight"
          ? "linear"
          : "orbit",
        onRest: () => setCameraPhase("stargazing"),
      });
    } else {
      const previous = normalReturnStateRef.current;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCameraRequest({
        camera: {
          position: previous.position,
          target: previous.target,
        },
        fov: previous.fov,
        onRest: () => setCameraPhase("normal"),
      });
    }
  }, [
    liveCameraState,
    props.stargazingCamera,
    props.stargazingFov,
    props.viewMode,
  ]);
  const selectViewDirection = React.useCallback(
    (direction: ViewPrismDirection) => {
      const current = liveCameraState();
      setCameraRequest(createViewDirectionRequest(
        direction,
        current,
        props.cameraFitRadius,
        props.controls?.getAzimuthalAngle?.(),
        props.viewportSize,
      ));
    },
    [
      liveCameraState,
      props.cameraFitRadius,
      props.controls,
      props.viewportSize,
    ]);
  const selectStartingCamera = React.useMemo(() =>
    createStartingCameraSelector(
      setCameraRequest,
      props.cameraBedSize,
      props.zoomFactor,
      props.cameraFitRadius,
    ), [
    props.cameraBedSize,
    props.cameraFitRadius,
    props.zoomFactor,
  ]);
  React.useImperativeHandle(props.viewPrismBridgeRef, () => ({
    camera: props.controlsCamera || undefined,
    selectDirection: selectViewDirection,
  }), [props.controlsCamera, selectViewDirection]);
  React.useEffect(() => {
    if (!props.activeFocus) { return; }
    // A promo focus owns the camera target until the next user request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCameraRequest(undefined);
  }, [props.activeFocus]);
  return {
    camera,
    cameraFov,
    cameraRequest,
    cameraSpringCancelRef,
    selectStartingCamera,
    cameraPhase,
  };
};

interface GardenSectionControllerProps {
  config: Config;
  designer: DesignerState | undefined;
  gardenSize: { x: number; y: number };
  currentBotLocation: BotPosition | undefined;
  camera: Camera;
  controlsCamera: ThreePerspectiveCamera | null | undefined;
  modelRoot: Object3D | undefined;
  immediate: boolean;
}

const useGardenSectionController = (
  props: GardenSectionControllerProps,
) => {
  const sectionOpen = !!props.designer?.threeDSectionOpen;
  const axis = props.designer?.threeDSectionAxis;
  const width = props.designer?.threeDSectionWidth;
  const center = props.designer
    ? effectiveSectionCenter(
      props.designer,
      props.gardenSize,
      props.currentBotLocation,
    )
    : 0;
  const basePlanes = React.useMemo(
    () => axis && width !== undefined
      ? getSectionClippingPlanes(props.config, axis, center, width)
      : [],
    [axis, center, props.config, width],
  );
  const outsidePlaneConstants = React.useMemo(
    () => getSectionOutsidePlaneConstants({
      bedLengthOuter: props.config.bedLengthOuter,
      bedWidthOuter: props.config.bedWidthOuter,
      bedXOffset: props.config.bedXOffset,
      bedYOffset: props.config.bedYOffset,
      mirrorX: props.config.mirrorX,
      mirrorY: props.config.mirrorY,
    }),
    [
      props.config.bedLengthOuter,
      props.config.bedWidthOuter,
      props.config.bedXOffset,
      props.config.bedYOffset,
      props.config.mirrorX,
      props.config.mirrorY,
    ],
  );
  const [nearIndex, setNearIndex] = React.useState(0);
  const updateNearIndex = React.useCallback(() => {
    if (!axis || basePlanes.length < 2) { return; }
    const position = props.controlsCamera?.position || {
      x: props.camera.position[0],
      y: props.camera.position[1],
    };
    const next = sectionNearPlaneIndex(basePlanes, axis, position);
    setNearIndex(current => current == next ? current : next);
  }, [axis, basePlanes, props.camera.position, props.controlsCamera]);
  // Synchronize the first semantic near plane before controls emit changes.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(updateNearIndex, [updateNearIndex]);
  const animated = useAnimatedSectionPlanes(
    sectionOpen,
    axis || "x",
    basePlanes,
    !!props.designer?.threeDSectionFollowBot,
    outsidePlaneConstants,
    props.immediate,
  );
  const renderedSection = React.useMemo(() => {
    const renderedAxis = animated.axis;
    const planePositions = animated.planes.map(plane =>
      -plane.constant / plane.normal[renderedAxis]);
    const worldCenter = (planePositions[0] + planePositions[1]) / 2;
    return {
      center: getGardenPositionFunc(props.config, false)({
        x: worldCenter,
        y: worldCenter,
      })[renderedAxis],
      width: Math.abs(planePositions[1] - planePositions[0]),
    };
  }, [animated.axis, animated.planes, props.config]);
  const planes = React.useMemo(() => nearIndex == 0
    ? animated.planes
    : [animated.planes[1], animated.planes[0]], [
    animated.planes,
    nearIndex,
  ]);
  useSectionClipping(
    animated.mounted,
    props.modelRoot,
    planes,
    !!props.designer?.threeDSectionCutAll,
  );
  return {
    animated,
    center: renderedSection.center,
    planes,
    sectionOpen,
    updateNearIndex,
    width: renderedSection.width,
  };
};

export const getRenderedBotLocation = (
  config: Config,
  configPosition: PositionConfig,
): BotPosition => {
  const utm = getBotKinematics(
    config,
    configPosition,
  ).anchors.utm.worldPosition;
  const gardenPosition = getGardenPositionFunc(config, false)({
    x: utm[0],
    y: utm[1],
  });
  return { ...gardenPosition, z: configPosition.z };
};

interface GardenSectionBridge {
  updateNearIndex(): void;
}

interface GardenSectionLayerProps {
  bridgeRef: React.RefObject<GardenSectionBridge | undefined>;
  botSpringActive: boolean;
  botPositionStore: BotPositionSnapshotStore;
  camera: Camera;
  config: Config;
  configPosition: PositionConfig;
  controlsCamera: ThreePerspectiveCamera | null | undefined;
  designer: DesignerState | undefined;
  dispatch: Function | undefined;
  gardenSize: { x: number; y: number };
  getZ(x: number, y: number): number;
  modelRoot: Object3D | undefined;
}

export const GardenSectionLayer = (props: GardenSectionLayerProps) => {
  const springPosition = useBotPositionSnapshot(props.botPositionStore);
  const renderedBotPosition = props.botSpringActive
    ? springPosition
    : props.configPosition;
  const renderedBotLocation = getRenderedBotLocation(
    props.config,
    renderedBotPosition,
  );
  const [controlDragging, setControlDragging] = React.useState(false);
  const controller = useGardenSectionController({
    config: props.config,
    designer: props.designer,
    gardenSize: props.gardenSize,
    currentBotLocation: renderedBotLocation,
    camera: props.camera,
    controlsCamera: props.controlsCamera,
    modelRoot: props.modelRoot,
    immediate: controlDragging,
  });
  const {
    animated, center, planes, sectionOpen, updateNearIndex, width,
  } = controller;
  React.useImperativeHandle(props.bridgeRef, () => ({
    updateNearIndex,
  }), [updateNearIndex]);

  return <>
    {animated.mounted && planes[0] &&
      <SectionCutFaces
        config={props.config}
        configPosition={renderedBotPosition}
        axis={animated.axis}
        nearPlane={planes[0]}
        farPlane={planes[1]}
        cutAll={!!props.designer?.threeDSectionCutAll}
        opacity={animated.opacity}
        getZ={props.getZ} />}
    {animated.mounted &&
      <SectionGroundOverlays
        config={props.config}
        configPosition={renderedBotPosition}
        sectionOpacity={animated.opacity} />}
    {animated.mounted && props.designer && props.dispatch
      && planes[0] && planes[1] &&
      <SectionControls
        key={animated.axis}
        config={props.config}
        configPosition={renderedBotPosition}
        designer={props.designer}
        dispatch={props.dispatch}
        gardenSize={props.gardenSize}
        axis={animated.axis}
        center={center}
        width={width}
        opacity={animated.opacity}
        interactive={sectionOpen
          && animated.axis == props.designer.threeDSectionAxis}
        nearPlane={planes[0]}
        farPlane={planes[1]}
        onDraggingChange={setControlDragging} />}
  </>;
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
  const { size: viewportSize } = useThree();
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
  const sectionDesigner = addPlantProps?.designer;
  const viewMode = props.celestialView?.mode
    ?? sectionDesigner?.threeDViewMode
    ?? "normal";
  const celestialViewActive = viewMode != "normal";
  const spaceflight = viewMode == "spaceflight";
  const stargazingFov = props.celestialView?.fov
    ?? sectionDesigner?.threeDStargazingFov
    ?? STARGAZING_DEFAULT_FOV;
  const stargazingDispatch = props.celestialView?.dispatch ?? dispatch;
  const [botPositionStore] = React.useState(
    () => createBotPositionSnapshotStore(
      props.configPosition,
    ),
  );
  const sectionBridgeRef =
    React.useRef<GardenSectionBridge | undefined>(undefined);
  const sectionOpen = !!sectionDesigner?.threeDSectionOpen;
  const topDownAtStart = !!addPlantProps?.topDownAtStart;
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

  const cameraClippingConfig = {
    sceneRadius: CAMERA_SCENE_RADIUS,
    minNear: 10,
    minFar: BigDistance.far,
    maxCameraScale: 1,
  };
  const cameraBedSize = React.useMemo(() => ({
    x: cameraConfig.bedLengthOuter,
    y: cameraConfig.bedWidthOuter,
  }), [
    cameraConfig.bedLengthOuter,
    cameraConfig.bedWidthOuter,
  ]);
  const currentCameraFit = React.useMemo(() => getCameraFit({
    viewport: viewportSize,
    bedSize: cameraBedSize,
  }), [cameraBedSize, viewportSize]);
  const [bootstrapCameraFit] = React.useState(() => currentCameraFit);
  const activeCameraFit = props.promo
    ? currentCameraFit
    : bootstrapCameraFit;
  const cameraFitRadius = cameraFitRadiusForZoom(
    activeCameraFit.cameraRadius,
    config.zoomFactor,
  );
  const sectionGardenSize = React.useMemo(() => ({
    x: cameraConfig.botSizeX,
    y: cameraConfig.botSizeY,
  }), [cameraConfig.botSizeX, cameraConfig.botSizeY]);
  const defaultCamera = React.useMemo(
    () => {
      const nextCamera = cameraInit({
        topDownAtStart,
        viewpointHeading: cameraConfig.viewpointHeading,
        bedSize: cameraBedSize,
        zoomFactor: config.zoomFactor,
      });
      return cameraAtRadius(nextCamera, cameraFitRadius);
    },
    [
      cameraBedSize,
      cameraConfig.viewpointHeading,
      cameraFitRadius,
      topDownAtStart,
      config.zoomFactor,
    ]);
  const urlCamera = React.useMemo(
    () => baseConfig.urlCameraPos
      ? getCameraFromUrlParams()
      : undefined,
    // Re-read after Promo clears camera params for an explicit focus change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseConfig.urlCameraPos, props.activeFocus],
  );
  const baseCamera = urlCamera || (props.activeFocus
    ? getCamera(
      cameraConfig,
      props.configPosition,
      props.activeFocus,
      defaultCamera,
    )
    : defaultCamera);
  const stargazingCamera = React.useMemo(
    () => getStargazingCamera(cameraConfig),
    [cameraConfig],
  );
  const [modelRoot, setModelRoot] = React.useState<Object3D | undefined>();
  const setModelRootRef = React.useCallback((value: Object3D | null) => {
    setModelRoot(value || undefined);
  }, []);
  const [controlsCamera, setControlsCamera] =
    // eslint-disable-next-line no-null/no-null
    React.useState<ThreePerspectiveCamera | null>(null);
  const [controls, setControls] =
    // eslint-disable-next-line no-null/no-null
    React.useState<SmoothCameraControls | null>(null);
  const desiredFov = config.perspective
    ? NORMAL_CAMERA_FOV
    : NARROW_CAMERA_FOV;
  const cameraController = useGardenCameraController({
    baseCamera,
    viewMode,
    stargazingFov,
    stargazingCamera,
    desiredFov,
    cameraFitRadius,
    promo: !!props.promo,
    activeFocus: props.activeFocus,
    controlsCamera,
    controls,
    cameraBedSize,
    zoomFactor: config.zoomFactor,
    viewportSize,
    viewPrismBridgeRef: props.viewPrismBridgeRef,
  });
  const {
    camera, cameraFov, cameraRequest, cameraSpringCancelRef,
    selectStartingCamera, cameraPhase,
  } = cameraController;
  const updateSectionNearIndex = React.useCallback(() => {
    sectionBridgeRef.current?.updateNearIndex();
  }, []);
  const cameraUrlSaveTimeoutRef = React.useRef<number | undefined>(undefined);
  const cameraUrlInteractionRef =
    React.useRef<"idle" | "active" | "settling">("idle");
  const activeFocusRef = React.useRef(props.activeFocus);
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
    if (selection.kind == "connectivity") {
      dispatch?.({
        type: Actions.SET_METRIC_PANEL_OPTION,
        payload: "realtime",
      });
      dispatch?.({
        type: Actions.OPEN_POPUP,
        payload: "connectivity",
      });
      closePopup();
      return;
    }
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
    showMoistureReadings,
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
  const hoverDesigner = addPlantProps?.designer;
  const hoverScene: string = hoverDesigner?.featuredScene || config.scene;
  const hoverSelection = React.useMemo(() =>
    hoverSelectionFromDesigner(
      hoverDesigner,
      plants,
      mapPoints,
      weeds,
      toolSlots,
      (props.sceneObjects || []).concat(staticSceneObjects(
        hoverScene,
        true,
      )),
    ), [
    hoverDesigner,
    hoverScene,
    plants,
    mapPoints,
    props.sceneObjects,
    weeds,
    toolSlots,
  ]);
  const visualSelection =
    activePopupSelection || hoverSelection || routeSelection;
  const gridHoverEnabled =
    !spaceflight
    && !props.promo
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
  const showZoomBeacons = config.zoomBeacons && !celestialViewActive;
  const animatedDetailsLoadIn = sceneDetailsLoadIn || showZoomBeacons;

  const targetZoom = 1;
  const clearCameraUrlSaveTimeout = React.useCallback(() => {
    const timeoutId = cameraUrlSaveTimeoutRef.current;
    if (timeoutId === undefined) { return; }
    window.clearTimeout(timeoutId);
    cameraUrlSaveTimeoutRef.current = undefined;
  }, []);
  const saveCameraUrl = React.useCallback(() => {
    if (!sectionOpen && baseConfig.urlCameraPos && controlsCamera && controls) {
      const state = readSmoothCameraState({
        position: camera.position,
        target: camera.target,
        zoom: targetZoom,
        fov: cameraFov,
      }, controlsCamera, controls);
      setCameraUrlParams(canonicalCamera(state, state.fov));
    }
  }, [
    baseConfig.urlCameraPos,
    camera.position,
    camera.target,
    cameraFov,
    controls,
    controlsCamera,
    sectionOpen,
    targetZoom,
  ]);
  const finishCameraUrlSave = React.useCallback(() => {
    clearCameraUrlSaveTimeout();
    saveCameraUrl();
    cameraUrlInteractionRef.current = "idle";
  }, [clearCameraUrlSaveTimeout, saveCameraUrl]);
  const scheduleCameraUrlSave = React.useCallback(() => {
    if (cameraUrlInteractionRef.current != "settling") { return; }
    clearCameraUrlSaveTimeout();
    cameraUrlSaveTimeoutRef.current = window.setTimeout(
      finishCameraUrlSave,
      CAMERA_URL_SAVE_DELAY_MS,
    );
  }, [clearCameraUrlSaveTimeout, finishCameraUrlSave]);
  const handleCameraDragStart = React.useCallback(() => {
    cameraSpringCancelRef.current?.();
    setSelectableObjectHoverCount(0);
    setHoveredObjectLabel(undefined);
    setCameraDragging(true);
    clearCameraUrlSaveTimeout();
    cameraUrlInteractionRef.current = baseConfig.urlCameraPos
      && !sectionOpen && !celestialViewActive
      ? "active"
      : "idle";
  }, [
    baseConfig.urlCameraPos,
    cameraSpringCancelRef,
    clearCameraUrlSaveTimeout,
    sectionOpen,
    celestialViewActive,
  ]);
  const handleCameraDragEnd = React.useCallback(() => {
    setCameraDragging(false);
    if (cameraUrlInteractionRef.current != "active") { return; }
    cameraUrlInteractionRef.current = "settling";
    saveCameraUrl();
    scheduleCameraUrlSave();
  }, [saveCameraUrl, scheduleCameraUrlSave]);
  const handleCameraChange = React.useCallback(() => {
    applyCameraClippingRange(controlsCamera, {
      sceneRadius: CAMERA_SCENE_RADIUS,
      minNear: 10,
      minFar: BigDistance.far,
      maxCameraScale: 1,
    });
    updateSectionNearIndex();
    scheduleCameraUrlSave();
  }, [
    controlsCamera,
    scheduleCameraUrlSave,
    updateSectionNearIndex,
  ]);
  React.useEffect(() => {
    if (baseConfig.urlCameraPos) { return; }
    cameraUrlInteractionRef.current = "idle";
    clearCameraUrlSaveTimeout();
  }, [
    baseConfig.urlCameraPos,
    clearCameraUrlSaveTimeout,
  ]);
  React.useEffect(() => {
    if (activeFocusRef.current == props.activeFocus) { return; }
    activeFocusRef.current = props.activeFocus;
    cameraUrlInteractionRef.current = "idle";
    clearCameraUrlSaveTimeout();
  }, [clearCameraUrlSaveTimeout, props.activeFocus]);
  React.useEffect(() => {
    return () => clearCameraUrlSaveTimeout();
  }, [clearCameraUrlSaveTimeout]);
  const focusTransitionsEnabled =
    !!props.smoothFocusTransitions && config.animate;
  const solarVisible =
    config.solar || props.activeFocus == "What you need to provide";
  const renderSolar = focusTransitionsEnabled || solarVisible;
  const renderedCamera = useSmoothCamera({
    camera,
    zoom: targetZoom,
    fov: cameraFov,
    enabled: focusTransitionsEnabled || !!addPlantProps,
    cameraObject: controlsCamera,
    controls,
    updateStateDuringTransition: !focusTransitionsEnabled,
    interpolation: cameraRequest?.interpolation,
    cancelRef: cameraSpringCancelRef,
    onRest: cameraRequest?.onRest,
  });
  useFrame((_state, deltaSeconds) => {
    if (!spaceflight || cameraPhase != "spaceflight"
      || !controlsCamera || !controls) {
      return;
    }
    const current = readSmoothCameraState({
      position: SPACEFLIGHT_CAMERA.position,
      target: SPACEFLIGHT_CAMERA.target,
      zoom: targetZoom,
      fov: SPACEFLIGHT_FOV,
    }, controlsCamera, controls);
    const next = advanceSpaceflightOrbit(current, deltaSeconds);
    applySmoothCameraState({
      ...next,
      zoom: current.zoom,
      fov: current.fov,
    }, controlsCamera, controls);
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

  const cameraProps = focusTransitionsEnabled
    ? {}
    : {
      position: renderedCamera.position,
      zoom: renderedCamera.zoom,
      fov: renderedCamera.fov,
    };
  const orbitControlProps = focusTransitionsEnabled
    ? {}
    : { target: renderedCamera.target };
  const cameraDistance = Math.hypot(
    renderedCamera.position[0] - renderedCamera.target[0],
    renderedCamera.position[1] - renderedCamera.target[1],
    renderedCamera.position[2] - renderedCamera.target[2],
  );
  const maxCameraDistance = Math.max(BigDistance.zoom, cameraDistance * 1.25);
  const cameraClippingRange = getCameraClippingRange(
    renderedCamera.position,
    cameraClippingConfig,
  );
  const stargazingCameraSettled =
    cameraPhase == "stargazing";
  const spaceflightCameraSettled =
    cameraPhase == "spaceflight";
  const normalCameraSettled = cameraPhase == "normal";
  const orbitPolarLimits =
    stargazingOrbitPolarLimits(cameraPhase);
  const orbitRotationEnabled =
    spaceflightCameraSettled && viewMode == "spaceflight"
    || stargazingCameraSettled && viewMode == "stargazing"
    || normalCameraSettled && viewMode == "normal" && config.rotate;

  return <FocusTransitionProvider enabled={focusTransitionsEnabled}>
    {/* eslint-disable-next-line no-null/no-null */}
    <Group dispose={null}
      ref={setModelRootRef}
      onPointerMove={handleScenePointerMove}
      onPointerLeave={handleScenePointerLeave}>
      <FPSProbe />
      <PerfMark name={"garden_model_rendered"} />
      <SceneCursor cursor={sceneCursor} />
      <Group>
        <PerspectiveCamera
          ref={setControlsCamera}
          makeDefault={true}
          name={"camera"}
          fov={renderedCamera.fov}
          near={cameraClippingRange.near}
          far={cameraClippingRange.far}
          {...cameraProps}
          up={[0, 0, 1]} />
      </Group>
      {controlsCamera &&
        <OrbitControls
          ref={setControls}
          camera={controlsCamera}
          minPolarAngle={orbitPolarLimits.min}
          maxPolarAngle={orbitPolarLimits.max}
          enableRotate={orbitRotationEnabled}
          enableZoom={normalCameraSettled
            && viewMode == "normal" && config.zoom}
          zoomToCursor={true}
          enablePan={normalCameraSettled
            && viewMode == "normal" && config.pan}
          dampingFactor={0.2}
          {...orbitControlProps}
          onStart={handleCameraDragStart}
          onChange={handleCameraChange}
          onEnd={handleCameraDragEnd}
          minZoom={config.lightsDebug ? 0 : 0.05}
          maxZoom={10}
          minDistance={config.lightsDebug ? 50 : 500}
          maxDistance={config.lightsDebug
            ? Math.max(BigDistance.devZoom, maxCameraDistance)
            : maxCameraDistance} />}
      <ThreeDLoadProgressOverlay
        progress={loadProgress}
        complete={detailsReveal} />
      {config.cameraFitDebug &&
        <CameraFitDebug {...activeCameraFit} />}
      <GardenSectionLayer
        bridgeRef={sectionBridgeRef}
        botSpringActive={farmbotVisible}
        botPositionStore={botPositionStore}
        camera={camera}
        config={config}
        configPosition={configPosition}
        controlsCamera={controlsCamera}
        designer={sectionDesigner}
        dispatch={dispatch}
        gardenSize={sectionGardenSize}
        getZ={getZ}
        modelRoot={modelRoot} />
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
        showTelescope={!props.promo}
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
        stargazing={celestialViewActive}
        spaceflight={spaceflight}
        cameraSideStarClipEnabled={cameraSideStarClipEnabled(cameraPhase)}
        constellationDiscoveryEnabled={constellationDiscoveryEnabled(
          viewMode,
          cameraPhase,
        )}
        stargazingDispatch={stargazingDispatch}
        threeDTime={props.threeDTime}
        timeTravelDispatch={props.timeTravelDispatch}
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
        positionStore={botPositionStore}
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
        peripherals={props.peripherals || []}
        peripheralValues={props.peripheralValues || []}
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
        {showZoomBeacons &&
          <ZoomBeaconsLoadIn
            config={config}
            configPosition={props.configPosition}
            activeFocus={props.activeFocus}
            setActiveFocus={props.setActiveFocus}
            reveal={detailsReveal}
            onRest={!sceneDetailsLoadIn ? markDetailsLoaded : undefined} />}
        {config.threeAxes && <AxesHelper args={[5000]} />}
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
          <LegacySolar
            config={config}
            activeFocus={props.activeFocus}
            shadows={!props.promo} />}
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
            topDownAtStart={topDownAtStart}
            onSelect={selectStartingCamera} />}
        <EnvironmentScenePreloader
          config={config}
          enabled={!!props.preloadEnvironmentScenes && loadProgress.complete}
          plantIconAtlas={props.plantIconAtlas} />
        {loadProgress.complete &&
          <React.Suspense fallback={undefined}>
            <GroundTexturePreloader config={config} />
          </React.Suspense>}
        {detailsReveal && !animatedDetailsLoadIn &&
          <LoadStepReady
            step={"details"}
            markStep={loadProgress.markStep} />}
        <PopInGroup
          key={`scene-objects-load-in-${config.scene}`}
          name={"scene-objects-load-in"}
          reveal={detailsReveal}
          distance={config.bedHeight + config.bedZOffset}>
          <Group name={"scene-objects"}
            userData={{ [SECTION_CLIPPING_EXEMPT]: true }}>
            <SceneObjects
              config={config}
              activeFocus={props.activeFocus}
              dispatch={dispatch}
              designer={addPlantProps?.designer}
              hoverSelection={hoverSelection}
              sceneObjects={props.sceneObjects} />
          </Group>
        </PopInGroup>
      </SceneBoundary>
    </Group>
  </FocusTransitionProvider>;
};
