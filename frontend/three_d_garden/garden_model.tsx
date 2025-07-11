import React from "react";
import { ThreeEvent } from "@react-three/fiber";
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
  ThreeDPlant,
  Point, Grid, Clouds, Ground, Weed,
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
import { TaggedGenericPointer, TaggedWeedPointer } from "farmbot";
import { BooleanSetting } from "../session_keys";
import { SlotWithTool } from "../resources/interfaces";
import { cameraInit } from "./camera";
import { isMobile } from "../screen_size";
import { computeSurface, getZFunc, precomputeTriangles } from "./triangles";
import { BigDistance } from "./constants";

const AnimatedGroup = animated(Group);

export interface GardenModelProps {
  config: Config;
  activeFocus: string;
  setActiveFocus(focus: string): void;
  threeDPlants: ThreeDGardenPlant[];
  addPlantProps?: AddPlantProps;
  mapPoints?: TaggedGenericPointer[];
  weeds?: TaggedWeedPointer[];
  toolSlots?: SlotWithTool[];
  mountedToolName?: string | undefined;
  startTimeRef?: React.RefObject<number>;
}

// eslint-disable-next-line complexity
export const GardenModel = (props: GardenModelProps) => {
  const { config, addPlantProps, threeDPlants } = props;
  const dispatch = addPlantProps?.dispatch;
  const Camera = config.perspective ? PerspectiveCamera : OrthographicCamera;

  const [hoveredPlant, setHoveredPlant] =
    React.useState<number | undefined>(undefined);

  const getI = (e: ThreeEvent<PointerEvent>) =>
    e.buttons ? -1 : parseInt(e.intersections[0].object.name);

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
  const camera = getCamera(config, props.activeFocus, cameraInit(!!topDown));

  const showPlants = !addPlantProps
    || !!addPlantProps.getConfigValue(BooleanSetting.show_plants);
  const plantsVisible = props.activeFocus != "Planter bed" && showPlants;
  const showFarmbot = !addPlantProps
    || !!addPlantProps.getConfigValue(BooleanSetting.show_farmbot);
  const showPoints = config.showSoilPoints
    || !!addPlantProps?.getConfigValue(BooleanSetting.show_points);
  const showWeeds = !!addPlantProps?.getConfigValue(BooleanSetting.show_weeds);

  const { vertices, vertexList, uvs, faces } = React.useMemo(() =>
    computeSurface(props.mapPoints, config), [props.mapPoints, config]);
  const triangles = React.useMemo(() =>
    precomputeTriangles(vertexList, faces), [vertexList, faces]);
  const getZ = getZFunc(triangles, -config.soilHeight);

  // eslint-disable-next-line no-null/no-null
  const skyRef = React.useRef<ThreeMeshBasicMaterial>(null);

  // eslint-disable-next-line no-null/no-null
  return <Group dispose={null}
    onPointerMove={config.eventDebug
      ? e => console.log(e.intersections.map(x => x.object.name))
      : undefined}>
    {config.stats && <Stats />}
    {config.zoomBeacons && <ZoomBeacons
      config={config}
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
      target={camera.target}
      minDistance={config.lightsDebug ? 50 : 500}
      maxDistance={config.lightsDebug ? BigDistance.devZoom : BigDistance.zoom} />
    <AxesHelper args={[5000]} visible={config.threeAxes} />
    {config.viewCube && <GizmoHelper><GizmoViewcube /></GizmoHelper>}
    <Sun config={config} skyRef={skyRef} startTimeRef={props.startTimeRef} />
    <AmbientLight intensity={config.ambient / 100} />
    <Ground config={config} />
    <Clouds config={config} />
    <NorthArrow config={config} />
    <Bed
      config={config}
      vertices={vertices}
      uvs={uvs}
      getZ={getZ}
      activeFocus={props.activeFocus}
      mapPoints={props.mapPoints || []}
      addPlantProps={addPlantProps} />
    {showFarmbot &&
      <Bot
        dispatch={dispatch}
        config={config}
        getZ={getZ}
        activeFocus={props.activeFocus}
        mountedToolName={props.mountedToolName}
        toolSlots={props.toolSlots} />}
    <Group name={"plant-icon-preload"} visible={false}>
      {ICON_URLS.map((url, i) => <Image key={i} url={url} />)}
    </Group>
    <Group name={"plant-labels"} visible={!props.activeFocus}>
      {threeDPlants.map((plant, i) =>
        <ThreeDPlant key={i} i={i}
          plant={plant}
          labelOnly={true}
          config={config}
          getZ={getZ}
          hoveredPlant={hoveredPlant} />)}
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
      {threeDPlants.map((plant, i) =>
        <ThreeDPlant key={i} i={i}
          plant={plant}
          visible={plantsVisible}
          config={config}
          hoveredPlant={hoveredPlant}
          getZ={getZ}
          startTimeRef={props.startTimeRef}
          dispatch={dispatch} />)}
    </Group>
    <Group name={"points"}
      visible={showPoints}>
      {props.mapPoints?.map(point =>
        <Point key={point.uuid}
          point={point}
          visible={showPoints}
          config={config}
          getZ={getZ}
          dispatch={dispatch} />)}
    </Group>
    <Group name={"weeds"}
      visible={showWeeds}>
      {props.weeds?.map(weed =>
        <Weed key={weed.uuid}
          weed={weed}
          visible={showWeeds}
          config={config}
          getZ={getZ}
          dispatch={dispatch} />)}
    </Group>
    <Solar config={config} activeFocus={props.activeFocus} />
    <Lab config={config} activeFocus={props.activeFocus} />
    <Greenhouse config={config} activeFocus={props.activeFocus} />
  </Group>;
};
