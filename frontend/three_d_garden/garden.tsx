import React from "react";
import { ThreeEvent } from "@react-three/fiber";
import {
  GizmoHelper, GizmoViewcube,
  OrbitControls, PerspectiveCamera,
  Circle, Stats, Image, Clouds, Cloud, OrthographicCamera,
  Detailed, Sphere,
  useTexture,
  Line,
  Cylinder,
  Billboard,
} from "@react-three/drei";
import { RepeatWrapping, BackSide, DoubleSide } from "three";
import { Bot } from "./bot";
import { AddPlantProps, Bed } from "./bed";
import { zero as zeroFunc, extents as extentsFunc, threeSpace } from "./helpers";
import { Sky } from "./sky";
import { Config, detailLevels, seasonProperties } from "./config";
import { ASSETS } from "./constants";
import { useSpring, animated } from "@react-spring/three";
import { Solar } from "./solar";
import { Sun, sunPosition } from "./sun";
import { Lab } from "./lab";
import { ZoomBeacons } from "./zoom_beacons";
import { getCamera, Camera as CameraInterface } from "./zoom_beacons_constants";
import {
  AmbientLight, AxesHelper, Group, MeshBasicMaterial, MeshPhongMaterial,
} from "./components";
import { isDesktop } from "../screen_size";
import { isUndefined, range } from "lodash";
import { ICON_URLS } from "../crops/constants";
import { calculatePlantPositions, convertPlants, ThreeDPlant } from "./plants";
import { TaggedGenericPointer, TaggedWeedPointer } from "farmbot";
import { BooleanSetting } from "../session_keys";
import { Greenhouse } from "./greenhouse";

const AnimatedGroup = animated(Group);

export interface GardenModelProps {
  config: Config;
  activeFocus: string;
  setActiveFocus(focus: string): void;
  addPlantProps?: AddPlantProps;
  mapPoints?: TaggedGenericPointer[];
  weeds?: TaggedWeedPointer[];
}

// eslint-disable-next-line complexity
export const GardenModel = (props: GardenModelProps) => {
  const { config } = props;
  const groundZ = config.bedZOffset + config.bedHeight;
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

  const grassTexture = useTexture(ASSETS.textures.grass + "?=grass");
  grassTexture.wrapS = RepeatWrapping;
  grassTexture.wrapT = RepeatWrapping;
  grassTexture.repeat.set(24, 24);
  const labFloorTexture = useTexture(ASSETS.textures.concrete + "?=labFloor");
  labFloorTexture.wrapS = RepeatWrapping;
  labFloorTexture.wrapT = RepeatWrapping;
  labFloorTexture.repeat.set(16, 24);
  const brickTexture = useTexture(ASSETS.textures.bricks + "?=bricks");
  brickTexture.wrapS = RepeatWrapping;
  brickTexture.wrapT = RepeatWrapping;
  brickTexture.repeat.set(30, 30);

  const Ground = ({ children }: { children: React.ReactElement }) =>
    <Circle name={"ground"}
      visible={config.ground}
      receiveShadow={true}
      args={[30000, 16]}
      position={[0, 0, -groundZ]}>
      {children}
    </Circle>;

  const initCamera: CameraInterface = {
    position: isDesktop() ? [2000, -4000, 2500] : [5400, -2500, 3400],
    target: [0, 0, 0],
  };
  const camera = getCamera(config, props.activeFocus, initCamera);

  const zero = zeroFunc(config);
  const gridZ = zero.z - config.soilHeight + 5;
  const extents = extentsFunc(config);

  let groundTexture;
  let groundColor;
  let lowDetailGroundColor;
  if (config.scene === "Greenhouse") {
    groundTexture = brickTexture;
    groundColor = "#999";
    lowDetailGroundColor = "firebrick";
  } else if (config.scene === "Lab") {
    groundTexture = labFloorTexture;
    groundColor = "#aaa";
    lowDetailGroundColor = "gray";
  } else {
    groundTexture = grassTexture;
    groundColor = "#ddd";
    lowDetailGroundColor = "darkgreen";
  }

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
    <Detailed distances={detailLevels(config)}>
      <Ground>
        <MeshPhongMaterial
          map={groundTexture}
          color={groundColor}
          shininess={0} />
      </Ground>
      <Ground>
        <MeshPhongMaterial
          color={lowDetailGroundColor}
          shininess={0} />
      </Ground>
    </Detailed>
    <Clouds name={"clouds"} visible={config.clouds} renderOrder={2}
      texture={ASSETS.textures.cloud}>
      <Cloud position={[0, 0, 5000]}
        seed={0}
        bounds={[5000, 5000, 1000]}
        segments={80}
        volume={2500}
        smallestVolume={.4}
        concentrate="random"
        color="#ccc"
        growth={400}
        speed={.1}
        opacity={
          (seasonProperties[config.plants] || seasonProperties.Summer)
            .cloudOpacity}
        fade={5000} />
    </Clouds>
    <Bed
      config={config}
      activeFocus={props.activeFocus}
      addPlantProps={props.addPlantProps} />
    <Bot config={config} activeFocus={props.activeFocus} />
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
    <Group name={"garden-grid"} visible={config.grid}>
      {range(0, config.botSizeX + 100, 100).map(x =>
        <Line key={x}
          color={"white"}
          points={[
            [zero.x + x, zero.y, gridZ],
            [zero.x + x, extents.y, gridZ],
          ]} />)}
      {range(0, config.botSizeY + 100, 100).map(y =>
        <Line key={y}
          color={"white"}
          points={[
            [zero.x, zero.y + y, gridZ],
            [extents.x, zero.y + y, gridZ],
          ]} />)}
    </Group>
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
        <Group key={point.uuid}
          rotation={[Math.PI / 2, 0, 0]}
          position={[
            threeSpace(point.body.x, config.bedLengthOuter),
            threeSpace(point.body.y, config.bedWidthOuter),
            zeroFunc(config).z - config.soilHeight,
          ]}>
          <Cylinder
            args={[5, 5, 100, 32, 32, true]}>
            <MeshPhongMaterial
              color={point.body.meta.color}
              side={DoubleSide}
              transparent={true}
              opacity={0.5} />
          </Cylinder>
          <Cylinder
            args={[point.body.radius, point.body.radius, 100, 32, 32, true]}>
            <MeshPhongMaterial
              color={point.body.meta.color}
              side={DoubleSide}
              transparent={true}
              opacity={0.5} />
          </Cylinder>
        </Group>)}
    </Group>
    <Group name={"weeds"}
      visible={!!props.addPlantProps?.getConfigValue(BooleanSetting.show_weeds)}>
      {props.weeds?.map(weed =>
        <Group key={weed.uuid}
          position={[
            threeSpace(weed.body.x, config.bedLengthOuter),
            threeSpace(weed.body.y, config.bedWidthOuter),
            zeroFunc(config).z - config.soilHeight,
          ]}>
          <Billboard follow={true}
            position={[0, 0, weed.body.radius / 2]}>
            <Image url={ASSETS.other.weed}
              scale={weed.body.radius}
              transparent={true}
              position={[0, 0, 0]} />
          </Billboard>
          <Sphere
            renderOrder={1}
            args={[weed.body.radius, 8, 16]}
            position={[0, 0, 0]}>
            <MeshPhongMaterial
              color={weed.body.meta.color}
              side={DoubleSide}
              transparent={true}
              opacity={0.5} />
          </Sphere>
        </Group>)}
    </Group>
    <Solar config={config} activeFocus={props.activeFocus} />
    <Lab config={config} activeFocus={props.activeFocus} />
    <Greenhouse config={config} activeFocus={props.activeFocus} />
  </Group>;
};
