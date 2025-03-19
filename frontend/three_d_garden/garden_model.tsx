import React from "react";
import { ThreeEvent } from "@react-three/fiber";
import {
  GizmoHelper, GizmoViewcube,
  OrbitControls, PerspectiveCamera,
  Stats, Image, OrthographicCamera,
  Sphere,
} from "@react-three/drei";
import { BackSide } from "three";
import { Bot } from "./bot";
import { AddPlantProps, Bed } from "./bed";
import {
  Sky, Solar, Sun, sunPosition, ZoomBeacons,
  calculatePlantPositions, convertPlants, ThreeDPlant,
  Point, Grid, Clouds, Ground, Weed,
  DrawnPoint,
} from "./garden";
import { Config } from "./config";
import { useSpring, animated } from "@react-spring/three";
import { Lab, Greenhouse } from "./scenes";
import { getCamera } from "./zoom_beacons_constants";
import {
  AmbientLight, AxesHelper, Group, MeshBasicMaterial,
} from "./components";
import { isUndefined } from "lodash";
import { ICON_URLS } from "../crops/constants";
import { TaggedGenericPointer, TaggedWeedPointer } from "farmbot";
import { BooleanSetting } from "../session_keys";
import { SlotWithTool } from "../resources/interfaces";
import { cameraInit } from "./camera";
import { getMode } from "../farm_designer/map/util";
import { DRAW_POINT_MODES } from "./constants";

const AnimatedGroup = animated(Group);

export interface GardenModelProps {
  config: Config;
  activeFocus: string;
  setActiveFocus(focus: string): void;
  addPlantProps?: AddPlantProps;
  mapPoints?: TaggedGenericPointer[];
  weeds?: TaggedWeedPointer[];
  toolSlots?: SlotWithTool[];
  mountedToolName?: string | undefined;
}

// eslint-disable-next-line complexity
export const GardenModel = (props: GardenModelProps) => {
  const { config, addPlantProps } = props;
  const dispatch = addPlantProps?.dispatch;
  const Camera = config.perspective ? PerspectiveCamera : OrthographicCamera;

  const plants = isUndefined(addPlantProps)
    ? calculatePlantPositions(config)
    : convertPlants(config, addPlantProps.plants);

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

  const camera = getCamera(config, props.activeFocus, cameraInit());

  const showPlants = !addPlantProps
    || !!addPlantProps.getConfigValue(BooleanSetting.show_plants);
  const plantsVisible = props.activeFocus != "Planter bed" && showPlants;
  const showFarmbot = !addPlantProps
    || !!addPlantProps.getConfigValue(BooleanSetting.show_farmbot);
  const showPoints = !!addPlantProps?.getConfigValue(BooleanSetting.show_points);
  const showWeeds = !!addPlantProps?.getConfigValue(BooleanSetting.show_weeds);

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
    <Sky sunPosition={sunPosition(config)} />
    <Sphere args={[30000, 8, 16]}>
      <MeshBasicMaterial color={"#59d8ff"} side={BackSide} />
    </Sphere>
    <AnimatedGroup scale={props.activeFocus ? 1 : scale}>
      <Camera makeDefault={true} name={"camera"}
        fov={40} near={10} far={75000}
        position={camera.position}
        rotation={[0, 0, 0]}
        up={[0, 0, 1]} />
    </AnimatedGroup>
    <OrbitControls maxPolarAngle={Math.PI / 2}
      enableZoom={config.zoom} enablePan={config.pan} dampingFactor={0.2}
      target={camera.target}
      minDistance={500} maxDistance={12000} />
    <AxesHelper args={[5000]} visible={config.threeAxes} />
    {config.viewCube && <GizmoHelper>
      <GizmoViewcube />
    </GizmoHelper>}
    <Sun config={config} />
    <AmbientLight intensity={1} />
    <Ground config={config} />
    <Clouds config={config} />
    <Bed
      config={config}
      activeFocus={props.activeFocus}
      addPlantProps={addPlantProps} />
    {showFarmbot &&
      <Bot
        dispatch={dispatch}
        config={config}
        activeFocus={props.activeFocus}
        mountedToolName={props.mountedToolName}
        toolSlots={props.toolSlots} />}
    <Group name={"plant-icon-preload"} visible={false}>
      {ICON_URLS.map((url, i) => <Image key={i} url={url} />)}
    </Group>
    <Group name={"plant-labels"} visible={!props.activeFocus}>
      {plants.map((plant, i) =>
        <ThreeDPlant key={i} i={i}
          plant={plant}
          labelOnly={true}
          config={config}
          hoveredPlant={hoveredPlant} />)}
    </Group>
    <Grid config={config} />
    <Group name={"plants"}
      visible={plantsVisible}
      onPointerEnter={setHover(true)}
      onPointerMove={setHover(true)}
      onPointerLeave={setHover(false)}>
      {plants.map((plant, i) =>
        <ThreeDPlant key={i} i={i}
          plant={plant}
          visible={plantsVisible}
          config={config}
          hoveredPlant={hoveredPlant}
          dispatch={dispatch} />)}
    </Group>
    <Group name={"points"}
      visible={showPoints}>
      {props.mapPoints?.map(point =>
        <Point key={point.uuid}
          point={point}
          config={config}
          dispatch={dispatch} />)}
    </Group>
    {addPlantProps && DRAW_POINT_MODES.includes(getMode()) &&
      <DrawnPoint
        config={config}
        designer={addPlantProps.designer}
        usePosition={true} />}
    <Group name={"weeds"}
      visible={showWeeds}>
      {props.weeds?.map(weed =>
        <Weed key={weed.uuid}
          weed={weed}
          config={config}
          dispatch={dispatch} />)}
    </Group>
    <Solar config={config} activeFocus={props.activeFocus} />
    <Lab config={config} activeFocus={props.activeFocus} />
    <Greenhouse config={config} activeFocus={props.activeFocus} />
  </Group>;
};
