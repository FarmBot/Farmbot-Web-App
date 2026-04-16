/* eslint-disable complexity */
import React, { useEffect, useState } from "react";
import * as THREE from "three";
import {
  Cylinder, Extrude, Trail, Tube, useGLTF, useTexture,
} from "@react-three/drei";
import { DoubleSide, Shape, RepeatWrapping } from "three";
import {
  easyCubicBezierCurve3, get3DPositionNoMirrorFunc,
  zDir as zDirFunc,
  zZero as zZeroFunc,
} from "../helpers";
import { Config, PositionConfig } from "../config";
import type { GLTF } from "three-stdlib";
import { ASSETS, LIB_DIR, PartName } from "../constants";
import { SVGLoader } from "three/examples/jsm/Addons.js";
import { range } from "lodash";
import {
  CrossSlide, CrossSlideFull,
  GantryWheelPlate, GantryWheelPlateFull,
  VacuumPumpCover, VacuumPumpCoverFull,
} from "./parts";
import { PowerSupply } from "./power_supply";
import { Group, Mesh, MeshPhongMaterial } from "../components";
import {
  ElectronicsBox, Bounds, Tools, Solenoid, XAxisWaterTube,
  CableCarrierX,
  CableCarrierSupportVertical,
  CableCarrierZ,
  CableCarrierY,
  CableCarrierSupportHorizontal,
  GantryBeam,
  CameraView,
} from "./components";
import { SlotWithTool } from "../../resources/interfaces";
import { WateringAnimations } from "./components/watering_animations";

export const extrusionWidth = 20;
const utmRadius = 35;
export const utmHeight = 35;
export const cameraMountOffset = {
  x: extrusionWidth + 3,
  y: utmRadius,
};
export const cameraMountToLensOffset = new THREE.Vector3(
  0,
  extrusionWidth + 9,
  0,
);
const xTrackPadding = 280;
export const distinguishableBlack = "#333";

type LeftBracket = GLTF & {
  nodes: { [PartName.leftBracket]: THREE.Mesh };
  materials: never;
}
type RightBracket = GLTF & {
  nodes: { [PartName.rightBracket]: THREE.Mesh };
  materials: never;
}
type ZStop = GLTF & {
  nodes: { [PartName.zStop]: THREE.Mesh };
  materials: never;
}
type BeltClip = GLTF & {
  nodes: { [PartName.beltClip]: THREE.Mesh };
  materials: never;
}
type UTM = GLTF & {
  nodes: { [PartName.utm]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}
type HousingVertical = GLTF & {
  nodes: { [PartName.housingVertical]: THREE.Mesh };
  materials: never;
}
type HorizontalMotorHousing = GLTF & {
  nodes: { [PartName.horizontalMotorHousing]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}
type ZAxisMotorMount = GLTF & {
  nodes: { [PartName.zAxisMotorMount]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}
type CameraMountHalf = GLTF & {
  nodes: { [PartName.cameraMountHalf]: THREE.Mesh };
  materials: never;
}
type XAxisCCMount = GLTF & {
  nodes: { [PartName.xAxisCCMount]: THREE.Mesh };
  materials: never;
}

Object.values(ASSETS.models).map(model => useGLTF.preload(model, LIB_DIR));

export interface FarmbotModelProps {
  config: Config;
  configPosition: PositionConfig;
  activeFocus: string;
  getZ(x: number, y: number): number;
  toolSlots?: SlotWithTool[];
  mountedToolName?: string | undefined;
  dispatch?: Function;
}

export const Bot = (props: FarmbotModelProps) => {
  const config = props.config;
  const { botSizeX, botSizeY, botSizeZ, trail, laser,
    bedYOffset, bedWidthOuter, tracks,
    columnLength, zAxisLength, zGantryOffset,
  } = props.config;
  const { x, y, z } = props.configPosition;
  const zZero = zZeroFunc(config);
  const zDir = zDirFunc(config);
  const get3DPosition = get3DPositionNoMirrorFunc(config);
  const gardenXY = (gardenX: number, gardenY: number): [number, number] => {
    const position = get3DPosition({ x: gardenX, y: gardenY });
    return [position.x, position.y];
  };
  const outerXY = (gardenX: number, outerY: number): [number, number] =>
    gardenXY(gardenX, outerY - bedYOffset);
  const gantryWheelPlate =
    useGLTF(ASSETS.models.gantryWheelPlate, LIB_DIR) as unknown as GantryWheelPlateFull;
  const GantryWheelPlateComponent = GantryWheelPlate(gantryWheelPlate);
  const leftBracket = useGLTF(ASSETS.models.leftBracket, LIB_DIR) as unknown as LeftBracket;
  const rightBracket = useGLTF(ASSETS.models.rightBracket, LIB_DIR) as unknown as RightBracket;
  const crossSlide = useGLTF(ASSETS.models.crossSlide, LIB_DIR) as unknown as CrossSlideFull;
  const CrossSlideComponent = CrossSlide(crossSlide);
  const beltClip = useGLTF(ASSETS.models.beltClip, LIB_DIR) as unknown as BeltClip;
  const zStop = useGLTF(ASSETS.models.zStop, LIB_DIR) as unknown as ZStop;
  const utm = useGLTF(ASSETS.models.utm, LIB_DIR) as unknown as UTM;
  const housingVertical = useGLTF(
    ASSETS.models.housingVertical, LIB_DIR) as unknown as HousingVertical;
  const horizontalMotorHousing = useGLTF(
    ASSETS.models.horizontalMotorHousing, LIB_DIR) as unknown as HorizontalMotorHousing;
  const zAxisMotorMount = useGLTF(
    ASSETS.models.zAxisMotorMount, LIB_DIR) as unknown as ZAxisMotorMount;
  const vacuumPumpCover = useGLTF(
    ASSETS.models.vacuumPumpCover, LIB_DIR) as unknown as VacuumPumpCoverFull;
  const VacuumPumpCoverComponent = VacuumPumpCover(vacuumPumpCover);
  const cameraMountHalf = useGLTF(
    ASSETS.models.cameraMountHalf, LIB_DIR) as unknown as CameraMountHalf;
  const xAxisCCMount = useGLTF(ASSETS.models.xAxisCCMount, LIB_DIR) as unknown as XAxisCCMount;
  const [trackShape, setTrackShape] = useState<Shape>();
  const [beamShape, setBeamShape] = useState<Shape>();
  const [columnShape, setColumnShape] = useState<Shape>();
  const [zAxisShape, setZAxisShape] = useState<Shape>();
  useEffect(() => {
    if (!(trackShape && beamShape && columnShape && zAxisShape)) {
      const loader = new SVGLoader();
      loader.load(ASSETS.shapes.track,
        svg => {
          const smallCutout = SVGLoader.createShapes(svg.paths[0])[0];
          const largeCutout = SVGLoader.createShapes(svg.paths[1])[0];
          const outline = SVGLoader.createShapes(svg.paths[2])[0];
          outline.holes.push(smallCutout);
          outline.holes.push(largeCutout);
          setTrackShape(outline);
        });
      loader.load(ASSETS.shapes.beam,
        svg => {
          const outline = SVGLoader.createShapes(svg.paths[0])[0];
          range(1, 6).map(i => {
            const hole = SVGLoader.createShapes(svg.paths[i])[0];
            outline.holes.push(hole);
          });
          setBeamShape(outline);
        });
      loader.load(ASSETS.shapes.column,
        svg => {
          const outline = SVGLoader.createShapes(svg.paths[3])[0];
          range(3).map(i => {
            const hole = SVGLoader.createShapes(svg.paths[i])[0];
            outline.holes.push(hole);
          });
          setColumnShape(outline);
        });
      loader.load(ASSETS.shapes.zAxis,
        svg => {
          const hole = SVGLoader.createShapes(svg.paths[1])[0];
          const outline = SVGLoader.createShapes(svg.paths[0])[0];
          outline.holes.push(hole);
          setZAxisShape(outline);
        });
    }
  });
  const aluminumTexture = useTexture(ASSETS.textures.aluminum + "?=bot");
  aluminumTexture.wrapS = RepeatWrapping;
  aluminumTexture.wrapT = RepeatWrapping;
  aluminumTexture.repeat.set(0.01, 0.0003);

  const yBeltPath = () => {
    const radius = 12;
    const path = new Shape();
    path.moveTo(0, 0);
    path.lineTo(0, y + 30);
    path.arc(radius, -5, radius, Math.PI, Math.PI / 2, true);
    path.lineTo(45, y + 30);
    path.arc(0, 10, 10, -Math.PI / 2, Math.PI / 4);
    path.lineTo(0, y + 100);
    path.arc(radius, 5, radius, (-3 / 4) * Math.PI, Math.PI, true);
    path.lineTo(0, botSizeY + 220);
    path.lineTo(-2, botSizeY + 220);
    path.lineTo(-2, y + 100);
    path.arc(radius, 4, radius, Math.PI, (-3 / 4) * Math.PI);
    path.lineTo(45, y + 50);
    path.arc(0, -10, 8, Math.PI / 4, -Math.PI / 2, true);
    path.lineTo(radius, y + 40);
    path.arc(-2, -radius, radius, Math.PI / 2, Math.PI);
    path.lineTo(-2, 0);
    return path;
  };
  const distanceToSoil = -props.getZ(x, y) - zDir * z;

  const defaultTrailWidth = config.perspective ? 500 : 0.1;

  const airTubeEndPosition = (kitVersion: string): [number, number, number] => {
    switch (kitVersion) {
      case "v1.7":
        return [...gardenXY(x + 80, y + 100), zZero - zDir * z + 245];
      case "v1.8":
      default:
        return [...gardenXY(x + 35, y), zZero - zDir * z + 245];
    }
  };

  const vacuumPumpCoverRotation = (kitVersion: string): [number, number, number] => {
    switch (kitVersion) {
      case "v1.7":
        return [0, 0, Math.PI / 2];
      case "v1.8":
      default:
        return [0, 0, -Math.PI / 2];
    }
  };

  const vacuumPumpCoverPosition = (kitVersion: string): [number, number, number] => {
    switch (kitVersion) {
      case "v1.7":
        return [...gardenXY(x + 12, y + 55), zZero - zDir * z + 490];
      case "v1.8":
      default:
        return [...gardenXY(x + 2, y + 110), zZero + columnLength + 25];
    }
  };

  const cameraMountPosition = new THREE.Vector3(
    ...gardenXY(x + cameraMountOffset.x, y + cameraMountOffset.y),
    zZero - zDir * z - 140 + zGantryOffset + 20,
  );

  return <Group name={"bot"}
    visible={props.config.bot && props.activeFocus != "Planter bed"}>
    {[0 - extrusionWidth, bedWidthOuter].map((y, index) => {
      const bedColumnYOffset =
        (tracks ? 0 : extrusionWidth) * (index == 0 ? 1 : -1);
      return <Group key={y}>
        <Extrude name={"columns"}
          castShadow={true}
          args={[
            columnShape,
            { steps: 1, depth: columnLength, bevelEnabled: false },
          ]}
          position={[
            ...outerXY(x - extrusionWidth - 12, y + bedColumnYOffset),
            30,
          ]}
          rotation={[0, 0, Math.PI / 2]}>
          <MeshPhongMaterial
            color={"white"}
            map={aluminumTexture}
            side={DoubleSide} />
        </Extrude>
        <Mesh name={index == 0 ? "leftBracket" : "rightBracket"}
          position={[
            ...outerXY(
              x - extrusionWidth - 12,
              y - (index == 0 ? 0 : 170) + bedColumnYOffset),
            columnLength - 30,
          ]}
          rotation={[Math.PI / 2, Math.PI / 2, 0]}
          scale={1000}
          geometry={index == 0
            ? leftBracket.nodes[PartName.leftBracket].geometry
            : rightBracket.nodes[PartName.rightBracket].geometry}>
          <MeshPhongMaterial color={"silver"} side={DoubleSide} />
        </Mesh>
        <Mesh name={index == 0 ? "leftMotor" : "rightMotor"}
          position={[
            ...outerXY(
              x - (index == 0 ? 47 : 77),
              y - (index == 0 ? 0 : -20) + bedColumnYOffset),
            columnLength + 70,
          ]}
          rotation={[Math.PI / 2, (index == 0 ? Math.PI : 0), Math.PI / 2]}
          scale={1000}
          geometry={undefined}
          material={undefined} />
        <Mesh name={index == 0 ? "leftMotor" : "rightMotor"}
          position={[
            ...outerXY(
              x - 68,
              y - (index == 0 ? 5 : -25) + bedColumnYOffset),
            columnLength + 80,
          ]}
          rotation={[0, Math.PI, (index == 0 ? 0 : Math.PI)]}
          scale={1000}
          geometry={
            horizontalMotorHousing.nodes[PartName.horizontalMotorHousing].geometry}>
          <MeshPhongMaterial color={"silver"} side={DoubleSide} />
        </Mesh>
        <Cylinder name={"motorPulley"}
          args={[8, 8, 40]}
          position={[
            ...outerXY(
              x - 63,
              y - (index == 0 ? 5 : -25) + bedColumnYOffset),
            columnLength + 55,
          ]}
          rotation={[0, 0, 0]}>
          <MeshPhongMaterial color={"#999"} />
        </Cylinder>
        <Extrude name={"tracks"} visible={tracks}
          castShadow={true}
          args={[
            trackShape,
            { steps: 1, depth: botSizeX + xTrackPadding, bevelEnabled: false },
          ]}
          position={[
            ...outerXY(
              index == 0
                ? botSizeX + xTrackPadding / 2
                : -xTrackPadding / 2,
              y + (index == 0 ? 2.5 : 17.5)),
            2,
          ]}
          rotation={[
            index == 0 ? -Math.PI / 2 : -Math.PI / 2,
            index == 0 ? -Math.PI / 2 : Math.PI / 2,
            0,
          ]}>
          <MeshPhongMaterial
            color={"white"}
            map={aluminumTexture}
            side={DoubleSide} />
        </Extrude>
        <Mesh name={"xStopMin"}
          position={[
            ...outerXY(-132, y + 10 + bedColumnYOffset),
            2 + (index == 0 ? 0 : 5),
          ]}
          rotation={[
            0,
            index == 0 ? 0 : Math.PI,
            (index == 0 ? 1 : -1) * Math.PI / 2,
          ]}
          scale={1000}
          geometry={beltClip.nodes[PartName.beltClip].geometry}>
          <MeshPhongMaterial color={"silver"} />
        </Mesh>
        <Mesh name={"xStopMax"}
          position={[
            ...outerXY(botSizeX - 5 + xTrackPadding / 2,
              y + 10 + bedColumnYOffset),
            2 + (index == 0 ? 5 : 0),
          ]}
          rotation={[
            0,
            index == 0 ? Math.PI : 0,
            (index == 0 ? 1 : -1) * Math.PI / 2,
          ]}
          scale={1000}
          geometry={beltClip.nodes[PartName.beltClip].geometry}>
          <MeshPhongMaterial color={"silver"} />
        </Mesh>
        <GantryWheelPlateComponent name={"gantryWheelPlate"}
          position={[
            ...outerXY(
              x - 42,
              y + (index == 0 ? 0 : extrusionWidth + 5)
              - 2 - (index == 0 ? 1 : 0)
              + bedColumnYOffset),
            -30,
          ]}
          rotation={[0, 0, Math.PI / 2 + (index == 0 ? Math.PI : 0)]}
          scale={[1000, 1000 * (index == 0 ? -1 : 1), 1000]} />
      </Group>;
    })}
    <Mesh name={"xCCMount"}
      position={[
        ...outerXY(x - 32, -12),
        -40,
      ]}
      rotation={[0, 0, Math.PI / 2]}
      scale={1000}
      geometry={xAxisCCMount.nodes[PartName.xAxisCCMount].geometry}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    <CableCarrierX config={config} configPosition={props.configPosition} />
    <CrossSlideComponent name={"crossSlide"}
      position={[
        ...gardenXY(x - 1.5, y + 5),
        columnLength + 105,
      ]}
      rotation={[0, 0, Math.PI / 2]}
      scale={1000} />
    <Extrude name={"z-axis"}
      castShadow={true}
      args={[
        zAxisShape,
        { steps: 1, depth: zAxisLength, bevelEnabled: false },
      ]}
      position={[
        ...gardenXY(x, y + utmRadius),
        zZero - zDir * z,
      ]}
      rotation={[0, 0, 0]}>
      <MeshPhongMaterial color={"white"} map={aluminumTexture} side={DoubleSide} />
    </Extrude>
    <Group name={"zMotor"}>
      <Mesh name={"zMotorHousing"}
        position={[
          ...gardenXY(x + 4, y + utmRadius - 47),
          zZero - zDir * z + zAxisLength - 80,
        ]}
        rotation={[0, 0, Math.PI]}
        scale={1000}
        geometry={housingVertical.nodes[PartName.housingVertical].geometry}>
        <MeshPhongMaterial color={"silver"} />
      </Mesh>
      <Mesh name={"zMotor"}
        position={[
          ...gardenXY(x + 10, y + utmRadius - 5),
          zZero - zDir * z + zAxisLength - 140,
        ]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={1000}
        geometry={undefined}
        material={undefined} />
      <Mesh name={"zMotorMount"}
        position={[
          ...gardenXY(x + 5, y + utmRadius - 65),
          zZero - zDir * z + zAxisLength - 80,
        ]}
        rotation={[0, 0, Math.PI]}
        scale={1000}
        geometry={zAxisMotorMount.nodes[PartName.zAxisMotorMount].geometry}>
        <MeshPhongMaterial color={"silver"} side={DoubleSide} />
      </Mesh>
      <Cylinder name={"motorShaft"}
        args={[2.5, 2.5, 40]}
        position={[
          ...gardenXY(x + 5, y + utmRadius - 65),
          zZero - zDir * z + zAxisLength - 80,
        ]}
        rotation={[Math.PI / 2, 0, 0]}>
        <MeshPhongMaterial color={"#999"} />
      </Cylinder>
    </Group>
    <Mesh name={"shaftCoupler"}
      position={[
        ...gardenXY(x + 5, y - 30),
        zZero - zDir * z + zAxisLength - 120,
      ]}
      rotation={[0, 0, 0]}
      scale={1000}
      geometry={undefined}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    <Cylinder name={"shaftCoupler"}
      args={[10, 10, 25]}
      position={[
        ...gardenXY(x + 5, y - 30),
        zZero - zDir * z + zAxisLength - 120 + 25 / 2,
      ]}
      rotation={[Math.PI / 2, 0, 0]}>
      <MeshPhongMaterial color={"silver"} />
    </Cylinder>
    <Cylinder name={"leadscrew"}
      material-color={"#555"}
      args={[4, 4, zAxisLength - 200]}
      position={[
        ...gardenXY(x + 6, y - 30),
        zZero - zDir * z + zAxisLength / 2,
      ]}
      rotation={[Math.PI / 2, 0, 0]} />
    <CableCarrierSupportVertical
      config={config}
      configPosition={props.configPosition} />
    <CableCarrierZ config={config} configPosition={props.configPosition} />
    <Mesh name={"zStopMax"}
      position={[
        ...gardenXY(x - 5, y + utmRadius + extrusionWidth / 2),
        zZero - zDir * z - 30 + zGantryOffset,
      ]}
      rotation={[0, Math.PI / 2, 0]}
      scale={1000}
      geometry={zStop.nodes[PartName.zStop].geometry}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    <Mesh name={"zStopMin"}
      position={[
        ...gardenXY(x - 5, y + utmRadius + extrusionWidth / 2),
        zZero - zDir * z + botSizeZ + 140 + zGantryOffset,
      ]}
      rotation={[0, Math.PI / 2, 0]}
      scale={1000}
      geometry={zStop.nodes[PartName.zStop].geometry}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    <Mesh name={"vacuumPump"}
      position={[
        ...gardenXY(x + 28, y),
        zZero - zDir * z + 40,
      ]}
      rotation={[0, 0, Math.PI / 2]}
      scale={1000}
      geometry={undefined}
      material={undefined} />
    <Tube name={"air-tube"}
      castShadow={true}
      receiveShadow={true}
      args={[easyCubicBezierCurve3(
        [
          ...gardenXY(x + 28, y),
          zZero - zDir * z + 35,
        ],
        [0, 0, 100],
        [0, 0, -200],
        airTubeEndPosition(config.kitVersion),
      ), 20, 5, 8]}>
      <MeshPhongMaterial
        color={"white"}
        transparent={true}
        opacity={0.75}
      />
    </Tube>
    <VacuumPumpCoverComponent
      rotation={vacuumPumpCoverRotation(config.kitVersion)}
      scale={1000}
      position={vacuumPumpCoverPosition(config.kitVersion)} />
    <Group name={"camera"}
      rotation={[Math.PI, 0, 0]}
      position={cameraMountPosition}>
      <Mesh name={"cameraMount"}
        rotation={[0, 0, 0]}
        position={[0, 0, -40]}
        scale={1000}
        geometry={cameraMountHalf.nodes[PartName.cameraMountHalf].geometry}>
        <MeshPhongMaterial color={"silver"} />
      </Mesh>
      <Mesh name={"cameraMount"}
        rotation={[0, Math.PI, 0]}
        scale={1000}
        geometry={cameraMountHalf.nodes[PartName.cameraMountHalf].geometry}>
        <MeshPhongMaterial color={"silver"} />
      </Mesh>
    </Group>
    <CameraView
      config={config}
      configPosition={props.configPosition}
      cameraMountPosition={cameraMountPosition}
      distanceToSoil={distanceToSoil} />
    <Trail
      width={trail ? defaultTrailWidth : 0}
      attenuation={t => Math.pow(t, 3)}
      color={"red"}
      length={100}
      decay={0.5}
      local={false}
      stride={0}
      interval={1}>
      <Group name={"UTM"}
        position={[
          ...gardenXY(x + 11, y),
          zZero - zDir * z + utmHeight / 2 - 19,
        ]}
        rotation={[0, 0, Math.PI / 2]}
        scale={1000}>
        <Mesh
          geometry={utm.nodes.M5_Barb.geometry}
          material={utm.materials.PaletteMaterial001}
          position={[0.015, 0.009, 0.036]}
          rotation={[0, 0, 2.094]} />
      </Group>
    </Trail>
    <Cylinder
      visible={laser}
      material-color={"red"}
      args={[5, 5, distanceToSoil]}
      position={[
        ...gardenXY(x, y),
        zZero - zDir * z - distanceToSoil / 2,
      ]}
      rotation={[Math.PI / 2, 0, 0]} />
    <GantryBeam
      config={config}
      configPosition={props.configPosition}
      aluminumTexture={aluminumTexture}
      beamShape={beamShape} />
    <CableCarrierSupportHorizontal
      config={config}
      configPosition={props.configPosition} />
    <CableCarrierY config={config} configPosition={props.configPosition} />
    <Mesh name={"yStopMin"}
      position={[
        ...outerXY(x - extrusionWidth + 2, bedYOffset - 125),
        columnLength + 40 + extrusionWidth * 3,
      ]}
      rotation={[0, 0, Math.PI]}
      scale={1000}
      geometry={beltClip.nodes[PartName.beltClip].geometry}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    <Extrude name={"yBelt"}
      args={[
        yBeltPath(),
        { steps: 1, depth: 6, bevelEnabled: false },
      ]}
      position={[
        ...gardenXY(x - 14.5, -100),
        columnLength + 100,
      ]}
      rotation={[0, -Math.PI / 2, 0]}>
      <MeshPhongMaterial color={distinguishableBlack} />
    </Extrude>
    <Mesh name={"yStopMax"}
      position={[
        ...outerXY(x - extrusionWidth + 2, botSizeY + bedYOffset + 135),
        columnLength + 40 + extrusionWidth * 3 + 5,
      ]}
      rotation={[0, Math.PI, 0]}
      scale={1000}
      geometry={beltClip.nodes[PartName.beltClip].geometry}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    <Solenoid config={config} configPosition={props.configPosition} />
    <ElectronicsBox config={config} configPosition={props.configPosition} />
    <Tools
      dispatch={props.dispatch}
      config={config}
      configPosition={props.configPosition}
      getZ={props.getZ}
      toolSlots={props.toolSlots}
      mountedToolName={props.mountedToolName} />
    {config.waterFlow &&
      <WateringAnimations
        waterFlow={config.waterFlow}
        config={config}
        configPosition={props.configPosition}
        getZ={props.getZ} />}
    <PowerSupply config={config} />
    <XAxisWaterTube config={config} />
    <Bounds config={config} configPosition={props.configPosition} />
  </Group>;
};
