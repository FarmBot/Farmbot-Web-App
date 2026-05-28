import React from "react";
import { ThreeEvent } from "@react-three/fiber";
import {
  GizmoHelper, GizmoViewcube,
  OrbitControls, PerspectiveCamera,
  Stats, OrthographicCamera,
  Sphere,
  StatsGl,
} from "@react-three/drei";
import {
  BackSide,
  MeshBasicMaterial as ThreeMeshBasicMaterial,
  OrthographicCamera as ThreeOrthographicCamera,
  PerspectiveCamera as ThreePerspectiveCamera,
} from "three";
import { AddPlantProps, Bed } from "./bed";
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
} from "./garden";
import { Config, PositionConfig } from "./config";
import { useSpring, animated } from "@react-spring/three";
import { Lab, Greenhouse } from "./scenes";
import { getCamera } from "./zoom_beacons_constants";
import {
  AmbientLight, AxesHelper, Group, MeshBasicMaterial,
} from "./components";
import { isUndefined } from "lodash";
import {
  TaggedGenericPointer, TaggedImage, TaggedPoint, TaggedPointGroup,
  TaggedSensor,
  TaggedSensorReading,
  TaggedWeedPointer,
} from "farmbot";
import { BooleanSetting } from "../session_keys";
import { SlotWithTool } from "../resources/interfaces";
import { cameraInit } from "./camera";
import { filterSoilPoints, getSurface } from "./triangles";
import { BigDistance } from "./constants";
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
  ThreeDLoadProgress, ThreeDLoadProgressOverlay, ThreeDLoadStepId,
  useThreeDLoadProgress,
} from "./progressive_load";
import {
  FocusTransitionProvider, FocusVisibilityGroup, SmoothCameraControls,
  useSmoothCamera,
} from "./focus_transition";
import { getMode } from "../farm_designer/map/util";
import { Mode } from "../farm_designer/map/interfaces";
import { Path } from "../internal_urls";

const AnimatedGroup = animated(Group);
const LazyBot = React.lazy(() =>
  import("./bot").then(module => ({ default: module.Bot })));
const LazyVisualization = React.lazy(() =>
  import("./visualization").then(module => ({
    default: module.Visualization,
  })));
export const SMOOTH_XL_CAMERA_BED_SCALE = 1.9;
export const SMOOTH_XL_CAMERA_HEIGHT_SCALE = 1.45;

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
    onRest: () => reveal && onRest?.(),
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
  loadStep?: ThreeDLoadStepId;
  reveal?: boolean;
  markReadyOnMount?: boolean;
  children: React.ReactNode;
}

const SceneBoundary = (props: SceneBoundaryProps) => {
  const reveal = props.reveal !== false;
  const markReadyOnMount = props.markReadyOnMount !== false;
  return <React.Suspense fallback={undefined}>
    <Group name={props.loadStep && `${props.loadStep}-scene-boundary`}
      visible={reveal}>
      {props.children}
    </Group>
    {reveal && markReadyOnMount && props.loadStep && props.loadProgress &&
      <LoadStepReady
        step={props.loadStep}
        markStep={props.loadProgress.markStep} />}
    {reveal && props.markName && <PerfMark name={props.markName} />}
  </React.Suspense>;
};

export interface GardenModelProps {
  config: Config;
  configPosition: PositionConfig;
  activeFocus: string;
  setActiveFocus(focus: string): void;
  threeDPlants: ThreeDGardenPlant[];
  addPlantProps?: AddPlantProps;
  mapPoints?: TaggedGenericPointer[];
  weeds?: TaggedWeedPointer[];
  toolSlots?: SlotWithTool[];
  mountedToolName?: string | undefined;
  startTimeRef?: React.RefObject<number>;
  allPoints?: TaggedPoint[];
  groups?: TaggedPointGroup[];
  images?: TaggedImage[];
  sensorReadings?: TaggedSensorReading[];
  sensors?: TaggedSensor[];
  smoothFocusTransitions?: boolean;
  plantIconCapacities?: Record<string, number>;
  plantInstanceCapacity?: number;
  onDetailsRevealStart?(): void;
  onLoadComplete?(): void;
}

const EMPTY_GENERIC_POINTERS: TaggedGenericPointer[] = [];
const EMPTY_WEEDS: TaggedWeedPointer[] = [];
const EMPTY_POINTS: TaggedPoint[] = [];
const EMPTY_POINT_GROUPS: TaggedPointGroup[] = [];
const EMPTY_IMAGES: TaggedImage[] = [];
const EMPTY_SENSORS: TaggedSensor[] = [];
const EMPTY_SENSOR_READINGS: TaggedSensorReading[] = [];

interface GardenLayerVisibility {
  showPlants: boolean;
  plantsVisible: boolean;
  farmbotVisible: boolean;
  showPoints: boolean;
  showWeeds: boolean;
  showSpread: boolean;
  shouldMountPlantSpreadInstances: boolean;
  showMoistureMap: boolean;
  showMoistureReadings: boolean;
  topDownAtStart: boolean;
}

interface GardenLayerVisibilityParams {
  addPlantProps: AddPlantProps | undefined;
  activeFocus: string;
  botVisibleInConfig: boolean;
  showSoilPoints: boolean;
  spreadHasTransientPlant: boolean;
  routeKey: string;
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
  const showWeeds = !!getConfigValue?.(BooleanSetting.show_weeds);
  const showSpread = !!getConfigValue?.(BooleanSetting.show_spread);
  const showMoistureMap = !!getConfigValue?.(
    BooleanSetting.show_moisture_interpolation_map);
  const showMoistureReadings = !!getConfigValue?.(
    BooleanSetting.show_sensor_readings);
  const topDownAtStart = !!getConfigValue?.(
    BooleanSetting.top_down_view);
  const shouldMountPlantSpreadInstances = showSpread
    || getMode() == Mode.clickToAdd
    || (Path.getSlug(Path.designer()) == "plants" && Path.lastChunkIsNum())
    || params.spreadHasTransientPlant;
  return {
    showPlants,
    plantsVisible,
    farmbotVisible,
    showPoints,
    showWeeds,
    showSpread,
    shouldMountPlantSpreadInstances,
    showMoistureMap,
    showMoistureReadings,
    topDownAtStart,
  };
}

interface StaticGardenLayersProps {
  config: Config;
  loadProgress: ThreeDLoadProgress;
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
  plantInstancesVisible: boolean;
  setHover(active: boolean):
    ((e: ThreeEvent<PointerEvent>) => void) | undefined;
  threeDPlants: ThreeDGardenPlant[];
  plantIconCapacities: Record<string, number> | undefined;
  startTimeRef: React.RefObject<number> | undefined;
  dispatch: Function | undefined;
  shouldMountPlantSpreadInstances: boolean;
  showSpread: boolean;
  plantInstanceCapacity: number | undefined;
  showWeeds: boolean;
  weeds: TaggedWeedPointer[];
  showPoints: boolean;
}

const StaticGardenLayersBase = (props: StaticGardenLayersProps) => {
  const {
    config, loadProgress, environmentReveal, bedReveal, gridReveal,
    plantsReveal, weedsReveal, pointsReveal, skyRef, activePositionRef,
    soilSurfaceGeometry, getZ, images, activeFocus, mapPoints,
    showMoistureMap, showMoistureReadings, sensors, sensorReadings,
    addPlantProps, plantLabelNodes, plantsVisible, plantInstancesVisible,
    setHover, threeDPlants, plantIconCapacities, startTimeRef, dispatch,
    shouldMountPlantSpreadInstances, showSpread, plantInstanceCapacity,
    showWeeds, weeds, showPoints,
  } = props;
  const gridVisible = config.grid && activeFocus != "Planter bed";
  const plantLayerHasWork =
    threeDPlants.length > 0
    || React.Children.count(plantLabelNodes) > 0;
  const weedLayerHasWork = showWeeds && weeds.length > 0;
  const pointLayerHasWork = showPoints && mapPoints.length > 0;

  return <>
    <SceneBoundary
      loadStep={"environment"}
      loadProgress={loadProgress}
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
      <Ground config={config} />
    </SceneBoundary>
    <SceneBoundary
      loadStep={"bed"}
      loadProgress={loadProgress}
      reveal={bedReveal}
      markReadyOnMount={false}
      markName={"three_d_bed_ready"}>
      {config.north && <NorthArrow config={config} />}
      <PopInGroup
        name={"bed-load-in"}
        reveal={bedReveal}
        onRest={() => loadProgress.markStep("bed")}
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
      loadProgress={loadProgress}
      reveal={gridReveal}
      markReadyOnMount={!gridVisible}
      markName={"three_d_grid_ready"}>
      {gridVisible &&
      <GridRevealGroup
        name={"grid-load-in"}
        reveal={gridReveal}
        onRest={() => loadProgress.markStep("grid")}>
        <Grid
          config={config}
          getZ={getZ}
          activeFocus={activeFocus} />
      </GridRevealGroup>}
    </SceneBoundary>
    <SceneBoundary
      loadStep={"plants"}
      loadProgress={loadProgress}
      reveal={plantsReveal}
      markReadyOnMount={!plantLayerHasWork}
      markName={"three_d_core_ready"}>
      {plantLayerHasWork &&
      <PopInGroup
        name={"plants-load-in"}
        reveal={plantsReveal}
        onRest={() => loadProgress.markStep("plants")}
        distance={200}>
        <FocusVisibilityGroup
          name={"plant-labels"}
          visible={!activeFocus && plantsVisible}>
          {plantLabelNodes}
        </FocusVisibilityGroup>
        <FocusVisibilityGroup name={"plants"}
          visible={plantsVisible}
          keepMounted={true}
          onPointerEnter={setHover(true)}
          onPointerMove={setHover(true)}
          onPointerLeave={setHover(false)}>
          <PlantInstances
            plants={threeDPlants}
            config={config}
            getZ={getZ}
            visible={plantInstancesVisible}
            iconCapacities={plantIconCapacities}
            startTimeRef={startTimeRef}
            dispatch={dispatch} />
          {shouldMountPlantSpreadInstances &&
          <PlantSpreadInstances
            plants={threeDPlants}
            visible={plantInstancesVisible}
            spreadVisible={showSpread}
            config={config}
            instanceCapacity={plantInstanceCapacity}
            activePositionRef={activePositionRef}
            getZ={getZ}
            dispatch={dispatch} />}
        </FocusVisibilityGroup>
      </PopInGroup>}
    </SceneBoundary>
    <SceneBoundary
      loadStep={"weeds"}
      loadProgress={loadProgress}
      reveal={weedsReveal}
      markReadyOnMount={!weedLayerHasWork}
      markName={"three_d_weeds_ready"}>
      {weedLayerHasWork &&
      <PopInGroup
        name={"weeds-load-in"}
        reveal={weedsReveal}
        onRest={() => loadProgress.markStep("weeds")}
        distance={200}>
        <Group name={"weeds"}
          visible={showWeeds}>
          <WeedInstances
            weeds={weeds}
            visible={showWeeds}
            config={config}
            getZ={getZ}
            dispatch={dispatch} />
        </Group>
      </PopInGroup>}
    </SceneBoundary>
    <SceneBoundary
      loadStep={"points"}
      loadProgress={loadProgress}
      reveal={pointsReveal}
      markReadyOnMount={!pointLayerHasWork}
      markName={"three_d_points_ready"}>
      {pointLayerHasWork &&
      <FallInGroup
        name={"points-load-in"}
        reveal={pointsReveal}
        onRest={() => loadProgress.markStep("points")}
        distance={config.columnLength + 1000}>
        <Group name={"points"}
          visible={showPoints}>
          <PointInstances
            points={mapPoints}
            visible={showPoints}
            config={config}
            getZ={getZ}
            dispatch={dispatch} />
        </Group>
      </FallInGroup>}
    </SceneBoundary>
  </>;
};

const StaticGardenLayers = React.memo(StaticGardenLayersBase);

// eslint-disable-next-line complexity
export const GardenModel = (props: GardenModelProps) => {
  usePerfRenderCount("GardenModel");
  const {
    config, addPlantProps, onDetailsRevealStart, onLoadComplete, threeDPlants,
  } = props;
  const dispatch = addPlantProps?.dispatch;
  const mapPoints = props.mapPoints || EMPTY_GENERIC_POINTERS;
  const weeds = props.weeds || EMPTY_WEEDS;
  const allPoints = props.allPoints || EMPTY_POINTS;
  const groups = props.groups || EMPTY_POINT_GROUPS;
  const images = props.images || EMPTY_IMAGES;
  const sensors = props.sensors || EMPTY_SENSORS;
  const sensorReadings = props.sensorReadings || EMPTY_SENSOR_READINGS;
  const Camera = config.perspective ? PerspectiveCamera : OrthographicCamera;

  const [hoveredPlant, setHoveredPlant] =
    React.useState<number | undefined>(undefined);

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
        e.stopPropagation();
        const nextHover = active ? getI(e) : undefined;
        setHoveredPlant(nextHover);
      }
      : undefined;
  }, [config.labelsOnHover, getI]);

  const isXL = config.sizePreset == "Genesis XL";
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
  const heading = Math.ceil(config.viewpointHeading / 90) * 90;
  const topDownCameraAngle = config.topDown
    ? baseAngle + heading * Math.PI / 180
    : undefined;
  const cameraBedScale = props.smoothFocusTransitions && isXL
    ? SMOOTH_XL_CAMERA_BED_SCALE
    : 1;
  const cameraBedSize = React.useMemo(() => ({
    x: config.bedLengthOuter * cameraBedScale,
    y: config.bedWidthOuter * cameraBedScale,
  }), [
    config.bedLengthOuter,
    config.bedWidthOuter,
    cameraBedScale,
  ]);
  const defaultCamera = React.useMemo(
    () => {
      const nextCamera = cameraInit({
        topDown: config.topDown,
        viewpointHeading: config.viewpointHeading,
        bedSize: cameraBedSize,
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
    }, [
      cameraBedSize,
      config.topDown,
      config.viewpointHeading,
      isXL,
      props.smoothFocusTransitions,
    ]);
  const camera = props.activeFocus
    ? getCamera(config, props.configPosition, props.activeFocus, defaultCamera)
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
  const detailsRevealNotified = React.useRef(false);
  const loadCompleteNotified = React.useRef(false);
  const markLoadStep = loadProgress.markStep;
  const markDetailsLoaded = React.useCallback(() => {
    markLoadStep("details");
  }, [markLoadStep]);

  React.useEffect(() => {
    perfMark("garden_model_mounted");
  }, []);

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

  const spreadHasTransientPlant = React.useMemo(() =>
    threeDPlants.some(plant => !plant.id), [threeDPlants]);
  const routeKey = `${location.pathname}?${location.search}`;
  const layerVisibility = React.useMemo(() => getGardenLayerVisibility({
    addPlantProps,
    activeFocus: props.activeFocus,
    botVisibleInConfig: config.bot,
    showSoilPoints: config.showSoilPoints,
    spreadHasTransientPlant,
    routeKey,
  }), [
    addPlantProps,
    config.bot,
    config.showSoilPoints,
    props.activeFocus,
    routeKey,
    spreadHasTransientPlant,
  ]);
  const {
    showPlants, plantsVisible, farmbotVisible, showPoints, showWeeds,
    showSpread, shouldMountPlantSpreadInstances, showMoistureMap,
    showMoistureReadings, topDownAtStart,
  } = layerVisibility;

  const soilPoints = React.useMemo(
    () => perfMeasure("soilPointFilterMs", () =>
      filterSoilPoints({ points: mapPoints, config })),
    [
      mapPoints,
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

  const sceneDetailsLoadIn =
    config.scene == "Lab" || config.scene == "Greenhouse";
  const animatedDetailsLoadIn = sceneDetailsLoadIn || config.zoomBeacons;

  const topDownZoomLevel = 0.25 * 3000 / config.bedLengthOuter;
  const targetZoom = config.topDown ? topDownZoomLevel : 1;
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

  const plantLabelNodes = React.useMemo(
    () => {
      if (!config.labels && !config.labelsOnHover) { return undefined; }
      if (config.labelsOnHover) {
        if (hoveredPlant === undefined) { return undefined; }
        const plant = threeDPlants[hoveredPlant];
        return plant &&
          <ThreeDPlantLabel key={hoveredPlant} i={hoveredPlant}
            plant={plant}
            config={config}
            getZ={getZ}
            hoveredPlant={hoveredPlant} />;
      }
      return threeDPlants.map((plant, i) =>
        <ThreeDPlantLabel key={i} i={i}
          plant={plant}
          config={config}
          getZ={getZ}
          hoveredPlant={hoveredPlant} />);
    },
    [
      threeDPlants,
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
      getZ,
      hoveredPlant,
    ]);

  const plantInstancesVisible = props.smoothFocusTransitions
    ? showPlants
    : plantsVisible;
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
      onPointerMove={config.eventDebug
        ? e => console.log(e.intersections.map(x => x.object.name))
        : undefined}>
      <FPSProbe />
      <PerfMark name={"garden_model_rendered"} />
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
        enablePan={config.pan}
        dampingFactor={0.2}
        {...orbitControlProps}
        minZoom={config.lightsDebug ? 0 : 0.05}
        maxZoom={10}
        minDistance={config.lightsDebug ? 50 : 500}
        maxDistance={config.lightsDebug ? BigDistance.devZoom : BigDistance.zoom} />}
      <ThreeDLoadProgressOverlay
        progress={loadProgress}
        complete={detailsReveal} />
      <StaticGardenLayers
        config={config}
        loadProgress={loadProgress}
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
        plantInstancesVisible={plantInstancesVisible}
        setHover={setHover}
        threeDPlants={threeDPlants}
        plantIconCapacities={props.plantIconCapacities}
        startTimeRef={props.startTimeRef}
        dispatch={dispatch}
        shouldMountPlantSpreadInstances={shouldMountPlantSpreadInstances}
        showSpread={showSpread}
        plantInstanceCapacity={props.plantInstanceCapacity}
        showWeeds={showWeeds}
        weeds={weeds}
        showPoints={showPoints} />
      <SceneBoundary
        loadStep={"farmbot"}
        loadProgress={loadProgress}
        reveal={farmbotReveal}
        markReadyOnMount={!farmbotVisible}
        markName={"three_d_bot_ready"}>
        {farmbotVisible &&
        <FallInGroup
          name={"bot-load-in"}
          reveal={farmbotReveal}
          onRest={() => loadProgress.markStep("farmbot")}
          config={botLoadInConfig}
          distance={config.columnLength + 1500}
          fadeIn={true}
          preserveDepthWrite={true}>
          <LazyBot
            dispatch={dispatch}
            config={config}
            configPosition={props.configPosition}
            getZ={getZ}
            trailReady={detailsReveal}
            activeFocus={props.activeFocus}
            mountedToolName={props.mountedToolName}
            toolSlots={props.toolSlots} />
        </FallInGroup>}
      </SceneBoundary>
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
        <Clouds config={config} />
        {showMoistureMap && props.config.moistureDebug &&
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
          reveal={detailsReveal}
          onDetailsLoadInRest={markDetailsLoaded} />}
        {config.cameraSelectionView &&
        <CameraSelectionUI
          config={config}
          dispatch={dispatch}
          topDownAtStart={topDownAtStart} />}
        {detailsReveal && !animatedDetailsLoadIn &&
        <LoadStepReady
          step={"details"}
          markStep={loadProgress.markStep} />}
      </SceneBoundary>
    </Group>
  </FocusTransitionProvider>;
};
