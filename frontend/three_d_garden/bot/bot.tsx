/* eslint-disable complexity */
import React, { useEffect, useState } from "react";
import * as THREE from "three";
import {
  Cylinder, Extrude, Trail, Tube, useGLTF, useTexture,
} from "@react-three/drei";
import { DoubleSide, Shape, RepeatWrapping } from "three";
import {
  easyCubicBezierCurve3, threeSpace,
  zDir as zDirFunc,
  zZero as zZeroFunc,
} from "../helpers";
import { Config } from "../config";
import { GLTF } from "three-stdlib";
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
  CableCarrierVertical,
  CableCarrierZ,
  CableCarrierY,
  CableCarrierHorizontal,
  GantryBeam,
} from "./components";
import { SlotWithTool } from "../../resources/interfaces";

export const extrusionWidth = 20;
const utmRadius = 35;
export const utmHeight = 35;
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
  activeFocus: string;
  getZ(x: number, y: number): number;
  toolSlots?: SlotWithTool[];
  mountedToolName?: string | undefined;
  dispatch?: Function;
}

export const Bot = (props: FarmbotModelProps) => {
  const config = props.config;
  const {
    x, y, z, botSizeX, botSizeY, botSizeZ, trail, laser,
    bedXOffset, bedYOffset, bedLengthOuter, bedWidthOuter, tracks,
    columnLength, zAxisLength, zGantryOffset,
  } = props.config;
  const zZero = zZeroFunc(config);
  const zDir = zDirFunc(config);
  const gantryWheelPlate =
    useGLTF(ASSETS.models.gantryWheelPlate, LIB_DIR) as GantryWheelPlateFull;
  const GantryWheelPlateComponent = GantryWheelPlate(gantryWheelPlate);
  const leftBracket = useGLTF(ASSETS.models.leftBracket, LIB_DIR) as LeftBracket;
  const rightBracket = useGLTF(ASSETS.models.rightBracket, LIB_DIR) as RightBracket;
  const crossSlide = useGLTF(ASSETS.models.crossSlide, LIB_DIR) as CrossSlideFull;
  const CrossSlideComponent = CrossSlide(crossSlide);
  const beltClip = useGLTF(ASSETS.models.beltClip, LIB_DIR) as BeltClip;
  const zStop = useGLTF(ASSETS.models.zStop, LIB_DIR) as ZStop;
  const utm = useGLTF(ASSETS.models.utm, LIB_DIR) as UTM;
  const housingVertical = useGLTF(
    ASSETS.models.housingVertical, LIB_DIR) as HousingVertical;
  const horizontalMotorHousing = useGLTF(
    ASSETS.models.horizontalMotorHousing, LIB_DIR) as HorizontalMotorHousing;
  const zAxisMotorMount = useGLTF(
    ASSETS.models.zAxisMotorMount, LIB_DIR) as ZAxisMotorMount;
  const vacuumPumpCover = useGLTF(
    ASSETS.models.vacuumPumpCover, LIB_DIR) as VacuumPumpCoverFull;
  const VacuumPumpCoverComponent = VacuumPumpCover(vacuumPumpCover);
  const cameraMountHalf = useGLTF(
    ASSETS.models.cameraMountHalf, LIB_DIR) as CameraMountHalf;
  const xAxisCCMount = useGLTF(ASSETS.models.xAxisCCMount, LIB_DIR) as XAxisCCMount;
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
        return [
          threeSpace(x + 80, bedLengthOuter) + bedXOffset,
          threeSpace(y + 100, bedWidthOuter) + bedYOffset,
          zZero - zDir * z + 245,
        ];
      case "v1.8":
      default:
        return [
          threeSpace(x + 35, bedLengthOuter) + bedXOffset,
          threeSpace(y, bedWidthOuter) + bedYOffset,
          zZero - zDir * z + 245,
        ];
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
        return [
          threeSpace(x + 12, bedLengthOuter) + bedXOffset,
          threeSpace(y + 55, bedWidthOuter) + bedYOffset,
          zZero - zDir * z + 490,
        ];
      case "v1.8":
      default:
        return [
          threeSpace(x + 2, bedLengthOuter) + bedXOffset,
          threeSpace(y + 110, bedWidthOuter) + bedYOffset,
          zZero + columnLength + 25,
        ];
    }
  };

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
            threeSpace(x - extrusionWidth - 12, bedLengthOuter) + bedXOffset,
            threeSpace(y + bedColumnYOffset, bedWidthOuter),
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
            threeSpace(x - extrusionWidth - 12, bedLengthOuter) + bedXOffset,
            threeSpace(y - (index == 0 ? 0 : 170) + bedColumnYOffset,
              bedWidthOuter),
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
            threeSpace(x - (index == 0 ? 47 : 77), bedLengthOuter) + bedXOffset,
            threeSpace(y - (index == 0 ? 0 : -20) + bedColumnYOffset,
              bedWidthOuter),
            columnLength + 70,
          ]}
          rotation={[Math.PI / 2, (index == 0 ? Math.PI : 0), Math.PI / 2]}
          scale={1000}
          geometry={undefined}
          material={undefined} />
        <Mesh name={index == 0 ? "leftMotor" : "rightMotor"}
          position={[
            threeSpace(x - 68, bedLengthOuter) + bedXOffset,
            threeSpace(y - (index == 0 ? 5 : -25) + bedColumnYOffset,
              bedWidthOuter),
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
            threeSpace(x - 63, bedLengthOuter) + bedXOffset,
            threeSpace(y - (index == 0 ? 5 : -25) + bedColumnYOffset,
              bedWidthOuter),
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
            threeSpace(index == 0
              ? botSizeX + xTrackPadding / 2
              : -xTrackPadding / 2, bedLengthOuter) + bedXOffset,
            threeSpace(y + (index == 0 ? 2.5 : 17.5), bedWidthOuter),
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
            threeSpace(-132, bedLengthOuter) + bedXOffset,
            threeSpace(y + 10 + bedColumnYOffset, bedWidthOuter),
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
            threeSpace(botSizeX - 5 + xTrackPadding / 2, bedLengthOuter) + bedXOffset,
            threeSpace(y + 10 + bedColumnYOffset, bedWidthOuter),
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
            threeSpace(x - 42, bedLengthOuter) + bedXOffset,
            threeSpace(
              y + (index == 0 ? 0 : extrusionWidth + 5)
              - 2 - (index == 0 ? 1 : 0)
              + bedColumnYOffset,
              bedWidthOuter),
            -30,
          ]}
          rotation={[0, 0, Math.PI / 2 + (index == 0 ? Math.PI : 0)]}
          scale={[1000, 1000 * (index == 0 ? -1 : 1), 1000]} />
      </Group>;
    })}
    <Mesh name={"xCCMount"}
      position={[
        threeSpace(x - 32, bedLengthOuter) + bedXOffset,
        threeSpace(-12, bedWidthOuter),
        -40,
      ]}
      rotation={[0, 0, Math.PI / 2]}
      scale={1000}
      geometry={xAxisCCMount.nodes[PartName.xAxisCCMount].geometry}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    <CableCarrierX config={config} />
    <CrossSlideComponent name={"crossSlide"}
      position={[
        threeSpace(x - 1.5, bedLengthOuter) + bedXOffset,
        threeSpace(y + 5, bedWidthOuter) + bedYOffset,
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
        threeSpace(x, bedLengthOuter) + bedXOffset,
        threeSpace(y + utmRadius, bedWidthOuter) + bedYOffset,
        zZero - zDir * z,
      ]}
      rotation={[0, 0, 0]}>
      <MeshPhongMaterial color={"white"} map={aluminumTexture} side={DoubleSide} />
    </Extrude>
    <Group name={"zMotor"}>
      <Mesh name={"zMotorHousing"}
        position={[
          threeSpace(x + 4, bedLengthOuter) + bedXOffset,
          threeSpace(y + utmRadius - 47, bedWidthOuter) + bedYOffset,
          zZero - zDir * z + zAxisLength - 80,
        ]}
        rotation={[0, 0, Math.PI]}
        scale={1000}
        geometry={housingVertical.nodes[PartName.housingVertical].geometry}>
        <MeshPhongMaterial color={"silver"} />
      </Mesh>
      <Mesh name={"zMotor"}
        position={[
          threeSpace(x + 10, bedLengthOuter) + bedXOffset,
          threeSpace(y + utmRadius - 5, bedWidthOuter) + bedYOffset,
          zZero - zDir * z + zAxisLength - 140,
        ]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={1000}
        geometry={undefined}
        material={undefined} />
      <Mesh name={"zMotorMount"}
        position={[
          threeSpace(x + 5, bedLengthOuter) + bedXOffset,
          threeSpace(y + utmRadius - 65, bedWidthOuter) + bedYOffset,
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
          threeSpace(x + 5, bedLengthOuter) + bedXOffset,
          threeSpace(y + utmRadius - 65, bedWidthOuter) + bedYOffset,
          zZero - zDir * z + zAxisLength - 80,
        ]}
        rotation={[Math.PI / 2, 0, 0]}>
        <MeshPhongMaterial color={"#999"} />
      </Cylinder>
    </Group>
    <Mesh name={"shaftCoupler"}
      position={[
        threeSpace(x + 5, bedLengthOuter) + bedXOffset,
        threeSpace(y - 30, bedWidthOuter) + bedYOffset,
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
        threeSpace(x + 5, bedLengthOuter) + bedXOffset,
        threeSpace(y - 30, bedWidthOuter) + bedYOffset,
        zZero - zDir * z + zAxisLength - 120 + 25 / 2,
      ]}
      rotation={[Math.PI / 2, 0, 0]}>
      <MeshPhongMaterial color={"silver"} />
    </Cylinder>
    <Cylinder name={"leadscrew"}
      material-color={"#555"}
      args={[4, 4, zAxisLength - 200]}
      position={[
        threeSpace(x + 6, bedLengthOuter) + bedXOffset,
        threeSpace(y - 30, bedWidthOuter) + bedYOffset,
        zZero - zDir * z + zAxisLength / 2,
      ]}
      rotation={[Math.PI / 2, 0, 0]} />
    <CableCarrierVertical config={config} />
    <CableCarrierZ config={config} />
    <Mesh name={"zStopMax"}
      position={[
        threeSpace(x - 5, bedLengthOuter) + bedXOffset,
        threeSpace(y + utmRadius + extrusionWidth / 2, bedWidthOuter) + bedYOffset,
        zZero - zDir * z - 30 + zGantryOffset,
      ]}
      rotation={[0, Math.PI / 2, 0]}
      scale={1000}
      geometry={zStop.nodes[PartName.zStop].geometry}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    <Mesh name={"zStopMin"}
      position={[
        threeSpace(x - 5, bedLengthOuter) + bedXOffset,
        threeSpace(y + utmRadius + extrusionWidth / 2, bedWidthOuter) + bedYOffset,
        zZero - zDir * z + botSizeZ + 140 + zGantryOffset,
      ]}
      rotation={[0, Math.PI / 2, 0]}
      scale={1000}
      geometry={zStop.nodes[PartName.zStop].geometry}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    <Mesh name={"vacuumPump"}
      position={[
        threeSpace(x + 28, bedLengthOuter) + bedXOffset,
        threeSpace(y, bedWidthOuter) + bedYOffset,
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
          threeSpace(x + 28, bedLengthOuter) + bedXOffset,
          threeSpace(y, bedWidthOuter) + bedYOffset,
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
      position={[
        threeSpace(x + 23, bedLengthOuter) + bedXOffset,
        threeSpace(y + 25 + extrusionWidth / 2, bedWidthOuter) + bedYOffset,
        zZero - zDir * z - 140 + zGantryOffset,
      ]}>
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
          threeSpace(x + 11, bedLengthOuter) + bedXOffset,
          threeSpace(y, bedWidthOuter) + bedYOffset,
          zZero - zDir * z + utmHeight / 2 - 18,
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
        threeSpace(x, bedLengthOuter) + bedXOffset,
        threeSpace(y, bedWidthOuter) + bedYOffset,
        zZero - zDir * z - distanceToSoil / 2,
      ]}
      rotation={[Math.PI / 2, 0, 0]} />
    <GantryBeam
      config={config}
      aluminumTexture={aluminumTexture}
      beamShape={beamShape} />
    <CableCarrierHorizontal config={config} />
    <CableCarrierY config={config} />
    <Mesh name={"yStopMin"}
      position={[
        threeSpace(x - extrusionWidth + 2, bedLengthOuter) + bedXOffset,
        threeSpace(bedYOffset - 125, bedWidthOuter),
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
        threeSpace(x - 14.5, bedLengthOuter) + bedXOffset,
        threeSpace(-100, bedWidthOuter) + bedYOffset,
        columnLength + 100,
      ]}
      rotation={[0, -Math.PI / 2, 0]}>
      <MeshPhongMaterial color={distinguishableBlack} />
    </Extrude>
    <Mesh name={"yStopMax"}
      position={[
        threeSpace(x - extrusionWidth + 2, bedLengthOuter) + bedXOffset,
        threeSpace(botSizeY + bedYOffset + 135, bedWidthOuter),
        columnLength + 40 + extrusionWidth * 3 + 5,
      ]}
      rotation={[0, Math.PI, 0]}
      scale={1000}
      geometry={beltClip.nodes[PartName.beltClip].geometry}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    <Solenoid config={config} />
    <ElectronicsBox config={config} />
    <Tools
      dispatch={props.dispatch}
      config={config}
      getZ={props.getZ}
      toolSlots={props.toolSlots}
      mountedToolName={props.mountedToolName} />
    <PowerSupply config={config} />
    <XAxisWaterTube config={config} />
    <Bounds config={config} />
  </Group>;
};
