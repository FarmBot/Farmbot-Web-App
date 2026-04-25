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
import { getZFunc } from "./triangle_functions";
import { Visualization } from "./visualization";
import { GroupOrderVisual } from "./group_order_visual";
import { MoistureReadings } from "./garden/moisture_texture";
import { FPSProbe } from "./fps_probe";
import { CameraSelectionUI } from "./camera_selection_ui";
import {
  PerfMark, perfMark, usePerfRenderCount,
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

const AnimatedGroup = animated(Group);
const LazyBot = React.lazy(() =>
  import("./bot").then(module => ({ default: module.Bot })));
export const SMOOTH_XL_CAMERA_BED_SCALE = 1.9;
export const SMOOTH_XL_CAMERA_HEIGHT_SCALE = 1.45;

interface ZoomBeaconsLoadInProps extends ZoomBeaconsProps {
  onRest?: () => void;
}

const ZoomBeaconsLoadIn = (props: ZoomBeaconsLoadInProps) => {
  const { onRest, ...zoomBeaconProps } = props;
  const { scale, opacity } = useSpring({
    from: { scale: 0.35, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    onRest,
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
  markReadyOnMount?: boolean;
  children: React.ReactNode;
}

const SceneBoundary = (props: SceneBoundaryProps) => {
  if (props.loadStep
    && props.loadProgress
    && !props.loadProgress.isStepAllowed(props.loadStep)) {
    return undefined;
  }
  const markReadyOnMount = props.markReadyOnMount !== false;
  return <React.Suspense fallback={undefined}>
    {props.children}
    {markReadyOnMount && props.loadStep && props.loadProgress &&
      <LoadStepReady
        step={props.loadStep}
        markStep={props.loadProgress.markStep} />}
    {props.markName && <PerfMark name={props.markName} />}
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
  onLoadComplete?(): void;
}

// eslint-disable-next-line complexity
export const GardenModel = (props: GardenModelProps) => {
  usePerfRenderCount("GardenModel");
  const { config, addPlantProps, onLoadComplete, threeDPlants } = props;
  const dispatch = addPlantProps?.dispatch;
  const Camera = config.perspective ? PerspectiveCamera : OrthographicCamera;

  const [hoveredPlant, setHoveredPlant] =
    React.useState<number | undefined>(undefined);

  const getI = (e: ThreeEvent<PointerEvent>) => {
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
  };

  const setHover = (active: boolean) => {
    return config.labelsOnHover
      ? (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        const nextHover = active ? getI(e) : undefined;
        setHoveredPlant(nextHover);
      }
      : undefined;
  };

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
  const loadCompleteNotified = React.useRef(false);
  const markLoadStep = loadProgress.markStep;
  const markDetailsLoaded = React.useCallback(() => {
    markLoadStep("details");
  }, [markLoadStep]);

  React.useEffect(() => {
    perfMark("garden_model_mounted");
  }, []);

  React.useEffect(() => {
    if (!loadProgress.complete || loadCompleteNotified.current) { return; }
    loadCompleteNotified.current = true;
    onLoadComplete?.();
  }, [loadProgress.complete, onLoadComplete]);

  const showPlants = !addPlantProps
    || !!addPlantProps.getConfigValue(BooleanSetting.show_plants);
  const plantsVisible = props.activeFocus != "Planter bed" && showPlants;
  const showFarmbot = !addPlantProps
    || !!addPlantProps.getConfigValue(BooleanSetting.show_farmbot);
  const showPoints = config.showSoilPoints
    || !!addPlantProps?.getConfigValue(BooleanSetting.show_points);
  const showWeeds = !!addPlantProps?.getConfigValue(BooleanSetting.show_weeds);
  const showSpread = !!addPlantProps?.getConfigValue(BooleanSetting.show_spread);

  const soilPoints = React.useMemo(
    () => filterSoilPoints({ points: props.mapPoints, config }),
    [props.mapPoints, config]);
  const soilSurface = React.useMemo(() =>
    getSurface(soilPoints), [soilPoints]);
  React.useEffect(() => {
    sessionStorage.setItem("soilSurfaceTriangles",
      JSON.stringify(soilSurface.triangles));
  }, [soilSurface.triangles]);
  const getZ = React.useMemo(
    () => getZFunc(soilSurface.triangles, -config.soilHeight),
    [soilSurface.triangles, config.soilHeight]);

  const showMoistureMap = !!props.addPlantProps?.getConfigValue(
    BooleanSetting.show_moisture_interpolation_map);
  const showMoistureReadings = !!props.addPlantProps?.getConfigValue(
    BooleanSetting.show_sensor_readings);
  const sceneDetailsLoadIn =
    config.scene == "Lab" || config.scene == "Greenhouse";
  const animatedDetailsLoadIn = sceneDetailsLoadIn || config.zoomBeacons;

  const topDownAtStart = !!props.addPlantProps?.getConfigValue(
    BooleanSetting.top_down_view);
  const topDownZoomLevel = 0.25 * 3000 / config.bedLengthOuter;
  const targetZoom = config.topDown ? topDownZoomLevel : 1;
  const focusTransitionsEnabled =
    !!props.smoothFocusTransitions && config.animate;
  const renderedCamera = useSmoothCamera({
    camera,
    zoom: targetZoom,
    enabled: focusTransitionsEnabled,
    cameraObject: controlsCamera,
    controls,
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
    [threeDPlants, config, getZ, hoveredPlant]);

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
      <ThreeDLoadProgressOverlay progress={loadProgress} />
      <SceneBoundary
        loadStep={"environment"}
        loadProgress={loadProgress}
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
          startTimeRef={props.startTimeRef} />
        <AmbientLight intensity={config.ambient / 100} />
        <Ground config={config} />
      </SceneBoundary>
      <SceneBoundary
        loadStep={"bed"}
        loadProgress={loadProgress}
        markReadyOnMount={false}
        markName={"three_d_bed_ready"}>
        <NorthArrow config={config} />
        <PopInGroup
          name={"bed-load-in"}
          onRest={() => loadProgress.markStep("bed")}
          distance={config.bedHeight + config.bedZOffset}>
          <Bed
            config={config}
            soilSurfaceGeometry={soilSurface.geometry}
            getZ={getZ}
            images={props.images}
            activeFocus={props.activeFocus}
            mapPoints={props.mapPoints || []}
            showMoistureMap={showMoistureMap}
            showMoistureReadings={showMoistureReadings}
            sensors={props.sensors || []}
            sensorReadings={props.sensorReadings || []}
            activePositionRef={activePositionRef}
            addPlantProps={addPlantProps} />
        </PopInGroup>
      </SceneBoundary>
      <SceneBoundary
        loadStep={"grid"}
        loadProgress={loadProgress}
        markReadyOnMount={false}
        markName={"three_d_grid_ready"}>
        <GridRevealGroup
          name={"grid-load-in"}
          onRest={() => loadProgress.markStep("grid")}>
          <Grid
            config={config}
            getZ={getZ}
            activeFocus={props.activeFocus} />
        </GridRevealGroup>
      </SceneBoundary>
      <SceneBoundary
        loadStep={"plants"}
        loadProgress={loadProgress}
        markReadyOnMount={false}
        markName={"three_d_core_ready"}>
        <PopInGroup
          name={"plants-load-in"}
          onRest={() => loadProgress.markStep("plants")}
          distance={200}>
          <FocusVisibilityGroup
            name={"plant-labels"}
            visible={!props.activeFocus}>
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
              iconCapacities={props.plantIconCapacities}
              startTimeRef={props.startTimeRef}
              dispatch={dispatch} />
            <PlantSpreadInstances
              plants={threeDPlants}
              visible={plantInstancesVisible}
              spreadVisible={showSpread}
              config={config}
              instanceCapacity={props.plantInstanceCapacity}
              activePositionRef={activePositionRef}
              getZ={getZ}
              dispatch={dispatch} />
          </FocusVisibilityGroup>
        </PopInGroup>
      </SceneBoundary>
      <SceneBoundary
        loadStep={"weeds"}
        loadProgress={loadProgress}
        markReadyOnMount={false}
        markName={"three_d_weeds_ready"}>
        <PopInGroup
          name={"weeds-load-in"}
          onRest={() => loadProgress.markStep("weeds")}
          distance={200}>
          <Group name={"weeds"}
            visible={showWeeds}>
            {(props.weeds?.length || 0) > 0 &&
            <WeedInstances
              weeds={props.weeds || []}
              visible={showWeeds}
              config={config}
              getZ={getZ}
              dispatch={dispatch} />}
          </Group>
        </PopInGroup>
      </SceneBoundary>
      <SceneBoundary
        loadStep={"points"}
        loadProgress={loadProgress}
        markReadyOnMount={false}
        markName={"three_d_points_ready"}>
        <FallInGroup
          name={"points-load-in"}
          onRest={() => loadProgress.markStep("points")}
          distance={config.columnLength + 1000}>
          <Group name={"points"}
            visible={showPoints}>
            {(props.mapPoints?.length || 0) > 0 &&
            <PointInstances
              points={props.mapPoints || []}
              visible={showPoints}
              config={config}
              getZ={getZ}
              dispatch={dispatch} />}
          </Group>
        </FallInGroup>
      </SceneBoundary>
      <SceneBoundary
        loadStep={"farmbot"}
        loadProgress={loadProgress}
        markReadyOnMount={!showFarmbot}
        markName={"three_d_bot_ready"}>
        {showFarmbot &&
        <FallInGroup
          name={"bot-load-in"}
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
            activeFocus={props.activeFocus}
            mountedToolName={props.mountedToolName}
            toolSlots={props.toolSlots} />
        </FallInGroup>}
      </SceneBoundary>
      <SceneBoundary
        loadStep={"details"}
        loadProgress={loadProgress}
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
          onRest={!sceneDetailsLoadIn ? markDetailsLoaded : undefined} />}
        <AxesHelper args={[5000]} visible={config.threeAxes} />
        {config.viewCube && <GizmoHelper><GizmoViewcube /></GizmoHelper>}
        <Clouds config={config} />
        {showMoistureMap && props.config.moistureDebug &&
        <MoistureReadings
          color={"green"}
          radius={50}
          applyOffset={true}
          config={config}
          readings={props.sensorReadings || []} />}
        <GroupOrderVisual
          allPoints={props.allPoints || []}
          groups={props.groups || []}
          config={config}
          tryGroupSortType={props.addPlantProps?.designer.tryGroupSortType}
          getZ={getZ} />
        {props.addPlantProps?.designer.visualizedSequence &&
        <Visualization
          visualizedSequenceUUID={props.addPlantProps?.designer.visualizedSequence}
          config={config}
          configPosition={props.configPosition} />}
        <Solar config={config} activeFocus={props.activeFocus} />
        <Lab
          config={config}
          activeFocus={props.activeFocus}
          onDetailsLoadInRest={config.scene == "Lab"
            ? markDetailsLoaded
            : undefined} />
        <Greenhouse
          config={config}
          activeFocus={props.activeFocus}
          onDetailsLoadInRest={config.scene == "Greenhouse"
            ? markDetailsLoaded
            : undefined} />
        {config.cameraSelectionView &&
        <CameraSelectionUI
          config={config}
          dispatch={dispatch}
          topDownAtStart={topDownAtStart} />}
        {!animatedDetailsLoadIn &&
        <LoadStepReady
          step={"details"}
          markStep={loadProgress.markStep} />}
      </SceneBoundary>
    </Group>
  </FocusTransitionProvider>;
};
