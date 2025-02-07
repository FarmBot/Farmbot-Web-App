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
} from "./garden";
import { Config } from "./config";
import { useSpring, animated } from "@react-spring/three";
import { Lab, Greenhouse } from "./scenes";
import { getCamera, Camera as CameraInterface } from "./zoom_beacons_constants";
import {
  AmbientLight, AxesHelper, Group, MeshBasicMaterial,
} from "./components";
import { isDesktop } from "../screen_size";
import { isUndefined } from "lodash";
import { ICON_URLS } from "../crops/constants";
import { TaggedGenericPointer, TaggedWeedPointer } from "farmbot";
import { BooleanSetting } from "../session_keys";

const AnimatedGroup = animated(Group);

export interface GardenModelProps {
  config: Config;
  activeFocus: string;
  setActiveFocus(focus: string): void;
  addPlantProps?: AddPlantProps;
  mapPoints?: TaggedGenericPointer[];
  weeds?: TaggedWeedPointer[];
}

export const GardenModel = (props: GardenModelProps) => {
  const { config } = props;
  const Camera = config.perspective ? PerspectiveCamera : OrthographicCamera;

  const plants = isUndefined(props.addPlantProps)
    ? calculatePlantPositions(config)
    : convertPlants(config, props.addPlantProps.plants);

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

  const initCamera: CameraInterface = {
    position: isDesktop() ? [2000, -4000, 2500] : [5400, -2500, 3400],
    target: [0, 0, 0],
  };
  const camera = getCamera(config, props.activeFocus, initCamera);

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
    <Sky distance={450000}
      sunPosition={sunPosition(config)}
      mieCoefficient={0.01}
      mieDirectionalG={0.9}
      rayleigh={3}
      turbidity={5} />
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
      addPlantProps={props.addPlantProps} />
    {(!props.addPlantProps
      || !!props.addPlantProps.getConfigValue(BooleanSetting.show_farmbot)) &&
      <Bot config={config} activeFocus={props.activeFocus} />}
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
      visible={props.activeFocus != "Planter bed" &&
        (!props.addPlantProps
          || !!props.addPlantProps.getConfigValue(BooleanSetting.show_plants))}
      onPointerEnter={setHover(true)}
      onPointerMove={setHover(true)}
      onPointerLeave={setHover(false)}>
      {plants.map((plant, i) =>
        <ThreeDPlant key={i} i={i}
          plant={plant}
          config={config}
          hoveredPlant={hoveredPlant} />)}
    </Group>
    <Group name={"points"}
      visible={!!props.addPlantProps?.getConfigValue(BooleanSetting.show_points)}>
      {props.mapPoints?.map(point =>
        <Point key={point.uuid} point={point} config={config} />)}
    </Group>
    <Group name={"weeds"}
      visible={!!props.addPlantProps?.getConfigValue(BooleanSetting.show_weeds)}>
      {props.weeds?.map(weed =>
        <Weed key={weed.uuid} weed={weed} config={config} />)}
    </Group>
    <Solar config={config} activeFocus={props.activeFocus} />
    <Lab config={config} activeFocus={props.activeFocus} />
    <Greenhouse config={config} activeFocus={props.activeFocus} />
  </Group>;
};
