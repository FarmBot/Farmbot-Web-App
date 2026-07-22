import React from "react";
import {
  RootState, ThreeEvent, useFrame, useThree,
} from "@react-three/fiber";
import {
  NavigateFunction, useLocation, useNavigate,
} from "react-router";
import {
  OrbitControls, PerspectiveCamera,
  Stats,
  Line,
  StatsGl,
  Billboard,
} from "@react-three/drei";
import {
  Color,
  DoubleSide,
  Group as ThreeGroup,
  type Object3D,
  PerspectiveCamera as ThreePerspectiveCamera,
  Vector3,
} from "three";
import {
  AddPlantProps, Bed, getRenderSoilSurfaceGeometry,
} from "./bed";
import {
  LegacySolar, Sun, ZoomBeacons,
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
  Primitive,
} from "./components";
import { isUndefined, kebabCase, range, round, uniq } from "lodash";
import {
  PointType, TaggedGenericPointer, TaggedImage, TaggedPoint, TaggedPointGroup,
  McuParams, TaggedSensor,
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
import { Actions, Content } from "../constants";
import { SlotWithTool } from "../resources/interfaces";
import {
  applyCameraClippingRange, applyCameraViewOffset, cameraInit,
  cameraPositionForFov, CameraViewOffset, CameraViewport, canonicalCamera,
  distanceForFov, getCameraFit, getCameraFromUrlParams,
  getPanelCameraViewOffset, getSphereCameraFit,
  NARROW_CAMERA_FOV, getCameraClippingRange, nearestCardinalTopViewDirection,
  nextViewPrismKeyboardPreset, NORMAL_CAMERA_FOV,
  positionForViewDirection, setCameraUrlParams, ViewPrismKeyboardKey,
  ViewPrismKeyboardPreset,
} from "./camera";
import { filterSoilPoints, getSurface } from "./triangles";
import { BigDistance, HOVER_OBJECT_MODES, RenderOrder } from "./constants";
import { getZFunc, serializeTriangles } from "./triangle_functions";
import { GroupOrderVisual } from "./group_order_visual";
import { MoistureReadings } from "./garden/moisture_texture";
import { FPSProbe } from "./fps_probe";
import { CameraSelectionUI } from "./camera_selection_ui";
import {
  PerfMark, perfCount, perfMark, perfMeasure, usePerfRenderCount,
} from "../performance/perf";
import {
  botLoadInConfig, FallInGroup, GridRevealGroup, LoadStepReady, PopInGroup,
  ThreeDLoadProgress, ThreeDLoadProgressOverlay, THREE_D_LOAD_STEPS,
  ThreeDLoadStepId,
  useThreeDLoadProgress,
} from "./progressive_load";
import {
  applySmoothCameraState, CameraInterpolation, cssEase,
  FocusTransitionProvider, FocusVisibilityGroup, SmoothCameraControls,
  readSmoothCameraState, SmoothCameraState,
  useSmoothCamera,
} from "./focus_transition";
import { type PlantIconAtlas } from "./garden/plant_icon_atlas";
import { Mode, TaggedPlant } from "../farm_designer/map/interfaces";
import {
  ThreeDDesignerState, ThreeDViewMode,
} from "../farm_designer/interfaces";
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
import type { PanelCameraStore } from "./panel_camera";
import type {
  NativeJogAxisActionsContext, NativeJogEncoderData,
  NativeJogEncoderVisibility,
} from "./bot/native_jog_controls";
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
import { copySceneObject } from "../scene_objects/actions";
import { destroy } from "../api/crud";
import { createGroup } from "../point_groups/actions";
import { error, success } from "../toast/toast";
import {
  getFilteredPoints,
} from "../plants/select_plants";
import { getSelected } from
  "../farm_designer/map/background/selection_box_actions";
import {
  AreaSelectionBox, AreaSelectionPointType, areaSelectionPointTypes,
  GardenAreaSelection, GardenAreaSelectionOverlay,
  normalizeAreaSelectionBox,
} from "./selection/area_selection";
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
import { t } from "../i18next_wrapper";
import { STARGAZING_DEFAULT_FOV } from
  "../farm_designer/stargazing_constants";
import { markConstellationFound } from
  "../farm_designer/stargazing_progress";
import { ControlCursorProvider } from "./controls";
import { CameraFollowController } from "./camera_follow";

const CAMERA_SCENE_RADIUS = BigDistance.sky + 1000;
export const PANEL_CAMERA_TRANSITION_MS = 300;

export const notifyStartingCameraSaved = () => success(
  "",
  { title: t("Saved starting camera view") },
);

export const usePanelCameraViewOffset = (
  camera: ThreePerspectiveCamera | null | undefined,
  view: CameraViewOffset,
  invalidate: () => void,
) => {
  const currentOffsetRef = React.useRef(view.offsetX);
  const pendingFirstFrameRef = React.useRef(false);
  const applyOffset = React.useCallback((offsetX: number) => {
    if (!(camera instanceof ThreePerspectiveCamera)) {
      return;
    }
    applyCameraViewOffset(camera, view, offsetX);
    invalidate();
  }, [camera, invalidate, view]);
  const applyOffsetRef = React.useRef(applyOffset);
  const [, spring] = useSpring(() => ({ offsetX: view.offsetX }));

  React.useLayoutEffect(() => {
    applyOffsetRef.current = applyOffset;
    applyOffset(currentOffsetRef.current);
  }, [applyOffset]);

  React.useEffect(() => {
    pendingFirstFrameRef.current = true;
    spring.start({
      to: { offsetX: view.offsetX },
      config: {
        duration: PANEL_CAMERA_TRANSITION_MS,
        easing: cssEase,
      },
      onChange: result => {
        const offsetX = result.value.offsetX ?? view.offsetX;
        currentOffsetRef.current = offsetX;
        applyOffsetRef.current(offsetX);
        perfCount("panelCamera.springFrame");
        perfMark("panel_camera_spring_frame");
        if (pendingFirstFrameRef.current) {
          pendingFirstFrameRef.current = false;
          perfMark("panel_camera_first_frame");
        }
      },
      onRest: () => {
        currentOffsetRef.current = view.offsetX;
        applyOffsetRef.current(view.offsetX);
      },
    });
  }, [spring, view.offsetX]);
};

export interface GardenCameraRequest {
  camera: Camera;
  fov: number;
  interpolation?: CameraInterpolation;
  onRest?(): void;
}

export const SPACEFLIGHT_FOV = 60;
export const SPACEFLIGHT_VIEWPORT_MARGIN_RATIO = 0.05;
const SPACEFLIGHT_CAMERA_ELEVATION = Math.atan2(10000, 50000);
const DEFAULT_SPACEFLIGHT_VIEWPORT = { width: 800, height: 600 };

export const getVisibleSpaceflightViewport = (
  canvasViewport: CameraViewport,
  browserViewport: CameraViewport,
): CameraViewport => ({
  width: Math.min(canvasViewport.width, browserViewport.width),
  height: Math.min(canvasViewport.height, browserViewport.height),
});

export const getSpaceflightCamera = (
  viewport: CameraViewport,
): Camera => {
  const fit = getSphereCameraFit({
    viewport,
    radius: BigDistance.sunVisual,
    fov: SPACEFLIGHT_FOV,
    marginRatio: SPACEFLIGHT_VIEWPORT_MARGIN_RATIO,
  });
  const centerDistance = Math.hypot(
    fit.centerDepth,
    fit.centerVerticalOffset,
  );
  const orbitRadius = centerDistance
    * Math.cos(SPACEFLIGHT_CAMERA_ELEVATION);
  const cameraZ = centerDistance
    * Math.sin(SPACEFLIGHT_CAMERA_ELEVATION);
  const centerAngle = Math.atan2(
    fit.centerVerticalOffset,
    fit.centerDepth,
  );
  const cameraAngle = -SPACEFLIGHT_CAMERA_ELEVATION - centerAngle;
  const targetZ = cameraZ + orbitRadius * Math.tan(cameraAngle);
  return {
    position: [orbitRadius, 0, cameraZ],
    target: [0, 0, targetZ],
  };
};

export const SPACEFLIGHT_CAMERA = getSpaceflightCamera(
  DEFAULT_SPACEFLIGHT_VIEWPORT,
);

const SPACEFLIGHT_ORBIT_SPEED = Math.PI / 60;

export const advanceSpaceflightOrbit = (
  camera: Camera,
  deltaSeconds: number,
): Camera => {
  const angle = Math.atan2(
    camera.position[1] - camera.target[1],
    camera.position[0] - camera.target[0],
  ) + SPACEFLIGHT_ORBIT_SPEED * deltaSeconds;
  const orbitRadius = Math.hypot(
    camera.position[0] - camera.target[0],
    camera.position[1] - camera.target[1],
  );
  return {
    target: camera.target,
    position: [
      camera.target[0] + Math.cos(angle) * orbitRadius,
      camera.target[1] + Math.sin(angle) * orbitRadius,
      camera.position[2],
    ],
  };
};

const spaceflightCameraAtAngle = (
  camera: Camera,
  angle: number,
): Camera => {
  const orbitRadius = Math.hypot(
    camera.position[0] - camera.target[0],
    camera.position[1] - camera.target[1],
  );
  return {
    target: camera.target,
    position: [
      camera.target[0] + Math.cos(angle) * orbitRadius,
      camera.target[1] + Math.sin(angle) * orbitRadius,
      camera.position[2],
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

const cameraPolarAngle = (camera: Camera) => Math.atan2(
  Math.hypot(
    camera.position[0] - camera.target[0],
    camera.position[1] - camera.target[1],
  ),
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
  return <ControlCursorProvider>
    <primitive object={gizmoGroup}>
      <ViewPrism
        {...viewPrismColors}
        onDirection={direction =>
          props.bridgeRef.current?.selectDirection?.(direction)} />
    </primitive>
  </ControlCursorProvider>;
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

export const useShiftModifier = () => {
  const [state, setState] = React.useState({
    pressed: false,
    suppressed: false,
  });
  const stateRef = React.useRef(state);
  const updateState = React.useCallback((next: typeof state) => {
    const current = stateRef.current;
    if (current.pressed == next.pressed
      && current.suppressed == next.suppressed) {
      return;
    }
    stateRef.current = next;
    setState(next);
  }, []);
  React.useEffect(() => {
    const updateModifier = (event: KeyboardEvent) => {
      const current = stateRef.current;
      const pressed = event.shiftKey;
      const suppressed = pressed && current.pressed
        ? current.suppressed
        : false;
      updateState({ pressed, suppressed });
    };
    const clearModifier = () => {
      updateState({ pressed: false, suppressed: false });
    };
    window.addEventListener("keydown", updateModifier);
    window.addEventListener("keyup", updateModifier);
    window.addEventListener("blur", clearModifier);
    return () => {
      window.removeEventListener("keydown", updateModifier);
      window.removeEventListener("keyup", updateModifier);
      window.removeEventListener("blur", clearModifier);
    };
  }, [updateState]);
  const suppress = React.useCallback(() => {
    const current = stateRef.current;
    if (current.pressed) {
      updateState({ ...current, suppressed: true });
    }
  }, [updateState]);
  return {
    pressed: state.pressed && !state.suppressed,
    suppress,
  };
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
  firmwareSettings?: McuParams;
  encoderVisibility?: NativeJogEncoderVisibility;
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
  panelCamera?: boolean;
  panelCameraStore?: PanelCameraStore;
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
  showSceneObjects: boolean;
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
  const gridPlantingRequest =
    params.addPlantProps?.designer.gridPlanting;
  const gridPlanting = !!gridPlantingRequest;
  const pointGridPlanting =
    gridPlantingRequest?.gridType == "point";
  const showPlants = gridPlanting
    || !params.addPlantProps
    || !!getConfigValue?.(BooleanSetting.show_plants);
  const plantsVisible = gridPlanting
    || (params.activeFocus != "Planter bed" && showPlants);
  const showFarmbot = !params.addPlantProps
    || !!getConfigValue?.(BooleanSetting.show_farmbot);
  const farmbotVisible =
    params.activeFocus != "Planter bed"
    && showFarmbot
    && params.botVisibleInConfig;
  const showPoints = pointGridPlanting
    || params.showSoilPoints
    || !!getConfigValue?.(BooleanSetting.show_points);
  const showWeeds = !params.addPlantProps
    || !!getConfigValue?.(BooleanSetting.show_weeds);
  const showSpread = !!getConfigValue?.(BooleanSetting.show_spread);
  const showMoistureMap = !!getConfigValue?.(
    BooleanSetting.show_moisture_interpolation_map);
  const showMoistureReadings = !!getConfigValue?.(
    BooleanSetting.show_sensor_readings);
  const showSceneObjects = !!getConfigValue?.(
    BooleanSetting.show_scene_objects);
  return {
    showPlants,
    plantsVisible,
    farmbotVisible,
    showPoints,
    showWeeds,
    showSpread,
    showMoistureMap,
    showMoistureReadings,
    showSceneObjects,
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
  backgroundColor: Color;
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
  sceneObjects: TaggedSceneObject[];
}

// eslint-disable-next-line complexity
const StaticGardenLayersBase = (props: StaticGardenLayersProps) => {
  const {
    config, markStep, environmentReveal, bedReveal, gridReveal,
    plantsReveal, weedsReveal, pointsReveal, backgroundColor,
    activePositionRef,
    soilSurfaceGeometry, getZ, images, activeFocus, mapPoints,
    showMoistureMap, showMoistureReadings, showTelescope,
    sensors, sensorReadings,
    addPlantProps, plantLabelNodes, plantsVisible,
    plantIconAtlas, setHover, threeDPlants, plantIconCapacities, startTimeRef,
    dispatch, stargazing, spaceflight, cameraSideStarClipEnabled,
    constellationDiscoveryEnabled, showSpread,
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
      <Sun
        config={config}
        sceneObjects={props.sceneObjects}
        backgroundColor={backgroundColor}
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
          spaceflight={spaceflight}
          dispatch={dispatch} />}
      <AmbientLight intensity={config.ambient / 100} />
      <Ground
        config={config}
        onClick={sceneObjectClick}
        onPointerMove={sceneObjectPointerMove} />
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
  axisActions: NativeJogAxisActionsContext | undefined;
  config: Config;
  configPosition: PositionConfig;
  detailsReveal: boolean;
  dispatch: Function | undefined;
  encoderData: NativeJogEncoderData | undefined;
  encoderVisibility: NativeJogEncoderVisibility | undefined;
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
      axisActions={props.axisActions}
      dispatch={props.dispatch}
      encoderData={props.encoderData}
      encoderVisibility={props.encoderVisibility}
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
        axisActions={props.axisActions}
        config={props.config}
        configPosition={props.configPosition}
        detailsReveal={props.detailsReveal}
        dispatch={props.dispatch}
        encoderData={props.encoderData}
        encoderVisibility={props.encoderVisibility}
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
  areaSelectionPhase: GardenAreaSelection["phase"] | undefined;
  config: Config;
  enabled: boolean;
  getZ(x: number, y: number): number;
  soilSurfaceGeometry: ReturnType<typeof getSurface>["geometry"];
  onHoverPositionChange(position: GridHoverPosition | undefined): void;
  onAreaSelect(position: GridHoverPosition, shiftKey: boolean): boolean;
  onLocationSelect(selection: ThreeDLocationSelection): void;
}

const inGardenGrid = (config: Config, position: GridHoverPosition) =>
  position.x >= 0
  && position.x <= config.botSizeX
  && position.y >= 0
  && position.y <= config.botSizeY;

const GridHoverTarget = (props: GridHoverTargetProps) => {
  const {
    areaSelectionPhase, config, enabled, getZ, onHoverPositionChange,
    onLocationSelect, onAreaSelect, soilSurfaceGeometry,
  } = props;
  const areaDragStarted = React.useRef(false);
  const suppressAreaClick = React.useRef(false);
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
  const selectArea = React.useCallback((
    event: ThreeEvent<PointerEvent>,
  ) => {
    const position = getGridPosition(event.point);
    if (!position) { return false; }
    return onAreaSelect({
      x: round(position.x),
      y: round(position.y),
    }, event.shiftKey);
  }, [getGridPosition, onAreaSelect]);
  const startAreaDrag = React.useCallback((
    event: ThreeEvent<PointerEvent>,
  ) => {
    if (!enabled || !event.shiftKey || areaSelectionPhase == "drawing") {
      return;
    }
    if (!gridSelectionAllowed() || !selectArea(event)) { return; }
    event.stopPropagation?.();
    areaDragStarted.current = true;
  }, [areaSelectionPhase, enabled, selectArea]);
  const finishAreaDrag = React.useCallback((
    event: ThreeEvent<PointerEvent>,
  ) => {
    if (!areaDragStarted.current) { return; }
    areaDragStarted.current = false;
    suppressAreaClick.current = true;
    event.stopPropagation?.();
    if (clickWasDragged(event)) { selectArea(event); }
  }, [selectArea]);
  const selectLocation = React.useCallback((event: ThreeEvent<MouseEvent>) => {
    if (suppressAreaClick.current) {
      suppressAreaClick.current = false;
      return;
    }
    if (!enabled || clickWasDragged(event)) { return; }
    if (!gridSelectionAllowed()) { return; }
    if (event.intersections?.some(({ object }) =>
      object.name.startsWith("bug-"))) { return; }
    const position = getGridPosition(event.point);
    if (!position) { return; }
    event.stopPropagation?.();
    const x = round(position.x);
    const y = round(position.y);
    if (onAreaSelect({ x, y }, event.shiftKey)) { return; }
    onLocationSelect({
      kind: "location",
      x,
      y,
      z: round(getZ(x, y)),
    });
  }, [enabled, getGridPosition, getZ, onAreaSelect, onLocationSelect]);
  return <Mesh
    name={"grid-hover-target"}
    geometry={hoverGeometry}
    // eslint-disable-next-line no-null/no-null
    dispose={null}
    position={hoverPosition}
    onPointerOver={updateHover}
    onPointerMove={updateHover}
    onPointerOut={clearHover}
    onPointerDown={startAreaDrag}
    onPointerUp={finishAreaDrag}
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
  startingCamera: Camera;
  cameraFollow: boolean;
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
  spaceflightViewportSize: CameraViewport;
  handleCameraFollowEscape?(): boolean;
  stopCameraFollow?(): void;
  viewPrismBridgeRef?: React.RefObject<ViewPrismBridge | null>;
}

interface CameraFollowEscapeBlockerProps {
  areaSelectionActive: boolean;
  popupOpen: boolean;
  panelCameraStore: PanelCameraStore | undefined;
  dispatch: Function | undefined;
}

export const blockCameraFollowEscape = (
  props: CameraFollowEscapeBlockerProps,
) => {
  if (props.areaSelectionActive || props.popupOpen) { return true; }
  if (!props.dispatch || !props.panelCameraStore?.getSnapshot()) {
    return false;
  }
  props.dispatch(setPanelOpen3D(false));
  return true;
};

const STARGAZING_MIN_POLAR_ANGLE = Math.PI / 2;
export type GardenCameraPhase =
  "normal" | "transitioning" | "stargazing" | "spaceflight";

export const stargazingOrbitPolarLimits = (
  phase: GardenCameraPhase,
  spaceflightCamera = SPACEFLIGHT_CAMERA,
) =>
  phase == "spaceflight"
    ? {
      min: cameraPolarAngle(spaceflightCamera),
      max: cameraPolarAngle(spaceflightCamera),
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

const isViewPrismKeyboardKey = (
  key: string,
): key is ViewPrismKeyboardKey =>
  key == "ArrowLeft"
  || key == "ArrowRight"
  || key == "ArrowUp"
  || key == "ArrowDown";

const viewPrismKeyboardTargetIsEditable = (
  target: EventTarget | null,
) => target instanceof Element
  && !!target.closest("input, textarea, select, [contenteditable]");

const commandPaletteIsOpen = () =>
  !!document.querySelector(".command-palette-dialog[open]");

export const useGardenCameraController = (
  props: GardenCameraControllerProps,
) => {
  const {
    width: spaceflightViewportWidth,
    height: spaceflightViewportHeight,
  } = props.spaceflightViewportSize;
  const spaceflightCamera = React.useMemo(() => {
    return spaceflightViewportWidth == DEFAULT_SPACEFLIGHT_VIEWPORT.width
      && spaceflightViewportHeight == DEFAULT_SPACEFLIGHT_VIEWPORT.height
      ? SPACEFLIGHT_CAMERA
      : getSpaceflightCamera({
        width: spaceflightViewportWidth,
        height: spaceflightViewportHeight,
      });
  }, [spaceflightViewportHeight, spaceflightViewportWidth]);
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
  const cameraFov = props.cameraFollow
    ? props.desiredFov
    : cameraRequest?.fov ?? props.desiredFov;
  const cameraSpringCancelRef =
    React.useRef<(() => void) | undefined>(undefined);
  const viewPrismKeyboardPresetRef =
    React.useRef<ViewPrismKeyboardPreset | undefined>(undefined);
  const resetViewPrismKeyboardNavigation = React.useCallback(() => {
    viewPrismKeyboardPresetRef.current = undefined;
  }, []);
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
  const synchronizeCameraRequest = React.useCallback(() => {
    resetViewPrismKeyboardNavigation();
    const current = liveCameraState();
    setCameraRequest({
      camera: {
        position: current.position,
        target: current.target,
      },
      fov: current.fov,
    });
  }, [liveCameraState, resetViewPrismKeyboardNavigation]);
  const previousCameraFollowRef = React.useRef(props.cameraFollow);
  const followModeReturnStateRef =
    React.useRef<SmoothCameraState | undefined>(undefined);
  React.useLayoutEffect(() => {
    const previousCameraFollow = previousCameraFollowRef.current;
    previousCameraFollowRef.current = props.cameraFollow;
    if (previousCameraFollow == props.cameraFollow) { return; }
    resetViewPrismKeyboardNavigation();
    cameraSpringCancelRef.current?.();
    if (props.cameraFollow) { return; }
    const startingCamera = props.startingCamera;
    const resetState: SmoothCameraState = {
      target: startingCamera.target,
      position: cameraPositionForFov(
        startingCamera.position,
        startingCamera.target,
        NORMAL_CAMERA_FOV,
        props.desiredFov,
      ),
      zoom: 1,
      fov: props.desiredFov,
    };
    if (props.viewMode != "normal") {
      followModeReturnStateRef.current = resetState;
      return;
    }
    followModeReturnStateRef.current = undefined;
    // Leaving follow mode intentionally resets the user's starting view.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCameraRequest({
      camera: {
        target: resetState.target,
        position: resetState.position,
      },
      fov: resetState.fov,
    });
  }, [
    props.cameraFollow,
    props.desiredFov,
    props.startingCamera,
    props.viewMode,
    resetViewPrismKeyboardNavigation,
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
    if (props.cameraFollow
      || props.viewMode != "normal"
      || !fovChanged) { return; }
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
  }, [props.cameraFollow, props.desiredFov, props.viewMode]);
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
    resetViewPrismKeyboardNavigation();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCameraPhase("transitioning");
    const current = liveCameraState();
    if (previousMode == "normal") {
      normalReturnStateRef.current =
        followModeReturnStateRef.current || current;
      followModeReturnStateRef.current = undefined;
    }
    if (props.viewMode == "spaceflight") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCameraRequest({
        camera: spaceflightCamera,
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
    resetViewPrismKeyboardNavigation,
    spaceflightCamera,
  ]);
  const previousSpaceflightCameraRef = React.useRef(spaceflightCamera);
  React.useLayoutEffect(() => {
    const previous = previousSpaceflightCameraRef.current;
    previousSpaceflightCameraRef.current = spaceflightCamera;
    if (previous == spaceflightCamera
      || props.viewMode != "spaceflight") {
      return;
    }
    const current = liveCameraState();
    const angle = Math.atan2(
      current.position[1] - current.target[1],
      current.position[0] - current.target[0],
    );
    // Viewport changes intentionally retarget the spaceflight camera.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCameraPhase("transitioning");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCameraRequest({
      camera: spaceflightCameraAtAngle(spaceflightCamera, angle),
      fov: SPACEFLIGHT_FOV,
      interpolation: "linear",
      onRest: () => setCameraPhase("spaceflight"),
    });
  }, [
    liveCameraState,
    props.viewMode,
    spaceflightCamera,
  ]);
  const selectViewDirection = React.useCallback(
    (direction: ViewPrismDirection) => {
      if (props.cameraFollow) { return; }
      resetViewPrismKeyboardNavigation();
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
      props.cameraFollow,
      props.controls,
      props.viewportSize,
      resetViewPrismKeyboardNavigation,
    ]);
  const startingCameraSelector = React.useMemo(() =>
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
  const selectStartingCamera = React.useCallback((
    heading: number,
    topDown: boolean,
  ) => {
    resetViewPrismKeyboardNavigation();
    startingCameraSelector(heading, topDown);
  }, [resetViewPrismKeyboardNavigation, startingCameraSelector]);
  React.useEffect(() => {
    if (!props.viewPrismBridgeRef
      || props.promo
      || props.cameraFollow
      || props.viewMode != "normal"
      || cameraPhase != "normal") {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isViewPrismKeyboardKey(event.key)
        || event.altKey
        || event.ctrlKey
        || event.metaKey
        || event.shiftKey
        || event.repeat
        || viewPrismKeyboardTargetIsEditable(event.target)
        || commandPaletteIsOpen()) {
        return;
      }
      event.preventDefault();
      const current = liveCameraState();
      const nextPreset = nextViewPrismKeyboardPreset(
        viewPrismKeyboardPresetRef.current || {
          position: current.position,
          target: current.target,
        },
        event.key,
        props.viewportSize,
      );
      if (!nextPreset) { return; }
      viewPrismKeyboardPresetRef.current = nextPreset;
      setCameraRequest(createViewDirectionRequest(
        nextPreset.direction,
        current,
        props.cameraFitRadius,
        nextPreset.azimuth,
        props.viewportSize,
      ));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    cameraPhase,
    liveCameraState,
    props.cameraFitRadius,
    props.cameraFollow,
    props.promo,
    props.viewMode,
    props.viewPrismBridgeRef,
    props.viewportSize,
  ]);
  const {
    cameraFollow, handleCameraFollowEscape, stopCameraFollow,
  } = props;
  React.useEffect(() => {
    if (!cameraFollow || !stopCameraFollow) { return; }
    const stopFollowOnEscape = (event: KeyboardEvent) => {
      if (event.key == "Escape"
        && !event.repeat
        && !event.defaultPrevented
        && !commandPaletteIsOpen()
        && !handleCameraFollowEscape?.()) {
        stopCameraFollow();
      }
    };
    window.addEventListener("keydown", stopFollowOnEscape);
    return () => window.removeEventListener("keydown", stopFollowOnEscape);
  }, [
    cameraFollow,
    handleCameraFollowEscape,
    stopCameraFollow,
  ]);
  React.useImperativeHandle(props.viewPrismBridgeRef, () => ({
    camera: props.controlsCamera || undefined,
    selectDirection: cameraFollow
      ? () => stopCameraFollow?.()
      : selectViewDirection,
  }), [
    cameraFollow,
    props.controlsCamera,
    selectViewDirection,
    stopCameraFollow,
  ]);
  React.useEffect(() => {
    resetViewPrismKeyboardNavigation();
    if (!props.activeFocus) { return; }
    // A promo focus owns the camera target until the next user request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCameraRequest(undefined);
  }, [props.activeFocus, resetViewPrismKeyboardNavigation]);
  return {
    camera,
    cameraFov,
    cameraRequest,
    cameraSpringCancelRef,
    selectStartingCamera,
    resetViewPrismKeyboardNavigation,
    synchronizeCameraRequest,
    cameraPhase,
    spaceflightCamera,
  };
};

interface GardenSectionControllerProps {
  config: Config;
  designer: ThreeDDesignerState | undefined;
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
    !!props.designer?.threeDSectionClipAll,
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
  designer: ThreeDDesignerState | undefined;
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
        clipAll={!!props.designer?.threeDSectionClipAll}
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

export interface GardenRouteSnapshot {
  key: string;
  mode: Mode;
  selection: ThreeDObjectSelection | undefined;
  locationSelection: ThreeDLocationSelection | undefined;
  groupId: number | undefined;
  addingSceneObject: boolean;
  editingSceneObject: boolean;
}

const routeSelectionKey = (
  selection: ThreeDObjectSelection | undefined,
) =>
  selection
    ? `${selection.kind}:${selection.id}:${selection.uuid || ""}`
    : "";

const routeLocationKey = (
  selection: ThreeDLocationSelection | undefined,
) =>
  selection
    ? `${selection.x}:${selection.y}:${selection.z}`
    : "";

export const createGardenRouteSnapshot = (
  pathname: string,
  search: string,
): GardenRouteSnapshot => {
  const mode = getMode();
  const pathParts = pathname.split("/").filter(Boolean);
  const designerIndex = pathParts.indexOf("designer");
  const panel = pathParts[designerIndex + 1];
  const panelItem = pathParts[designerIndex + 2];
  const cropSlug = panel == "plants" && panelItem == "crop_search"
    ? kebabCase(pathParts[designerIndex + 3] || "")
    : "";
  const selection = routeSelectionFromPath(pathname);
  const locationSelection =
    routeLocationSelectionFromPath(pathname, search);
  const lastPathPart =
    pathname.split("/").filter(Boolean).pop() || "";
  const parsedGroupId = parseInt(lastPathPart);
  const groupId = mode == Mode.editGroup && isFinite(parsedGroupId)
    ? parsedGroupId
    : undefined;
  const addingSceneObject = pathname == Path.sceneObjects("add");
  const editingSceneObject = panel == "scene_objects"
    && !addingSceneObject
    && !!panelItem;
  const key = [
    mode,
    routeSelectionKey(selection),
    routeLocationKey(locationSelection),
    groupId,
    cropSlug,
    addingSceneObject,
    editingSceneObject,
  ].join("|");
  return {
    key,
    mode,
    selection,
    locationSelection,
    groupId,
    addingSceneObject,
    editingSceneObject,
  };
};

export interface GardenViewportSnapshot {
  width: number;
  height: number;
}

export const selectGardenViewportWidth =
  (state: RootState) => state.size.width;
export const selectGardenViewportHeight =
  (state: RootState) => state.size.height;
const selectGardenInvalidate = (state: RootState) => state.invalidate;

interface GardenSceneBackgroundProps {
  backgroundColor: Color;
  ready: boolean;
}

export const GardenSceneBackground = (
  props: GardenSceneBackgroundProps,
) =>
  props.ready
    ? <Primitive object={props.backgroundColor} attach={"background"} />
    : undefined;

interface GardenModelSceneProps extends GardenModelProps {
  route: GardenRouteSnapshot;
  viewport: GardenViewportSnapshot;
  navigate(path: string): void;
}

interface GardenCameraRigProps {
  camera: Camera;
  zoom: number;
  fov: number;
  smooth: boolean;
  interpolation: CameraInterpolation | undefined;
  cancelRef: React.MutableRefObject<(() => void) | undefined>;
  onRest: (() => void) | undefined;
  controlsCamera: ThreePerspectiveCamera | null;
  setControlsCamera(camera: ThreePerspectiveCamera | null): void;
  controls: SmoothCameraControls | null;
  setControls(controls: SmoothCameraControls | null): void;
  panelCameraView: CameraViewOffset;
  cameraPhase: GardenCameraPhase;
  spaceflightCamera: Camera;
  viewMode: ThreeDViewMode;
  cameraFollow: boolean;
  rotate: boolean;
  zoomEnabled: boolean;
  pan: boolean;
  lightsDebug: boolean;
  onStart(): void;
  onChange(): void;
  onEnd(): void;
}

const gardenCameraKey = (camera: Camera, zoom: number, fov: number) => [
  ...camera.position,
  ...camera.target,
  zoom,
  fov,
].join(",");

interface GardenCameraSpringProps {
  camera: Camera;
  zoom: number;
  fov: number;
  smooth: boolean;
  interpolation: CameraInterpolation | undefined;
  cancelRef: React.MutableRefObject<(() => void) | undefined>;
  onRest: (() => void) | undefined;
  controlsCamera: ThreePerspectiveCamera | null;
  controls: SmoothCameraControls | null;
  requestKey: string;
}

const GardenCameraSpring = (props: GardenCameraSpringProps) => {
  const invalidate = useThree(selectGardenInvalidate);
  React.useEffect(() => {
    perfCount("change.GardenCameraRig.cameraRequest");
  }, [props.requestKey]);
  useSmoothCamera({
    camera: props.camera,
    zoom: props.zoom,
    fov: props.fov,
    enabled: props.smooth,
    cameraObject: props.controlsCamera,
    controls: props.controls,
    interpolation: props.interpolation,
    cancelRef: props.cancelRef,
    onFrame: invalidate,
    onRest: props.onRest,
  });
  return <></>;
};

// eslint-disable-next-line complexity
const GardenCameraRigBase = (props: GardenCameraRigProps) => {
  usePerfRenderCount("GardenCameraRig");
  const {
    camera, zoom, fov, smooth, interpolation, cancelRef, onRest,
    controlsCamera, setControlsCamera, controls, setControls,
    panelCameraView, cameraPhase, spaceflightCamera, viewMode, rotate,
    cameraFollow, zoomEnabled, pan, lightsDebug, onStart, onChange, onEnd,
  } = props;
  const requestKey = gardenCameraKey(camera, zoom, fov);
  const targetCamera = React.useMemo<SmoothCameraState>(() => ({
    position: camera.position,
    target: camera.target,
    zoom,
    fov,
  }), [
    camera.position,
    camera.target,
    fov,
    zoom,
  ]);
  const [initialCamera] = React.useState(() => targetCamera);
  const renderedCamera = smooth ? initialCamera : targetCamera;
  const cameraDistance = Math.hypot(
    targetCamera.position[0] - targetCamera.target[0],
    targetCamera.position[1] - targetCamera.target[1],
    targetCamera.position[2] - targetCamera.target[2],
  );
  const previousRequestKeyRef = React.useRef(requestKey);
  const [cameraDistanceTransition, setCameraDistanceTransition] =
    React.useState<{
      requestKey: string;
      maxDistance: number;
    } | undefined>();
  React.useLayoutEffect(() => {
    if (previousRequestKeyRef.current == requestKey) { return; }
    previousRequestKeyRef.current = requestKey;
    if (!smooth) { return; }
    const liveCamera = readSmoothCameraState(
      targetCamera,
      controlsCamera,
      controls,
    );
    // Camera request boundaries intentionally expand controls before paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCameraDistanceTransition({
      requestKey,
      maxDistance: Math.max(
        cameraRadius(liveCamera),
        cameraDistance,
      ) * 1.25,
    });
  }, [
    cameraDistance,
    controls,
    controlsCamera,
    requestKey,
    smooth,
    targetCamera,
  ]);
  const handleCameraRest = React.useCallback(() => {
    setCameraDistanceTransition(current =>
      current?.requestKey == requestKey ? undefined : current);
    onRest?.();
  }, [onRest, requestKey]);
  const transitionMaxDistance =
    cameraDistanceTransition?.requestKey == requestKey
      ? cameraDistanceTransition.maxDistance
      : 0;
  const maxCameraDistance = Math.max(
    BigDistance.zoom,
    cameraDistance * 1.25,
    transitionMaxDistance,
  );
  const normalMinCameraDistance = lightsDebug ? 50 : 500;
  const normalMaxCameraDistance = lightsDebug
    ? Math.max(BigDistance.devZoom, maxCameraDistance)
    : maxCameraDistance;
  const orbitMinCameraDistance = cameraFollow
    ? 0
    : normalMinCameraDistance;
  const orbitMaxCameraDistance = cameraFollow
    ? Infinity
    : normalMaxCameraDistance;
  const cameraClippingRange = getCameraClippingRange(
    targetCamera.position,
    {
      sceneRadius: CAMERA_SCENE_RADIUS,
      minNear: 10,
      minFar: BigDistance.far,
      maxCameraScale: 1,
    },
  );
  const stargazingCameraSettled = cameraPhase == "stargazing";
  const spaceflightCameraSettled = cameraPhase == "spaceflight";
  const normalCameraSettled = cameraPhase == "normal";
  const orbitPolarLimits = stargazingOrbitPolarLimits(
    cameraPhase,
    spaceflightCamera,
  );
  const orbitRotationEnabled =
    !cameraFollow && (
      spaceflightCameraSettled && viewMode == "spaceflight"
      || stargazingCameraSettled && viewMode == "stargazing"
      || normalCameraSettled && viewMode == "normal" && rotate);

  return <>
    {!cameraFollow &&
      <GardenCameraSpring
        camera={camera}
        zoom={zoom}
        fov={fov}
        smooth={smooth}
        interpolation={interpolation}
        cancelRef={cancelRef}
        onRest={handleCameraRest}
        controlsCamera={controlsCamera}
        controls={controls}
        requestKey={requestKey} />}
    <Group>
      <PerspectiveCamera
        ref={setControlsCamera}
        makeDefault={true}
        manual={true}
        aspect={panelCameraView.fullWidth
          / panelCameraView.fullHeight}
        name={"camera"}
        position={renderedCamera.position}
        zoom={renderedCamera.zoom}
        fov={renderedCamera.fov}
        near={cameraClippingRange.near}
        far={cameraClippingRange.far}
        up={[0, 0, 1]} />
    </Group>
    {controlsCamera &&
      <OrbitControls
        ref={setControls}
        camera={controlsCamera}
        target={renderedCamera.target}
        minPolarAngle={orbitPolarLimits.min}
        maxPolarAngle={orbitPolarLimits.max}
        enableRotate={orbitRotationEnabled}
        enableZoom={normalCameraSettled
          && viewMode == "normal" && !cameraFollow && zoomEnabled}
        zoomToCursor={true}
        enablePan={normalCameraSettled
          && viewMode == "normal" && !cameraFollow && pan}
        dampingFactor={0.2}
        onStart={onStart}
        onChange={onChange}
        onEnd={onEnd}
        minZoom={lightsDebug ? 0 : 0.05}
        maxZoom={10}
        minDistance={orbitMinCameraDistance}
        maxDistance={orbitMaxCameraDistance} />}
  </>;
};

export const GardenCameraRig = React.memo(GardenCameraRigBase);

GardenCameraRig.displayName = "GardenCameraRig";

// eslint-disable-next-line complexity
const GardenModelSceneBase = (props: GardenModelSceneProps) => {
  usePerfRenderCount("GardenModel");
  React.useEffect(() => {
    perfCount("change.GardenModel.route");
  }, [props.route.key]);
  React.useEffect(() => {
    perfCount("change.GardenModel.viewport");
  }, [props.viewport.height, props.viewport.width]);
  const {
    config: baseConfig, addPlantProps, onDetailsRevealStart, onLoadComplete,
    threeDPlants,
  } = props;
  const config = useSmoothConfig(
    baseConfig,
    props.smoothConfigTransitions,
  );
  const canvasViewportSize = props.viewport;
  const panelCameraView = React.useMemo(
    () => getPanelCameraViewOffset(
      canvasViewportSize,
      props.panelCamera ? true : undefined,
    ),
    [canvasViewportSize, props.panelCamera],
  );
  const viewportSize = React.useMemo(() => ({
    width: panelCameraView.fullWidth,
    height: panelCameraView.fullHeight,
  }), [panelCameraView.fullHeight, panelCameraView.fullWidth]);
  const spaceflightViewportSize = getVisibleSpaceflightViewport(
    canvasViewportSize,
    { width: window.innerWidth, height: window.innerHeight },
  );
  const configPosition = props.configPosition;
  const cameraConfig = props.smoothConfigTransitions
    ? baseConfig
    : config;
  const dispatch = addPlantProps?.dispatch;
  const navigate = props.navigate;
  const mapPoints = props.mapPoints || EMPTY_GENERIC_POINTERS;
  const weeds = props.weeds || EMPTY_WEEDS;
  const allPoints = props.allPoints || EMPTY_POINTS;
  const currentBotLocation = props.currentBotLocation || EMPTY_BOT_POSITION;
  const groups = props.groups || EMPTY_POINT_GROUPS;
  const plants = props.plants || EMPTY_PLANTS;
  const toolSlots = props.toolSlots || EMPTY_TOOL_SLOTS;
  const tools = props.tools || EMPTY_TOOLS;
  const sequences = props.sequences || EMPTY_SEQUENCES;
  const images = props.images || EMPTY_IMAGES;
  const sensors = props.sensors || EMPTY_SENSORS;
  const sensorReadings = props.sensorReadings || EMPTY_SENSOR_READINGS;
  const sectionDesigner = addPlantProps?.designer;
  const shadowSceneObjects = React.useMemo(() => {
    const featuredScene = sectionDesigner?.featuredScene;
    const sceneObjects = featuredScene
      ? staticSceneObjects(featuredScene)
      : staticSceneObjects(config.scene,
        props.promo && !config.outdoorObjects);
    return (props.sceneObjects || []).concat(sceneObjects);
  }, [
    config.scene,
    props.promo,
    config.outdoorObjects,
    props.sceneObjects,
    sectionDesigner?.featuredScene,
  ]);
  const viewMode = sectionDesigner?.threeDViewMode ?? "normal";
  const celestialViewActive = viewMode != "normal";
  const cameraFollow = !!sectionDesigner?.threeDCameraFollow
    && !celestialViewActive;
  const spaceflight = viewMode == "spaceflight";
  const stargazingFov = sectionDesigner?.threeDStargazingFov
    ?? STARGAZING_DEFAULT_FOV;
  const [botPositionStore] = React.useState(
    () => createBotPositionSnapshotStore(
      props.configPosition,
    ),
  );
  const sectionBridgeRef =
    React.useRef<GardenSectionBridge | undefined>(undefined);
  const sectionOpen = !!sectionDesigner?.threeDSectionOpen;
  const topDownAtStart = !!addPlantProps?.topDownAtStart;
  const mode = props.route.mode;
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
  const [cameraDragging, setCameraDragging] = React.useState(false);
  const [gridHoverPosition, setGridHoverPosition] =
    React.useState<GridHoverPosition | undefined>(undefined);
  const [areaSelection, setAreaSelection] =
    React.useState<GardenAreaSelection | undefined>(undefined);
  const [popupSelection, setPopupSelection] =
    React.useState<ThreeDObjectSelection | undefined>(undefined);
  const [locationSelection, setLocationSelection] =
    React.useState<ThreeDLocationSelection | undefined>(undefined);
  const [popupSelectionMode, setPopupSelectionMode] =
    React.useState(objectSelectionMode);
  if (popupSelectionMode != objectSelectionMode) {
    setPopupSelectionMode(objectSelectionMode);
    if (objectSelectionMode) {
      setPopupSelection(undefined);
      setLocationSelection(undefined);
    }
  }
  const areaSelectionDrawing = areaSelection?.phase == "drawing";
  const selectableObjectHovered = !areaSelectionDrawing
    && (selectableObjectHoverCount > 0 || plantIntersected);
  const {
    pressed: shiftPressed,
    suppress: suppressShiftSelection,
  } = useShiftModifier();
  const updateGridHoverPosition = React.useCallback((
    position: GridHoverPosition | undefined,
  ) => {
    setGridHoverPosition(position);
    if (!position) { return; }
    setAreaSelection(current => current?.phase == "drawing"
      ? {
        ...current,
        box: {
          ...current.box,
          x1: round(position.x),
          y1: round(position.y),
        },
      }
      : current);
  }, []);
  const setSelectableObjectHover = React.useCallback(
    (hovered: boolean) => setSelectableObjectHoverCount(count =>
      hovered ? count + 1 : Math.max(0, count - 1)),
    []);
  const setObjectHoverLabel = React.useCallback(
    (selection: ThreeDObjectSelection | undefined) =>
      setHoveredObjectLabel(selection),
    []);
  const clearObjectHover = React.useCallback(() => {
    setHoveredPlant(undefined);
    setSelectableObjectHoverCount(0);
    setPlantIntersected(false);
    setHoveredObjectLabel(undefined);
  }, []);
  const handleScenePointerLeave = React.useCallback(() => {
    clearObjectHover();
    setGridHoverPosition(undefined);
  }, [clearObjectHover]);
  const handleScenePointerMove = React.useCallback((event: ThreeEvent<PointerEvent>) => {
    if (config.eventDebug) {
      console.log(event.intersections.map(x => x.object.name));
    }
    const nextPlantIntersected =
      !areaSelectionDrawing
      && plantsSelectable
      && hasPlantIntersection(event);
    setPlantIntersected(current =>
      current == nextPlantIntersected ? current : nextPlantIntersected);
  }, [areaSelectionDrawing, config.eventDebug, plantsSelectable]);

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
    return config.labelsOnHover && !areaSelectionDrawing
      ? (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation?.();
        const nextHover = active ? getI(e) : undefined;
        setHoveredPlant(nextHover);
      }
      : undefined;
  }, [areaSelectionDrawing, config.labelsOnHover, getI]);

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
  const stopCameraFollow = React.useCallback(() => dispatch?.({
    type: Actions.SET_3D_CAMERA_FOLLOW,
    payload: false,
  }), [dispatch]);
  const handleCameraFollowEscape = React.useCallback(() =>
    blockCameraFollowEscape({
      areaSelectionActive: !!areaSelection,
      popupOpen: !objectSelectionMode
        && (!!popupSelection || !!locationSelection),
      panelCameraStore: props.panelCameraStore,
      dispatch,
    }), [
    areaSelection,
    dispatch,
    locationSelection,
    objectSelectionMode,
    popupSelection,
    props.panelCameraStore,
  ]);
  const cameraController = useGardenCameraController({
    baseCamera,
    startingCamera: defaultCamera,
    cameraFollow,
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
    spaceflightViewportSize,
    handleCameraFollowEscape,
    stopCameraFollow,
    viewPrismBridgeRef: props.viewPrismBridgeRef,
  });
  const {
    camera, cameraFov, cameraRequest, cameraSpringCancelRef,
    selectStartingCamera, resetViewPrismKeyboardNavigation,
    synchronizeCameraRequest, cameraPhase, spaceflightCamera,
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
  const environmentLoaded =
    loadProgress.readyStepTimes.environment !== undefined;
  const gridLoaded = loadProgress.readyStepTimes.grid !== undefined;
  const detailsRevealNotified = React.useRef(false);
  const loadCompleteNotified = React.useRef(false);
  const markLoadStep = loadProgress.markStep;
  const markDetailsLoaded = React.useCallback(() => {
    markLoadStep("details");
  }, [markLoadStep]);
  const routeSelection = props.route.selection;
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
  const selectAreaCorner = React.useCallback((
    position: GridHoverPosition,
    shiftKey: boolean,
  ) => {
    if (areaSelection?.phase == "drawing") {
      setAreaSelection({
        ...areaSelection,
        phase: "complete",
        box: {
          ...areaSelection.box,
          x1: position.x,
          y1: position.y,
        },
      });
      return true;
    }
    if (!shiftKey || !shiftPressed) { return false; }
    closePopup();
    clearObjectHover();
    dispatch?.(selectPoint(undefined));
    setAreaSelection({
      phase: "drawing",
      pointType: "Plant",
      box: {
        x0: position.x,
        y0: position.y,
        x1: position.x,
        y1: position.y,
      },
    });
    return true;
  }, [
    areaSelection,
    clearObjectHover,
    closePopup,
    dispatch,
    shiftPressed,
  ]);
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
  const copySelectedSceneObject = React.useCallback((
    sceneObject: TaggedSceneObject,
  ) => {
    if (!dispatch) { return; }
    dispatch(copySceneObject(sceneObject, navigate));
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
      if (event.key != "Escape") { return; }
      event.preventDefault();
      closePopup();
    };
    window.addEventListener("keydown", closeOnEscape, true);
    return () => window.removeEventListener("keydown", closeOnEscape, true);
  }, [activeLocationSelection, activePopupSelection, closePopup]);

  React.useEffect(() => {
    if (!detailsReveal || detailsRevealNotified.current) { return; }
    detailsRevealNotified.current = true;
    onDetailsRevealStart?.();
  }, [detailsReveal, onDetailsRevealStart]);

  React.useEffect(() => {
    if (!loadProgress.complete || loadCompleteNotified.current) { return; }
    loadCompleteNotified.current = true;
    perfMark("three_d_full_ready");
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
    showMoistureReadings, showSceneObjects,
  } = layerVisibility;
  const routeKey = props.route.key;
  const groupIdFromPath = props.route.groupId;
  const groupSelectedPoints = React.useMemo(() => {
    if (!groupPanelOpen || groupIdFromPath == undefined) { return undefined; }
    const group = groups.filter(group => group.body.id == groupIdFromPath)[0];
    return group ? pointsSelectedByGroup(group, allPoints) : undefined;
  }, [allPoints, groupIdFromPath, groupPanelOpen, groups]);
  const areaSelectedUuids = React.useMemo(() => {
    if (!areaSelection || areaSelection.phase == "firstCorner") { return []; }
    const selectablePoints = allPoints.map(point =>
      point.body.pointer_type == "ToolSlot"
        && point.body.gantry_mounted
        ? {
          ...point,
          body: {
            ...point.body,
            x: currentBotLocation.x ?? point.body.x,
          },
        }
        : point);
    const points = getFilteredPoints({
      plants,
      allPoints: selectablePoints,
      selectionPointType: areaSelectionPointTypes(
        areaSelection.pointType,
      ),
      getConfigValue: addPlantProps?.getConfigValue,
    });
    return getSelected(points, areaSelection.box) || [];
  }, [
    addPlantProps?.getConfigValue,
    allPoints,
    areaSelection,
    currentBotLocation.x,
    plants,
  ]);
  React.useEffect(() => {
    if (areaSelection?.phase != "complete" || !dispatch) { return; }
    dispatch({
      type: Actions.SET_SELECTION_POINT_TYPE,
      payload: areaSelectionPointTypes(areaSelection.pointType),
    });
    dispatch(selectPoint(
      areaSelectedUuids.length > 0 ? areaSelectedUuids : undefined,
    ));
  }, [areaSelectedUuids, areaSelection, dispatch]);
  const clearAreaSelectedPoints = React.useCallback(() => {
    dispatch?.(selectPoint(undefined));
    dispatch?.({
      type: Actions.SET_SELECTION_POINT_TYPE,
      payload: undefined,
    });
  }, [dispatch]);
  const closeAreaSelection = React.useCallback(() => {
    setAreaSelection(undefined);
    suppressShiftSelection();
    clearAreaSelectedPoints();
  }, [clearAreaSelectedPoints, suppressShiftSelection]);
  const updateAreaSelectionBox = React.useCallback((
    box: AreaSelectionBox,
  ) => {
    setAreaSelection(current => current?.phase == "complete"
      ? { ...current, box: normalizeAreaSelectionBox(box) }
      : current);
  }, []);
  const updateAreaSelectionPointType = React.useCallback((
    pointType: AreaSelectionPointType,
  ) => {
    setAreaSelection(current => current?.phase == "complete"
      ? { ...current, pointType }
      : current);
  }, []);
  const openAreaSelectionPanel = React.useCallback(() => {
    dispatch?.(setPanelOpen3D(true));
    navigate(Path.plants("select"));
    setAreaSelection(undefined);
  }, [dispatch, navigate]);
  const deleteAreaSelection = React.useCallback(() => {
    if (!dispatch || areaSelectedUuids.length == 0) { return; }
    if (!confirm(t(
      "Are you sure you want to delete {{count}} selected objects?",
      { count: areaSelectedUuids.length },
    ))) { return; }
    areaSelectedUuids.forEach(uuid => {
      void dispatch(destroy(uuid, true));
    });
    closeAreaSelection();
  }, [areaSelectedUuids, closeAreaSelection, dispatch]);
  const createAreaSelectionGroup = React.useCallback(() => {
    if (!dispatch || !areaSelection || areaSelectedUuids.length == 0) {
      return;
    }
    if (sectionDesigner?.openedSavedGarden) {
      error(t(Content.ERROR_PLANT_TEMPLATE_GROUP));
      return;
    }
    dispatch(setPanelOpen3D(true));
    dispatch(createGroup({
      pointUuids: areaSelectedUuids,
      navigate: navigate as NavigateFunction,
    }));
    setAreaSelection(undefined);
  }, [
    areaSelectedUuids,
    areaSelection,
    dispatch,
    navigate,
    sectionDesigner?.openedSavedGarden,
  ]);
  React.useEffect(() => {
    if (!areaSelection) { return; }
    const exitAreaSelectionOnEscape = (event: KeyboardEvent) => {
      if (event.key != "Escape") { return; }
      event.preventDefault();
      closeAreaSelection();
    };
    window.addEventListener("keydown", exitAreaSelectionOnEscape, true);
    return () =>
      window.removeEventListener("keydown", exitAreaSelectionOnEscape, true);
  }, [areaSelection, closeAreaSelection]);
  const selectedObjectSelections = React.useMemo(() => {
    let selectedPoints: string[] | undefined;
    if (areaSelection && areaSelection.phase != "firstCorner") {
      selectedPoints = areaSelectedUuids;
    } else if (selectionPanelOpen) {
      selectedPoints = addPlantProps?.designer.selectedPoints;
    } else {
      selectedPoints = groupSelectedPoints?.map(point => point.uuid);
    }
    if (!selectedPoints) { return undefined; }
    const selections: ThreeDObjectSelection[] = [];
    selectedPoints.forEach(uuid => {
      const selection = selectionForUuid(selectionLookup, uuid);
      if (selection) { selections.push(selection); }
    });
    return selections;
  }, [
    addPlantProps?.designer,
    areaSelectedUuids,
    areaSelection,
    groupSelectedPoints,
    selectionLookup,
    selectionPanelOpen,
  ]);
  const selectedLocation = props.route.locationSelection;
  const hoverDesigner = addPlantProps?.designer;
  const hoverScene: string = hoverDesigner?.featuredScene || config.scene;
  const hoverSelection = React.useMemo(() =>
    hoverSelectionFromDesigner(
      hoverDesigner,
      plants,
      mapPoints,
      weeds,
      toolSlots,
      (props.sceneObjects || []).concat(staticSceneObjects(hoverScene)),
    ), [
    hoverDesigner,
    hoverScene,
    plants,
    mapPoints,
    props.sceneObjects,
    weeds,
    toolSlots,
  ]);
  const visualSelection = activePopupSelection;
  const panelVisualSelection = hoverSelection || routeSelection;
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
    && !selectableObjectHovered
    && !shiftPressed
    && !areaSelection;
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
  const addingSceneObject = props.route.addingSceneObject;
  const editingSceneObject = props.route.editingSceneObject;
  const sceneObjectPlacement = useSceneObjectPlacement({
    config,
    enabled: addingSceneObject,
    navigate,
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
    if (!cameraFollow && !sectionOpen
      && baseConfig.urlCameraPos && controlsCamera && controls) {
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
    cameraFollow,
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
    resetViewPrismKeyboardNavigation();
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
    resetViewPrismKeyboardNavigation,
    sectionOpen,
    celestialViewActive,
  ]);
  const handleCameraDragEnd = React.useCallback(() => {
    synchronizeCameraRequest();
    setCameraDragging(false);
    if (cameraUrlInteractionRef.current != "active") { return; }
    cameraUrlInteractionRef.current = "settling";
    saveCameraUrl();
    scheduleCameraUrlSave();
  }, [
    saveCameraUrl,
    scheduleCameraUrlSave,
    synchronizeCameraRequest,
  ]);
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
  useFrame((_state, deltaSeconds) => {
    if (!spaceflight || cameraPhase != "spaceflight"
      || !controlsCamera || !controls) {
      return;
    }
    const current = readSmoothCameraState({
      position: spaceflightCamera.position,
      target: spaceflightCamera.target,
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

  const backgroundColor = React.useMemo(() => new Color(
    ...skyColor(config.sun, config.scene),
  ), [config.scene, config.sun]);
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
      if (areaSelectionDrawing && plantLabelConfig.labelsOnHover) {
        return undefined;
      }
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
      areaSelectionDrawing,
      getZ,
      hoveredPlant,
      plantLabelConfig,
    ]);
  const objectHoverLabelNode = React.useMemo(() => {
    if (areaSelectionDrawing
      || !config.labelsOnHover
      || !hoveredObjectLabel) {
      return undefined;
    }
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
    areaSelectionDrawing,
    config,
    configPosition,
    getZ,
    hoveredObjectLabel,
    mapPoints,
    toolSlots,
    weeds,
  ]);

  return <ControlCursorProvider baseCursor={sceneCursor}>
    <FocusTransitionProvider enabled={focusTransitionsEnabled}>
      <GardenSceneBackground
        backgroundColor={backgroundColor}
        ready={environmentLoaded} />
      {/* eslint-disable-next-line no-null/no-null */}
      <Group dispose={null}
        ref={setModelRootRef}
        onPointerMove={handleScenePointerMove}
        onPointerLeave={handleScenePointerLeave}>
        <FPSProbe />
        <PerfMark name={"garden_model_rendered"} />
        <GardenCameraRig
          camera={camera}
          zoom={targetZoom}
          fov={cameraFov}
          smooth={focusTransitionsEnabled || !!addPlantProps}
          interpolation={cameraRequest?.interpolation}
          cancelRef={cameraSpringCancelRef}
          onRest={cameraRequest?.onRest}
          controlsCamera={controlsCamera}
          setControlsCamera={setControlsCamera}
          controls={controls}
          setControls={setControls}
          panelCameraView={panelCameraView}
          cameraPhase={cameraPhase}
          spaceflightCamera={spaceflightCamera}
          viewMode={viewMode}
          cameraFollow={cameraFollow}
          rotate={config.rotate && (!shiftPressed || !!areaSelection)}
          zoomEnabled={config.zoom}
          pan={config.pan && (!shiftPressed || !!areaSelection)}
          lightsDebug={config.lightsDebug}
          onStart={handleCameraDragStart}
          onChange={handleCameraChange}
          onEnd={handleCameraDragEnd} />
        <CameraFollowController
          enabled={cameraFollow}
          botSpringActive={farmbotVisible}
          botPositionStore={botPositionStore}
          config={config}
          position={configPosition}
          getZ={getZ}
          viewport={viewportSize}
          cameraView={panelCameraView}
          panelCameraStore={props.panelCameraStore}
          controlsCamera={controlsCamera}
          controls={controls} />
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
          sceneObjects={shadowSceneObjects}
          markStep={markLoadStep}
          environmentReveal={environmentReveal}
          bedReveal={bedReveal}
          gridReveal={gridReveal}
          plantsReveal={plantsReveal}
          weedsReveal={weedsReveal}
          pointsReveal={pointsReveal}
          backgroundColor={backgroundColor}
          activePositionRef={activePositionRef}
          soilSurfaceGeometry={soilSurface.geometry}
          getZ={getZ}
          images={images}
          activeFocus={props.activeFocus}
          mapPoints={mapPoints}
          showMoistureMap={showMoistureMap}
          showMoistureReadings={showMoistureReadings}
          showTelescope={
            (!props.promo || props.config.telescope) && !sectionOpen}
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
          stargazing={viewMode == "stargazing"}
          spaceflight={spaceflight}
          cameraSideStarClipEnabled={cameraSideStarClipEnabled(cameraPhase)}
          constellationDiscoveryEnabled={constellationDiscoveryEnabled(
            viewMode,
            cameraPhase,
          )}
          showSpread={showSpread}
          plantInstanceCapacity={props.plantInstanceCapacity}
          routeKey={routeKey}
          seasonResetKey={props.seasonResetKey}
          showWeeds={showWeeds}
          weeds={weeds}
          plantsSelectable={plantsSelectable && !areaSelectionDrawing}
          pointsSelectable={pointsSelectable && !areaSelectionDrawing}
          weedsSelectable={weedsSelectable && !areaSelectionDrawing}
          onSelectObject={areaSelectionDrawing ? undefined : onSelectObject}
          onHoverObject={areaSelectionDrawing
            ? undefined
            : setSelectableObjectHover}
          onHoverLabel={config.labelsOnHover && !areaSelectionDrawing
            ? setObjectHoverLabel
            : undefined}
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
            areaSelectionPhase={areaSelection?.phase}
            config={config}
            enabled={gridHoverEnabled}
            getZ={getZ}
            soilSurfaceGeometry={soilSurface.geometry}
            onAreaSelect={selectAreaCorner}
            onLocationSelect={onSelectLocation}
            onHoverPositionChange={updateGridHoverPosition} />}
        {showGridHoverCrosshairs && activeGridHoverPosition &&
          <GridHoverCrosshairs
            config={config}
            getZ={getZ}
            position={activeGridHoverPosition} />}
        <GardenAreaSelectionOverlay
          config={config}
          getZ={getZ}
          ghostPosition={activeGridHoverPosition}
          selection={areaSelection}
          shiftPressed={shiftPressed}
          selectedCount={areaSelectedUuids.length}
          onBoxChange={updateAreaSelectionBox}
          onClose={closeAreaSelection}
          onCreateGroup={createAreaSelectionGroup}
          onDelete={deleteAreaSelection}
          onOpenPanel={openAreaSelectionPanel}
          onPointTypeChange={updateAreaSelectionPointType} />
        <OptionalFarmbotLayer
          activeFocus={props.activeFocus}
          axisActions={!objectSelectionMode && dispatch &&
            props.firmwareSettings
            ? {
              arduinoBusy: !!props.arduinoBusy,
              botPosition: props.bot?.hardware.location_data.position ||
                props.currentBotLocation || {
                x: undefined,
                y: undefined,
                z: undefined,
              },
              botOnline: !!props.botOnline,
              dispatch,
              firmwareSettings: props.firmwareSettings,
              locked: !!props.bot?.hardware.informational_settings.locked,
              stepSize: props.bot?.stepSize,
            }
            : undefined}
          config={config}
          configPosition={props.configPosition}
          detailsReveal={detailsReveal}
          dispatch={objectSelectionMode ? undefined : dispatch}
          encoderData={props.bot?.hardware.location_data}
          encoderVisibility={props.encoderVisibility}
          getZ={getZ}
          loadProgress={loadProgress}
          markStep={markLoadStep}
          mountedToolName={props.mountedToolName}
          positionStore={botPositionStore}
          reveal={farmbotReveal}
          showLoadProgress={props.showFarmbotLayerLoadProgress !== false}
          toolSlots={props.toolSlots}
          onSelectObject={slotsSelectable && !areaSelectionDrawing
            ? onSelectObject
            : undefined}
          onHoverObject={objectSelectionMode || areaSelectionDrawing
            ? undefined
            : setSelectableObjectHover}
          onToolSlotHoverObject={objectSelectionMode
            && slotsSelectable
            && !areaSelectionDrawing
            ? setSelectableObjectHover
            : undefined}
          onHoverLabel={config.labelsOnHover
            && slotsSelectable
            && !areaSelectionDrawing
            ? setObjectHoverLabel
            : undefined}
          visible={farmbotVisible} />
        <ThreeDObjectSelectionLayer
          config={config}
          configPosition={props.configPosition}
          selection={visualSelection}
          panelSelection={panelVisualSelection}
          panelCameraStore={props.panelCameraStore}
          selectedObjects={selectedObjectSelections}
          selectedObjectsAlwaysVisible={
            !!areaSelection && areaSelection.phase != "firstCorner"}
          popupSelection={activePopupSelection}
          locationSelection={activeLocationSelection}
          selectedLocation={selectedLocation}
          onClosePopup={closePopup}
          onCopySceneObject={copySelectedSceneObject}
          onOpenPanel={openSelectedObjectPanel}
          onOpenLocationPanel={openSelectedLocationPanel}
          onUpdateLocationSelection={updateLocationSelection}
          plants={plants}
          points={mapPoints}
          sceneObjects={props.sceneObjects || []}
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
          currentBotLocation={currentBotLocation}
          movementState={props.movementState || EMPTY_MOVEMENT_STATE}
          defaultAxes={props.defaultAxes || "XY"}
          noUTM={!!props.noUTM}
          deviceAccount={props.deviceAccount}
          bot={props.bot}
          env={props.env || EMPTY_ENV}
          cameraFollow={cameraFollow}
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
          {config.cameraSelectionView && !cameraFollow &&
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
                isPromo={props.promo}
                visible={showSceneObjects}
                dispatch={dispatch}
                designer={addPlantProps?.designer}
                hoverSelection={hoverSelection}
                onSelectObject={onSelectObject}
                sceneObjects={props.sceneObjects} />
            </Group>
          </PopInGroup>
        </SceneBoundary>
      </Group>
    </FocusTransitionProvider>
  </ControlCursorProvider>;
};

const gardenModelScenePropsEqual = (
  prev: GardenModelSceneProps,
  next: GardenModelSceneProps,
) => {
  const prevKeys = Object.keys(prev) as (keyof GardenModelSceneProps)[];
  const nextKeys = Object.keys(next) as (keyof GardenModelSceneProps)[];
  return prevKeys.length == nextKeys.length
    && prevKeys.every(key => {
      if (key == "route") {
        return prev.route.key == next.route.key;
      }
      if (key == "viewport") {
        return prev.viewport.width == next.viewport.width
          && prev.viewport.height == next.viewport.height;
      }
      return prev[key] === next[key];
    });
};

const MemoizedGardenModelScene = React.memo(
  GardenModelSceneBase,
  gardenModelScenePropsEqual,
);

MemoizedGardenModelScene.displayName = "MemoizedGardenModelScene";

export const GardenModel = (props: GardenModelProps) => {
  const routeLocation = useLocation();
  const navigate = useNavigate();
  const viewportWidth = useThree(selectGardenViewportWidth);
  const viewportHeight = useThree(selectGardenViewportHeight);
  const viewport = React.useMemo<GardenViewportSnapshot>(() => ({
    width: viewportWidth,
    height: viewportHeight,
  }), [viewportHeight, viewportWidth]);
  React.useEffect(() => {
    perfCount("change.GardenModelAdapter.route");
  }, [routeLocation.pathname, routeLocation.search]);
  React.useEffect(() => {
    perfCount("change.GardenModelAdapter.viewport");
  }, [viewportHeight, viewportWidth]);
  const navigateRef = React.useRef(navigate);
  React.useLayoutEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);
  const stableNavigate = React.useCallback(
    (path: string) => {
      void navigateRef.current(path);
    },
    [],
  );
  const route = createGardenRouteSnapshot(
    routeLocation.pathname,
    routeLocation.search,
  );
  return <MemoizedGardenModelScene
    {...props}
    route={route}
    viewport={viewport}
    navigate={stableNavigate} />;
};
