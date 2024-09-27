import React from "react";
import { ThreeEvent } from "@react-three/fiber";
import {
  GizmoHelper, GizmoViewcube,
  OrbitControls, PerspectiveCamera,
  Circle, Stats, Billboard, Text, Image, Clouds, Cloud, OrthographicCamera,
  Detailed, Sphere,
  useTexture,
} from "@react-three/drei";
import { RepeatWrapping, Vector3, BackSide } from "three";
import { Bot } from "./bot";
import { Bed } from "./bed";
import { threeSpace, zZero } from "./helpers";
import { Sky } from "./sky";
import { Config, detailLevels, seasonProperties } from "./config";
import { ASSETS, GARDENS, PLANTS } from "./constants";
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

export interface GardenModelProps {
  config: Config;
  activeFocus: string;
  setActiveFocus(focus: string): void;
}

interface Plant {
  label: string;
  icon: string;
  size: number;
  spread: number;
  x: number;
  y: number;
}

export const GardenModel = (props: GardenModelProps) => {
  const { config } = props;
  const groundZ = config.bedZOffset + config.bedHeight;
  const Camera = config.perspective ? PerspectiveCamera : OrthographicCamera;

  const gardenPlants = GARDENS[config.plants] || [];
  const calculatePlantPositions = (): Plant[] => {
    const positions: Plant[] = [];
    const startX = 350;
    let nextX = startX;
    let index = 0;
    while (nextX <= config.bedLengthOuter - 100) {
      const plantKey = gardenPlants[index];
      const plant = PLANTS[plantKey];
      if (!plant) { return []; }
      positions.push({
        ...plant,
        x: nextX,
        y: config.bedWidthOuter / 2,
      });
      const plantsPerHalfRow =
        Math.ceil((config.bedWidthOuter - plant.spread) / 2 / plant.spread);
      for (let i = 1; i < plantsPerHalfRow; i++) {
        positions.push({
          ...plant,
          x: nextX,
          y: config.bedWidthOuter / 2 + plant.spread * i,
        });
        positions.push({
          ...plant,
          x: nextX,
          y: config.bedWidthOuter / 2 - plant.spread * i,
        });
      }
      if (index + 1 < gardenPlants.length) {
        const nextPlant = PLANTS[gardenPlants[index + 1]];
        nextX += (plant.spread / 2) + (nextPlant.spread / 2);
        index++;
      } else {
        index = 0;
        const nextPlant = PLANTS[gardenPlants[0]];
        nextX += (plant.spread / 2) + (nextPlant.spread / 2);
      }
    }
    return positions;
  };
  const plants = calculatePlantPositions();

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

  interface PlantProps {
    plant: Plant;
    i: number;
    labelOnly?: boolean;
  }

  const Plant = (props: PlantProps) => {
    const { i, plant, labelOnly } = props;
    const alwaysShowLabels = config.labels && !config.labelsOnHover;
    return <Billboard follow={true}
      position={new Vector3(
        threeSpace(plant.x, config.bedLengthOuter),
        threeSpace(plant.y, config.bedWidthOuter),
        zZero(config) - config.soilHeight + plant.size / 2,
      )}>
      {labelOnly
        ? <Text visible={alwaysShowLabels || i === hoveredPlant}
          renderOrder={2}
          material-depthTest={false}
          fontSize={50}
          position={[0, plant.size / 2 + 40, 0]}
          font={ASSETS.fonts.cabinBold}
          outlineColor={"black"}
          outlineWidth={3}
          outlineBlur={15}
          outlineOpacity={0.7}>
          {plant.label}
        </Text>
        : <Image url={plant.icon} scale={plant.size} name={"" + i}
          transparent={true}
          renderOrder={1} />}
    </Billboard>;
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
    <animated.group scale={props.activeFocus ? 1 : scale}>
      <Camera makeDefault={true} name={"camera"}
        fov={40} near={10} far={75000}
        position={camera.position}
        rotation={[0, 0, 0]}
        up={[0, 0, 1]} />
    </animated.group>
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
          map={config.lab ? labFloorTexture : grassTexture}
          color={"#ddd"}
          shininess={0} />
      </Ground>
      <Ground>
        <MeshPhongMaterial
          color={config.lab ? "gray" : "darkgreen"}
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
    <Bed config={config} activeFocus={props.activeFocus} />
    <Bot config={config} activeFocus={props.activeFocus} />
    <Group name={"plant-icon-preload"} visible={false}>
      {Object.values(PLANTS).map((plant, i) =>
        <Image key={i} url={plant.icon} />)}
    </Group>
    <Group name={"plant-labels"} visible={!props.activeFocus}>
      {plants.map((plant, i) =>
        <Plant key={i} i={i} plant={plant} labelOnly={true} />)}
    </Group>
    <Group name={"plants"}
      visible={props.activeFocus != "Planter bed"}
      onPointerEnter={setHover(true)}
      onPointerMove={setHover(true)}
      onPointerLeave={setHover(false)}>
      {plants.map((plant, i) =>
        <Plant key={i} i={i} plant={plant} />)}
    </Group>
    <Solar config={config} activeFocus={props.activeFocus} />
    <Lab config={config} activeFocus={props.activeFocus} />
  </Group>;
};
