import React from "react";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import {
  GizmoHelper, GizmoViewcube,
  OrbitControls, PerspectiveCamera,
  Stats, Image, OrthographicCamera,
  Sphere,
} from "@react-three/drei";
import { BackSide, MeshBasicMaterial as ThreeMeshBasicMaterial } from "three";
import { Bot } from "./bot";
import { AddPlantProps, Bed } from "./bed";
import {
  Sky, Solar, Sun, sunPosition, ZoomBeacons,
  ThreeDPlant, PlantImageInstances,
  Point, Grid, Clouds, Ground, Weed,
  WeedSphereInstances,
  PointMarkerInstances,
  ThreeDGardenPlant,
  NorthArrow,
  skyColor,
} from "./garden";
import { Config } from "./config";
import { useSpring, animated } from "@react-spring/three";
import { Lab, Greenhouse } from "./scenes";
import { getCamera } from "./zoom_beacons_constants";
import {
  AmbientLight, AxesHelper, Group, MeshBasicMaterial,
} from "./components";
import { ICON_URLS } from "../crops/constants";
import {
  TaggedGenericPointer, TaggedImage, TaggedPoint, TaggedPointGroup,
  TaggedSensor,
  TaggedSensorReading,
  TaggedWeedPointer,
} from "farmbot";
import { BooleanSetting } from "../session_keys";
import { SlotWithTool } from "../resources/interfaces";
import { cameraInit } from "./camera";
import { isMobile } from "../screen_size";
import { filterSoilPointsWithMeta, getSurface } from "./triangles";
import { BigDistance, HOVER_OBJECT_MODES } from "./constants";
import { getZFunc } from "./triangle_functions";
import { Visualization } from "./visualization";
import { GroupOrderVisual } from "./group_order_visual";
import { MoistureReadings } from "./garden/moisture_texture";
import { shouldEnableProfiler } from "../util/performance_profiler_settings";
import { ThreeDPerformanceMonitor } from "./performance_monitor";
import { useStableArray } from "./use_stable_array";
import { getMode } from "../farm_designer/map/util";
import { useLocation } from "react-router";
import { FPSProbe } from "./fps_probe";

const AnimatedGroup = animated(Group);

export interface GardenModelProps {
  config: Config;
  shouldAnimate?: boolean;
  activeFocus: string;
  setActiveFocus(focus: string): void;
  threeDPlants: ThreeDGardenPlant[];
  showSpread?: boolean;
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
}

// eslint-disable-next-line complexity
export const GardenModel = (props: GardenModelProps) => {
  const location = useLocation();
  const { config, addPlantProps, threeDPlants } = props;
  const dispatch = addPlantProps?.dispatch;
  const Camera = config.perspective ? PerspectiveCamera : OrthographicCamera;
  const profilerEnabled = shouldEnableProfiler();
  const { invalidate } = useThree();
  const shouldAnimate = props.shouldAnimate ?? false;
  const animateRef = React.useRef(shouldAnimate);
  React.useEffect(() => {
    animateRef.current = shouldAnimate;
    if (shouldAnimate) {
      invalidate();
    }
  }, [invalidate, shouldAnimate]);
  useFrame(() => {
    if (animateRef.current) {
      invalidate();
    }
  });
  const stableThreeDPlants = useStableArray(threeDPlants) || [];
  const stableMapPoints = useStableArray(props.mapPoints) || [];
  const stableWeeds = useStableArray(props.weeds) || [];
  const stableToolSlots = useStableArray(props.toolSlots);
  const stableAllPoints = useStableArray(props.allPoints) || [];
  const stableGroups = useStableArray(props.groups) || [];
  const stableImages = useStableArray(props.images);
  const stableSensorReadings = useStableArray(props.sensorReadings) || [];
  const stableSensors = useStableArray(props.sensors) || [];
  const bedConfig = React.useMemo(() => ({
    axes: config.axes,
    bedBrightness: config.bedBrightness,
    bedHeight: config.bedHeight,
    bedLengthOuter: config.bedLengthOuter,
    bedWallThickness: config.bedWallThickness,
    bedWidthOuter: config.bedWidthOuter,
    bedXOffset: config.bedXOffset,
    bedYOffset: config.bedYOffset,
    bedZOffset: config.bedZOffset,
    botSizeX: config.botSizeX,
    botSizeY: config.botSizeY,
    botSizeZ: config.botSizeZ,
    ccSupportSize: config.ccSupportSize,
    columnLength: config.columnLength,
    distanceIndicator: config.distanceIndicator,
    extraLegsX: config.extraLegsX,
    extraLegsY: config.extraLegsY,
    imgCalZ: config.imgCalZ,
    imgCenterX: config.imgCenterX,
    imgCenterY: config.imgCenterY,
    imgOffsetX: config.imgOffsetX,
    imgOffsetY: config.imgOffsetY,
    imgOrigin: config.imgOrigin,
    imgRotation: config.imgRotation,
    imgScale: config.imgScale,
    interpolationPower: config.interpolationPower,
    interpolationStepSize: config.interpolationStepSize,
    interpolationUseNearest: config.interpolationUseNearest,
    kitVersion: config.kitVersion,
    label: config.label,
    legSize: config.legSize,
    legsFlush: config.legsFlush,
    lightsDebug: config.lightsDebug,
    lowDetail: config.lowDetail,
    moistureDebug: config.moistureDebug,
    packaging: config.packaging,
    sizePreset: config.sizePreset,
    soilBrightness: config.soilBrightness,
    surfaceDebug: config.surfaceDebug,
    utilitiesPost: config.utilitiesPost,
    xyDimensions: config.xyDimensions,
    zGantryOffset: config.zGantryOffset,
  }) as Config, [
    config.axes,
    config.bedBrightness,
    config.bedHeight,
    config.bedLengthOuter,
    config.bedWallThickness,
    config.bedWidthOuter,
    config.bedXOffset,
    config.bedYOffset,
    config.bedZOffset,
    config.botSizeX,
    config.botSizeY,
    config.botSizeZ,
    config.ccSupportSize,
    config.columnLength,
    config.distanceIndicator,
    config.extraLegsX,
    config.extraLegsY,
    config.imgCalZ,
    config.imgCenterX,
    config.imgCenterY,
    config.imgOffsetX,
    config.imgOffsetY,
    config.imgOrigin,
    config.imgRotation,
    config.imgScale,
    config.interpolationPower,
    config.interpolationStepSize,
    config.interpolationUseNearest,
    config.kitVersion,
    config.label,
    config.legSize,
    config.legsFlush,
    config.lightsDebug,
    config.lowDetail,
    config.moistureDebug,
    config.packaging,
    config.sizePreset,
    config.soilBrightness,
    config.surfaceDebug,
    config.utilitiesPost,
    config.xyDimensions,
    config.zGantryOffset,
  ]);
  const cloudsConfig = React.useMemo(() => ({
    clouds: config.clouds,
    plants: config.plants,
  }) as Config, [
    config.clouds,
    config.plants,
  ]);
  const gridConfig = React.useMemo(() => ({
    bedLengthOuter: config.bedLengthOuter,
    bedWidthOuter: config.bedWidthOuter,
    bedXOffset: config.bedXOffset,
    bedYOffset: config.bedYOffset,
    botSizeX: config.botSizeX,
    botSizeY: config.botSizeY,
    botSizeZ: config.botSizeZ,
    columnLength: config.columnLength,
    grid: config.grid,
    zGantryOffset: config.zGantryOffset,
  }) as Config, [
    config.bedLengthOuter,
    config.bedWidthOuter,
    config.bedXOffset,
    config.bedYOffset,
    config.botSizeX,
    config.botSizeY,
    config.botSizeZ,
    config.columnLength,
    config.grid,
    config.zGantryOffset,
  ]);
  const groundConfig = React.useMemo(() => ({
    bedHeight: config.bedHeight,
    bedZOffset: config.bedZOffset,
    ground: config.ground,
    lowDetail: config.lowDetail,
    scene: config.scene,
  }) as Config, [
    config.bedHeight,
    config.bedZOffset,
    config.ground,
    config.lowDetail,
    config.scene,
  ]);
  const northArrowConfig = React.useMemo(() => ({
    bedHeight: config.bedHeight,
    bedLengthOuter: config.bedLengthOuter,
    bedWidthOuter: config.bedWidthOuter,
    bedZOffset: config.bedZOffset,
    heading: config.heading,
    north: config.north,
  }) as Config, [
    config.bedHeight,
    config.bedLengthOuter,
    config.bedWidthOuter,
    config.bedZOffset,
    config.heading,
    config.north,
  ]);
  const plantConfig = React.useMemo(() => ({
    animateSeasons: config.animateSeasons,
    bedLengthOuter: config.bedLengthOuter,
    bedWallThickness: config.bedWallThickness,
    bedWidthOuter: config.bedWidthOuter,
    bedXOffset: config.bedXOffset,
    bedYOffset: config.bedYOffset,
    columnLength: config.columnLength,
    labels: config.labels,
    labelsOnHover: config.labelsOnHover,
    plants: config.plants,
    zGantryOffset: config.zGantryOffset,
  }) as Config, [
    config.animateSeasons,
    config.bedLengthOuter,
    config.bedWallThickness,
    config.bedWidthOuter,
    config.bedXOffset,
    config.bedYOffset,
    config.columnLength,
    config.labels,
    config.labelsOnHover,
    config.plants,
    config.zGantryOffset,
  ]);
  const pointConfig = React.useMemo(() => ({
    bedLengthOuter: config.bedLengthOuter,
    bedWidthOuter: config.bedWidthOuter,
    bedXOffset: config.bedXOffset,
    bedYOffset: config.bedYOffset,
    columnLength: config.columnLength,
    labels: config.labels,
    labelsOnHover: config.labelsOnHover,
    zGantryOffset: config.zGantryOffset,
  }) as Config, [
    config.bedLengthOuter,
    config.bedWidthOuter,
    config.bedXOffset,
    config.bedYOffset,
    config.columnLength,
    config.labels,
    config.labelsOnHover,
    config.zGantryOffset,
  ]);
  const groupOrderConfig = React.useMemo(() => ({
    bedLengthOuter: config.bedLengthOuter,
    bedWidthOuter: config.bedWidthOuter,
    bedXOffset: config.bedXOffset,
    bedYOffset: config.bedYOffset,
    columnLength: config.columnLength,
    exaggeratedZ: config.exaggeratedZ,
    zGantryOffset: config.zGantryOffset,
  }) as Config, [
    config.bedLengthOuter,
    config.bedWidthOuter,
    config.bedXOffset,
    config.bedYOffset,
    config.columnLength,
    config.exaggeratedZ,
    config.zGantryOffset,
  ]);
  const sceneConfig = React.useMemo(() => ({
    bedHeight: config.bedHeight,
    bedLengthOuter: config.bedLengthOuter,
    bedWidthOuter: config.bedWidthOuter,
    bedZOffset: config.bedZOffset,
    desk: config.desk,
    people: config.people,
    scene: config.scene,
  }) as Config, [
    config.bedHeight,
    config.bedLengthOuter,
    config.bedWidthOuter,
    config.bedZOffset,
    config.desk,
    config.people,
    config.scene,
  ]);
  const solarConfig = React.useMemo(() => ({
    bedHeight: config.bedHeight,
    bedLengthOuter: config.bedLengthOuter,
    bedWidthOuter: config.bedWidthOuter,
    bedZOffset: config.bedZOffset,
    legSize: config.legSize,
    solar: config.solar,
  }) as Config, [
    config.bedHeight,
    config.bedLengthOuter,
    config.bedWidthOuter,
    config.bedZOffset,
    config.legSize,
    config.solar,
  ]);
  const sunConfig = React.useMemo(() => ({
    animateSeasons: config.animateSeasons,
    bedLengthOuter: config.bedLengthOuter,
    bedWidthOuter: config.bedWidthOuter,
    bedXOffset: config.bedXOffset,
    bedYOffset: config.bedYOffset,
    botSizeX: config.botSizeX,
    botSizeY: config.botSizeY,
    columnLength: config.columnLength,
    heading: config.heading,
    lightsDebug: config.lightsDebug,
    plants: config.plants,
    sun: config.sun,
    sunAzimuth: config.sunAzimuth,
    sunInclination: config.sunInclination,
    zGantryOffset: config.zGantryOffset,
  }) as Config, [
    config.animateSeasons,
    config.bedLengthOuter,
    config.bedWidthOuter,
    config.bedXOffset,
    config.bedYOffset,
    config.botSizeX,
    config.botSizeY,
    config.columnLength,
    config.heading,
    config.lightsDebug,
    config.plants,
    config.sun,
    config.sunAzimuth,
    config.sunInclination,
    config.zGantryOffset,
  ]);
  const botConfig = React.useMemo(() => ({
    beamLength: config.beamLength,
    bedHeight: config.bedHeight,
    bedLengthOuter: config.bedLengthOuter,
    bedWallThickness: config.bedWallThickness,
    bedWidthOuter: config.bedWidthOuter,
    bedXOffset: config.bedXOffset,
    bedYOffset: config.bedYOffset,
    bedZOffset: config.bedZOffset,
    bot: config.bot,
    botSizeX: config.botSizeX,
    botSizeY: config.botSizeY,
    botSizeZ: config.botSizeZ,
    bounds: config.bounds,
    cableCarriers: config.cableCarriers,
    cableDebug: config.cableDebug,
    cameraView: config.cameraView,
    ccSupportSize: config.ccSupportSize,
    columnLength: config.columnLength,
    distanceIndicator: config.distanceIndicator,
    imgCenterX: config.imgCenterX,
    imgCenterY: config.imgCenterY,
    imgOffsetX: config.imgOffsetX,
    imgOffsetY: config.imgOffsetY,
    imgOrigin: config.imgOrigin,
    imgRotation: config.imgRotation,
    imgScale: config.imgScale,
    kitVersion: config.kitVersion,
    laser: config.laser,
    legSize: config.legSize,
    light: config.light,
    lightsDebug: config.lightsDebug,
    negativeZ: config.negativeZ,
    perspective: config.perspective,
    rotary: config.rotary,
    sizePreset: config.sizePreset,
    tool: config.tool,
    tracks: config.tracks,
    trail: config.trail,
    vacuum: config.vacuum,
    waterFlow: config.waterFlow,
    x: config.x,
    y: config.y,
    z: config.z,
    zAxisLength: config.zAxisLength,
    zDimension: config.zDimension,
    zGantryOffset: config.zGantryOffset,
  }) as Config, [
    config.beamLength,
    config.bedHeight,
    config.bedLengthOuter,
    config.bedWallThickness,
    config.bedWidthOuter,
    config.bedXOffset,
    config.bedYOffset,
    config.bedZOffset,
    config.bot,
    config.botSizeX,
    config.botSizeY,
    config.botSizeZ,
    config.bounds,
    config.cableCarriers,
    config.cableDebug,
    config.cameraView,
    config.ccSupportSize,
    config.columnLength,
    config.distanceIndicator,
    config.imgCenterX,
    config.imgCenterY,
    config.imgOffsetX,
    config.imgOffsetY,
    config.imgOrigin,
    config.imgRotation,
    config.imgScale,
    config.kitVersion,
    config.laser,
    config.legSize,
    config.light,
    config.lightsDebug,
    config.negativeZ,
    config.perspective,
    config.rotary,
    config.sizePreset,
    config.tool,
    config.tracks,
    config.trail,
    config.vacuum,
    config.waterFlow,
    config.x,
    config.y,
    config.z,
    config.zAxisLength,
    config.zDimension,
    config.zGantryOffset,
  ]);
  const visualizationConfig = React.useMemo(() => ({
    bedLengthOuter: config.bedLengthOuter,
    bedWidthOuter: config.bedWidthOuter,
    bedXOffset: config.bedXOffset,
    bedYOffset: config.bedYOffset,
    columnLength: config.columnLength,
    x: config.x,
    y: config.y,
    z: config.z,
    zGantryOffset: config.zGantryOffset,
  }) as Config, [
    config.bedLengthOuter,
    config.bedWidthOuter,
    config.bedXOffset,
    config.bedYOffset,
    config.columnLength,
    config.x,
    config.y,
    config.z,
    config.zGantryOffset,
  ]);
  const weedConfig = React.useMemo(() => ({
    bedLengthOuter: config.bedLengthOuter,
    bedWidthOuter: config.bedWidthOuter,
    bedXOffset: config.bedXOffset,
    bedYOffset: config.bedYOffset,
    columnLength: config.columnLength,
    labels: config.labels,
    labelsOnHover: config.labelsOnHover,
    zGantryOffset: config.zGantryOffset,
  }) as Config, [
    config.bedLengthOuter,
    config.bedWidthOuter,
    config.bedXOffset,
    config.bedYOffset,
    config.columnLength,
    config.labels,
    config.labelsOnHover,
    config.zGantryOffset,
  ]);
  const zoomConfig = React.useMemo(() => ({
    animate: config.animate,
    bedHeight: config.bedHeight,
    bedLengthOuter: config.bedLengthOuter,
    bedWidthOuter: config.bedWidthOuter,
    bedXOffset: config.bedXOffset,
    bedYOffset: config.bedYOffset,
    bedZOffset: config.bedZOffset,
    columnLength: config.columnLength,
    legSize: config.legSize,
    negativeZ: config.negativeZ,
    sizePreset: config.sizePreset,
    x: config.x,
    y: config.y,
    z: config.z,
    zGantryOffset: config.zGantryOffset,
    zoomBeaconDebug: config.zoomBeaconDebug,
  }) as Config, [
    config.animate,
    config.bedHeight,
    config.bedLengthOuter,
    config.bedWidthOuter,
    config.bedXOffset,
    config.bedYOffset,
    config.bedZOffset,
    config.columnLength,
    config.legSize,
    config.negativeZ,
    config.sizePreset,
    config.x,
    config.y,
    config.z,
    config.zGantryOffset,
    config.zoomBeaconDebug,
  ]);
  const moistureReadingsConfig = React.useMemo(() => ({
    bedLengthOuter: config.bedLengthOuter,
    bedWidthOuter: config.bedWidthOuter,
    bedXOffset: config.bedXOffset,
    bedYOffset: config.bedYOffset,
    columnLength: config.columnLength,
    zGantryOffset: config.zGantryOffset,
  }) as Config, [
    config.bedLengthOuter,
    config.bedWidthOuter,
    config.bedXOffset,
    config.bedYOffset,
    config.columnLength,
    config.zGantryOffset,
  ]);

  const [hoveredPlant, setHoveredPlant] =
    React.useState<number | undefined>(undefined);
  const hoveredPlantRef = React.useRef<number | undefined>(undefined);
  const showPlants = !addPlantProps
    || !!addPlantProps.getConfigValue(BooleanSetting.show_plants);
  const plantsVisible = props.activeFocus != "Planter bed" && showPlants;

  const getIntersectionId = React.useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (e.buttons) { return -1; }
      const intersection = e.intersections[0];
      if (!intersection) { return -1; }
      const { instanceId } = intersection;
      if (typeof instanceId === "number") {
        const data = intersection.object.userData as
          { instancePlantIndices?: number[] } | undefined;
        const mappedId = data?.instancePlantIndices?.[instanceId];
        return mappedId ?? instanceId;
      }
      return parseInt(intersection.object.name);
    },
    [],
  );
  const handlePointerEnter = React.useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!config.labelsOnHover || !plantsVisible) { return; }
      e.stopPropagation();
      const nextHover = getIntersectionId(e);
      if (hoveredPlantRef.current === nextHover) { return; }
      hoveredPlantRef.current = nextHover;
      setHoveredPlant(nextHover);
    },
    [config.labelsOnHover, getIntersectionId, plantsVisible],
  );
  const handlePointerLeave = React.useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!config.labelsOnHover || !plantsVisible) { return; }
      e.stopPropagation();
      if (hoveredPlantRef.current === undefined) { return; }
      hoveredPlantRef.current = undefined;
      setHoveredPlant(undefined);
    },
    [config.labelsOnHover, plantsVisible],
  );
  const interactionMode = React.useMemo(() => getMode(), [
    location.hash,
    location.pathname,
    location.search,
  ]);
  const hoverMode = HOVER_OBJECT_MODES.includes(interactionMode);
  const disableRaycast = hoverMode;
  const hoverHandlers = React.useMemo(() => {
    if (!config.labelsOnHover || hoverMode || !plantsVisible) {
      return {};
    }
    return {
      onPointerEnter: handlePointerEnter,
      onPointerMove: handlePointerEnter,
      onPointerLeave: handlePointerLeave,
    };
  }, [
    config.labelsOnHover,
    handlePointerEnter,
    handlePointerLeave,
    hoverMode,
    plantsVisible,
  ]);
  React.useEffect(() => {
    if (plantsVisible) { return; }
    hoveredPlantRef.current = undefined;
    setHoveredPlant(undefined);
  }, [plantsVisible]);
  const handleDebugPointerMove = React.useCallback(
    (e: ThreeEvent<PointerEvent>) =>
      console.log(e.intersections.map(x => x.object.name)),
    [],
  );

  const isXL = config.sizePreset == "Genesis XL";
  const handleSpringChange = React.useCallback(() => {
    invalidate();
  }, [invalidate]);
  const { scale } = useSpring({
    scale: isXL ? 1.75 : 1,
    config: {
      tension: 300,
      friction: 40,
    },
    onChange: handleSpringChange,
  });

  const topDown = addPlantProps?.designer.threeDTopDownView;
  const topDownMobile = topDown && isMobile();
  const cameraFallback = React.useMemo(
    () => cameraInit(!!topDown),
    [topDown],
  );
  const camera = getCamera(zoomConfig, props.activeFocus, cameraFallback);
  const handleCameraChange = React.useCallback(() => {
    invalidate?.();
  }, [invalidate]);

  const showFarmbot = !addPlantProps
    || !!addPlantProps.getConfigValue(BooleanSetting.show_farmbot);
  const showPoints = config.showSoilPoints
    || !!addPlantProps?.getConfigValue(BooleanSetting.show_points);
  const showWeeds = !!addPlantProps?.getConfigValue(BooleanSetting.show_weeds);
  const showSpread = props.showSpread ??
    !!addPlantProps?.getConfigValue(BooleanSetting.show_spread);

  const soilConfig = React.useMemo(() => ({
    bedWallThickness: config.bedWallThickness,
    bedXOffset: config.bedXOffset,
    bedYOffset: config.bedYOffset,
    bedWidthOuter: config.bedWidthOuter,
    bedLengthOuter: config.bedLengthOuter,
    exaggeratedZ: config.exaggeratedZ,
    perspective: config.perspective,
    soilHeight: config.soilHeight,
    bedHeight: config.bedHeight,
    columnLength: config.columnLength,
    zGantryOffset: config.zGantryOffset,
  } as Config), [
    config.bedWallThickness,
    config.bedXOffset,
    config.bedYOffset,
    config.bedWidthOuter,
    config.bedLengthOuter,
    config.exaggeratedZ,
    config.perspective,
    config.soilHeight,
    config.bedHeight,
    config.columnLength,
    config.zGantryOffset,
  ]);
  const soilPointsResult = React.useMemo(() =>
    filterSoilPointsWithMeta({
      points: stableMapPoints,
      config: soilConfig,
    }), [stableMapPoints, soilConfig]);
  const soilSurface = React.useMemo(() =>
    getSurface(soilPointsResult.points), [soilPointsResult.key]);
  const soilTrianglesJson = React.useMemo(
    () => JSON.stringify(soilSurface.triangles),
    [soilSurface.triangles],
  );
  React.useEffect(() => {
    sessionStorage.setItem("soilSurfaceTriangles",
      soilTrianglesJson);
  }, [soilTrianglesJson]);
  const getZ = React.useMemo(
    () => getZFunc(soilSurface.triangles, -config.soilHeight),
    [soilSurface.triangles, config.soilHeight],
  );

  const showMoistureMap = !!props.addPlantProps?.getConfigValue(
    BooleanSetting.show_moisture_interpolation_map);
  const showMoistureReadings = !!props.addPlantProps?.getConfigValue(
    BooleanSetting.show_sensor_readings);

  // eslint-disable-next-line no-null/no-null
  const skyRef = React.useRef<ThreeMeshBasicMaterial>(null);
  const sunFactorRef = React.useRef<number>(1);
  // eslint-disable-next-line no-null/no-null
  const activePositionRef = React.useRef<{ x: number, y: number }>(null);
  const skyMaterialColor = React.useMemo(
    () => skyColor(sunConfig.sun),
    [sunConfig.sun],
  );
  const skySunPosition = React.useMemo(
    () => sunPosition(0, 0, 0),
    [],
  );
  const iconPreloads = React.useMemo(() =>
    ICON_URLS.map((url, i) => <Image key={i} url={url} />),
    []);
  const showAllLabels = plantsVisible
    && plantConfig.labels
    && !plantConfig.labelsOnHover;
  const showHoverLabel = plantsVisible
    && plantConfig.labels
    && plantConfig.labelsOnHover;
  const labelsVisible = plantsVisible && !props.activeFocus;
  const plantLabelNodes = React.useMemo(() =>
    showAllLabels
      ? stableThreeDPlants.map((plant, i) =>
        <ThreeDPlant key={i} i={i}
          plant={plant}
          plants={stableThreeDPlants}
          labelOnly={true}
          disableRaycast={disableRaycast}
          config={plantConfig}
          getZ={getZ}
          activePositionRef={activePositionRef}
          hoveredPlant={hoveredPlant} />)
      : undefined,
    [
      activePositionRef,
      disableRaycast,
      getZ,
      hoveredPlant,
      plantConfig,
      showAllLabels,
      stableThreeDPlants,
    ]);
  const hoveredLabelNode = React.useMemo(() => {
    if (!showHoverLabel || hoveredPlant === undefined) { return undefined; }
    const plant = stableThreeDPlants[hoveredPlant];
    if (!plant) { return undefined; }
    return <ThreeDPlant key={hoveredPlant} i={hoveredPlant}
      plant={plant}
      plants={stableThreeDPlants}
      labelOnly={true}
      disableRaycast={disableRaycast}
      config={plantConfig}
      getZ={getZ}
      activePositionRef={activePositionRef}
      hoveredPlant={hoveredPlant} />;
  }, [
    activePositionRef,
    disableRaycast,
    getZ,
    hoveredPlant,
    plantConfig,
    showHoverLabel,
    stableThreeDPlants,
  ]);
  const plantNodes = React.useMemo(() =>
    stableThreeDPlants.map((plant, i) =>
      <ThreeDPlant key={i} i={i}
        plant={plant}
        plants={stableThreeDPlants}
        renderImage={false}
        visible={plantsVisible}
        spreadVisible={showSpread}
        disableRaycast={disableRaycast}
        config={plantConfig}
        hoveredPlant={hoveredPlant}
        activePositionRef={activePositionRef}
        getZ={getZ}
        startTimeRef={props.startTimeRef}
        dispatch={dispatch} />),
    [
      activePositionRef,
      disableRaycast,
      dispatch,
      getZ,
      hoveredPlant,
      plantConfig,
      plantsVisible,
      props.startTimeRef,
      showSpread,
      stableThreeDPlants,
    ]);
  const pointRadiusNodes = React.useMemo(() =>
    stableMapPoints
      .filter(point => point.body.radius > 0)
      .map(point =>
        <Point key={point.uuid}
          point={point}
          visible={showPoints}
          config={pointConfig}
          getZ={getZ}
          dispatch={dispatch}
          enableClick={false}
          renderMarker={false} />),
    [
      dispatch,
      getZ,
      pointConfig,
      showPoints,
      stableMapPoints,
    ]);
  const weedNodes = React.useMemo(() =>
    stableWeeds.map(weed =>
      <Weed key={weed.uuid}
        weed={weed}
        visible={showWeeds}
        config={weedConfig}
        getZ={getZ}
        dispatch={dispatch}
        enableClick={false}
        renderSphere={false}
        imageRaycast={false} />),
    [
      dispatch,
      getZ,
      showWeeds,
      stableWeeds,
      weedConfig,
    ]);

  // eslint-disable-next-line no-null/no-null
  return <Group dispose={null}
    onPointerMove={config.eventDebug
      ? handleDebugPointerMove
      : undefined}>
    {profilerEnabled && <ThreeDPerformanceMonitor />}
    <FPSProbe />
    {config.stats && <Stats />}
    {config.zoomBeacons && <ZoomBeacons
      config={zoomConfig}
      activeFocus={props.activeFocus}
      setActiveFocus={props.setActiveFocus} />}
    <Sky sunPosition={skySunPosition} />
    <Sphere args={[BigDistance.sky, 8, 16]}>
      <MeshBasicMaterial
        ref={skyRef}
        color={skyMaterialColor}
        side={BackSide} />
    </Sphere>
    <AnimatedGroup
      scale={props.activeFocus ? 1 : scale}>
      <Camera makeDefault={true} name={"camera"}
        fov={40} near={10} far={BigDistance.far}
        position={camera.position}
        rotation={[0, 0, 0]}
        zoom={topDown ? 0.25 : 1}
        up={[0, 0, 1]} />
    </AnimatedGroup>
    <OrbitControls
      maxPolarAngle={Math.PI / 2}
      minAzimuthAngle={topDownMobile ? Math.PI / 2 : undefined}
      maxAzimuthAngle={topDownMobile ? Math.PI / 2 : undefined}
      enableRotate={config.rotate}
      enableZoom={config.zoom}
      enablePan={config.pan}
      dampingFactor={0.2}
      onChange={handleCameraChange}
      target={camera.target}
      minDistance={config.lightsDebug ? 50 : 500}
      maxDistance={config.lightsDebug ? BigDistance.devZoom : BigDistance.zoom} />
    <AxesHelper args={[5000]} visible={config.threeAxes} />
    {config.viewCube && <GizmoHelper><GizmoViewcube /></GizmoHelper>}
    <Sun config={sunConfig}
      skyRef={skyRef}
      startTimeRef={props.startTimeRef}
      sunFactorRef={sunFactorRef} />
    <AmbientLight intensity={config.ambient / 100} />
    <Ground config={groundConfig} />
    <Clouds config={cloudsConfig} />
    <NorthArrow config={northArrowConfig} />
    <Bed
      config={bedConfig}
      soilSurfaceGeometry={soilSurface.geometry}
      getZ={getZ}
      images={stableImages}
      activeFocus={props.activeFocus}
      mapPoints={stableMapPoints}
      showMoistureMap={showMoistureMap}
      showMoistureReadings={showMoistureReadings}
      sensors={stableSensors}
      sensorReadings={stableSensorReadings}
      activePositionRef={activePositionRef}
      invalidate={invalidate}
      addPlantProps={addPlantProps} />
    {showMoistureMap && props.config.moistureDebug &&
      <MoistureReadings
        color={"green"}
        radius={50}
        applyOffset={true}
        config={moistureReadingsConfig}
        readings={stableSensorReadings} />}
    {showFarmbot &&
      <Bot
        dispatch={dispatch}
        config={botConfig}
        getZ={getZ}
        activeFocus={props.activeFocus}
        mountedToolName={props.mountedToolName}
        toolSlots={stableToolSlots} />}
    <Group name={"plant-icon-preload"} visible={false}>
      {iconPreloads}
    </Group>
    <Group name={"plant-labels"} visible={labelsVisible}>
      {plantLabelNodes}
      {hoveredLabelNode}
    </Group>
    <Grid
      config={gridConfig}
      getZ={getZ}
      activeFocus={props.activeFocus} />
    <Group name={"plants"}
      visible={plantsVisible}
      {...hoverHandlers}>
      <PlantImageInstances
        plants={stableThreeDPlants}
        config={plantConfig}
        getZ={getZ}
        visible={plantsVisible}
        dispatch={dispatch}
        startTimeRef={props.startTimeRef}
        animateSeasons={plantConfig.animateSeasons}
        season={plantConfig.plants}
        disableRaycast={disableRaycast}
        sunFactorRef={sunFactorRef} />
      {plantNodes}
    </Group>
    <Group name={"points"}
      visible={showPoints}>
      <PointMarkerInstances
        points={stableMapPoints}
        config={pointConfig}
        getZ={getZ}
        visible={showPoints}
        dispatch={dispatch} />
      {pointRadiusNodes}
    </Group>
    <Group name={"weeds"}
      visible={showWeeds}>
      <WeedSphereInstances
        weeds={stableWeeds}
        config={weedConfig}
        getZ={getZ}
        visible={showWeeds}
        dispatch={dispatch} />
      {weedNodes}
    </Group>
    <GroupOrderVisual
      allPoints={stableAllPoints}
      groups={stableGroups}
      config={groupOrderConfig}
      tryGroupSortType={props.addPlantProps?.designer.tryGroupSortType}
      getZ={getZ} />
    <Visualization
      visualizedSequenceUUID={props.addPlantProps?.designer.visualizedSequence}
      config={visualizationConfig} />
    <Solar config={solarConfig} activeFocus={props.activeFocus} />
    <Lab config={sceneConfig} activeFocus={props.activeFocus} />
    <Greenhouse config={sceneConfig} activeFocus={props.activeFocus} />
  </Group>;
};
