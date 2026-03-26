import React from "react";
import { ThreeEvent } from "@react-three/fiber";
import {
  GizmoHelper, GizmoViewcube,
  OrbitControls, PerspectiveCamera,
  Stats, Image, OrthographicCamera,
  Sphere,
  StatsGl,
} from "@react-three/drei";
import {
  BackSide,
  MeshBasicMaterial as ThreeMeshBasicMaterial,
  OrthographicCamera as ThreeOrthographicCamera,
  PerspectiveCamera as ThreePerspectiveCamera,
} from "three";
import { Bot } from "./bot";
import { AddPlantProps, Bed } from "./bed";
import {
  Sky, Solar, Sun, sunPosition, ZoomBeacons,
  PlantInstances,
  PlantSpreadInstances,
  Point, Grid, Clouds, Ground, Weed,
  ThreeDGardenPlant,
  NorthArrow,
  skyColor,
  ThreeDPlantLabel,
} from "./garden";
import { Config, PositionConfig } from "./config";
import { useSpring, animated } from "@react-spring/three";
import { Lab, Greenhouse } from "./scenes";
import { getCamera } from "./zoom_beacons_constants";
import {
  AmbientLight, AxesHelper, Group, MeshBasicMaterial,
} from "./components";
import { ICON_URLS } from "../crops/constants";
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
import { isMobile } from "../screen_size";
import { filterSoilPoints, getSurface } from "./triangles";
import { BigDistance } from "./constants";
import { getZFunc } from "./triangle_functions";
import { Visualization } from "./visualization";
import { GroupOrderVisual } from "./group_order_visual";
import { MoistureReadings } from "./garden/moisture_texture";
import { FPSProbe } from "./fps_probe";

const AnimatedGroup = animated(Group);

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
}

// eslint-disable-next-line complexity
export const GardenModel = (props: GardenModelProps) => {
  const { config, addPlantProps, threeDPlants } = props;
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
        setHoveredPlant(active ? getI(e) : undefined);
      }
      : undefined;
  };

  const isXL = config.sizePreset == "Genesis XL";
  const { scale } = useSpring({
    scale: isXL ? 1.75 : 1,
    config: {
      tension: 300,
      friction: 40,
    },
  });

  const topDown = addPlantProps?.designer.threeDTopDownView;
  const topDownMobile = topDown && isMobile();
  const camera = getCamera(
    config,
    props.configPosition,
    props.activeFocus,
    cameraInit(!!topDown));
  const [controlsCamera, setControlsCamera] =
    // eslint-disable-next-line no-null/no-null
    React.useState<ThreePerspectiveCamera | ThreeOrthographicCamera | null>(null);

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

  // eslint-disable-next-line no-null/no-null
  const skyRef = React.useRef<ThreeMeshBasicMaterial>(null);
  const sunFactorRef = React.useRef<number>(1);
  // eslint-disable-next-line no-null/no-null
  const activePositionRef = React.useRef<{ x: number, y: number }>(null);

  const plantLabelNodes = React.useMemo(
    () => threeDPlants.map((plant, i) =>
      <ThreeDPlantLabel key={i} i={i}
        plant={plant}
        config={config}
        getZ={getZ}
        hoveredPlant={hoveredPlant} />),
    [threeDPlants, config, getZ, hoveredPlant]);

  const pointNodes = React.useMemo(
    () => props.mapPoints?.map(point =>
      <Point key={point.uuid}
        point={point}
        visible={showPoints}
        config={config}
        getZ={getZ}
        dispatch={dispatch} />),
    [props.mapPoints, showPoints, config, getZ, dispatch]);

  const weedNodes = React.useMemo(
    () => props.weeds?.map(weed =>
      <Weed key={weed.uuid}
        weed={weed}
        visible={showWeeds}
        config={config}
        getZ={getZ}
        dispatch={dispatch} />),
    [props.weeds, showWeeds, config, getZ, dispatch]);

  // eslint-disable-next-line no-null/no-null
  return <Group dispose={null}
    onPointerMove={config.eventDebug
      ? e => console.log(e.intersections.map(x => x.object.name))
      : undefined}>
    <FPSProbe />
    {config.stats && <StatsGl className={"stats-gl"} />}
    {config.stats && <Stats />}
    {config.zoomBeacons && <ZoomBeacons
      config={config}
      configPosition={props.configPosition}
      activeFocus={props.activeFocus}
      setActiveFocus={props.setActiveFocus} />}
    <Sky sunPosition={sunPosition(0, 0, 0)} />
    <Sphere args={[BigDistance.sky, 8, 16]}>
      <MeshBasicMaterial
        ref={skyRef}
        color={skyColor(config.sun)}
        side={BackSide} />
    </Sphere>
    <AnimatedGroup
      scale={props.activeFocus ? 1 : scale}>
      <Camera
        ref={setControlsCamera}
        makeDefault={true}
        name={"camera"}
        fov={40} near={10} far={BigDistance.far}
        position={camera.position}
        rotation={[0, 0, 0]}
        zoom={topDown ? 0.25 : 1}
        up={[0, 0, 1]} />
    </AnimatedGroup>
    {controlsCamera &&
      <OrbitControls
        camera={controlsCamera}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={topDownMobile ? Math.PI / 2 : undefined}
        maxAzimuthAngle={topDownMobile ? Math.PI / 2 : undefined}
        enableRotate={config.rotate}
        enableZoom={config.zoom}
        enablePan={config.pan}
        dampingFactor={0.2}
        target={camera.target}
        minDistance={config.lightsDebug ? 50 : 500}
        maxDistance={config.lightsDebug ? BigDistance.devZoom : BigDistance.zoom} />}
    <AxesHelper args={[5000]} visible={config.threeAxes} />
    {config.viewCube && <GizmoHelper><GizmoViewcube /></GizmoHelper>}
    <Sun
      config={config}
      skyRef={skyRef}
      startTimeRef={props.startTimeRef}
      sunFactorRef={sunFactorRef} />
    <AmbientLight intensity={config.ambient / 100} />
    <Ground config={config} />
    <Clouds config={config} />
    <NorthArrow config={config} />
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
    {showMoistureMap && props.config.moistureDebug &&
      <MoistureReadings
        color={"green"}
        radius={50}
        applyOffset={true}
        config={config}
        readings={props.sensorReadings || []} />}
    {showFarmbot &&
      <Bot
        dispatch={dispatch}
        config={config}
        configPosition={props.configPosition}
        getZ={getZ}
        activeFocus={props.activeFocus}
        mountedToolName={props.mountedToolName}
        toolSlots={props.toolSlots} />}
    <Group name={"plant-icon-preload"} visible={false}>
      {ICON_URLS.map((url, i) => <Image key={i} url={url} />)}
    </Group>
    <Group name={"plant-labels"} visible={!props.activeFocus}>
      {plantLabelNodes}
    </Group>
    <Grid
      config={config}
      getZ={getZ}
      activeFocus={props.activeFocus} />
    <Group name={"plants"}
      visible={plantsVisible}
      onPointerEnter={setHover(true)}
      onPointerMove={setHover(true)}
      onPointerLeave={setHover(false)}>
      <PlantInstances
        plants={threeDPlants}
        config={config}
        getZ={getZ}
        visible={plantsVisible}
        startTimeRef={props.startTimeRef}
        dispatch={dispatch}
        sunFactorRef={sunFactorRef} />
      <PlantSpreadInstances
        plants={threeDPlants}
        visible={plantsVisible}
        spreadVisible={showSpread}
        config={config}
        activePositionRef={activePositionRef}
        getZ={getZ}
        dispatch={dispatch} />
    </Group>
    <Group name={"points"}
      visible={showPoints}>
      {pointNodes}
    </Group>
    <Group name={"weeds"}
      visible={showWeeds}>
      {weedNodes}
    </Group>
    <GroupOrderVisual
      allPoints={props.allPoints || []}
      groups={props.groups || []}
      config={config}
      tryGroupSortType={props.addPlantProps?.designer.tryGroupSortType}
      getZ={getZ} />
    <Visualization
      visualizedSequenceUUID={props.addPlantProps?.designer.visualizedSequence}
      config={config}
      configPosition={props.configPosition} />
    <Solar config={config} activeFocus={props.activeFocus} />
    <Lab config={config} activeFocus={props.activeFocus} />
    <Greenhouse config={config} activeFocus={props.activeFocus} />
  </Group>;
};
