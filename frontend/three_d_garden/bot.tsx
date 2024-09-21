/* eslint-disable complexity */
import React, { useEffect, useState } from "react";
import * as THREE from "three";
import {
  Cylinder, Extrude, Line, Trail, Tube, useGLTF, useTexture,
} from "@react-three/drei";
import { DoubleSide, Shape, RepeatWrapping } from "three";
import {
  easyCubicBezierCurve3, threeSpace, zDir, zZero as zZeroFunc,
} from "./helpers";
import { Config } from "./config";
import { GLTF } from "three-stdlib";
import { ASSETS, ElectronicsBoxMaterial, LIB_DIR, PartName } from "./constants";
import { SVGLoader } from "three/examples/jsm/Addons.js";
import { range } from "lodash";
import { CrossSlide, CrossSlideFull } from "./parts/cross_slide";
import { GantryWheelPlate, GantryWheelPlateFull } from "./parts/gantry_wheel_plate";
import { RotaryTool, RotaryToolFull } from "./parts/rotary_tool";
import { DistanceIndicator } from "./distance_indicator";
import { VacuumPumpCover, VacuumPumpCoverFull } from "./parts/vacuum_pump_cover";
import { SoilSensor, SoilSensorFull } from "./parts/soil_sensor";
import {
  SeedTroughAssembly, SeedTroughAssemblyFull,
} from "./parts/seed_trough_assembly";
import { SeedTroughHolder, SeedTroughHolderFull } from "./parts/seed_trough_holder";
import { PowerSupply } from "./power_supply";
import { XAxisWaterTube } from "./x_axis_water_tube";
import { Group, Mesh, MeshPhongMaterial } from "./components";
import { IColor } from "../settings/pin_bindings/model";

const extrusionWidth = 20;
const utmRadius = 35;
const utmHeight = 35;
const xTrackPadding = 280;

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
type CCHorizontal = GLTF & {
  nodes: { [PartName.ccHorizontal]: THREE.Mesh };
  materials: never;
}
type CCVertical = GLTF & {
  nodes: { [PartName.ccVertical]: THREE.Mesh };
  materials: never;
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
type Toolbay3 = GLTF & {
  nodes: {
    [PartName.toolbay3]: THREE.Mesh;
    [PartName.toolbay3Logo]: THREE.Mesh;
  };
  materials: never;
}
type WateringNozzle = GLTF & {
  nodes: { [PartName.wateringNozzle]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}
type SeedBin = GLTF & {
  nodes: { [PartName.seedBin]: THREE.Mesh };
  materials: never;
}
type SeedTray = GLTF & {
  nodes: { [PartName.seedTray]: THREE.Mesh };
  materials: never;
}
type CameraMountHalf = GLTF & {
  nodes: { [PartName.cameraMountHalf]: THREE.Mesh };
  materials: never;
}
type Box = GLTF & {
  nodes: {
    Electronics_Box: THREE.Mesh;
    Electronics_Box_Gasket: THREE.Mesh;
    Electronics_Box_Lid: THREE.Mesh;
  };
  materials: {
    [ElectronicsBoxMaterial.box]: THREE.MeshStandardMaterial;
    [ElectronicsBoxMaterial.gasket]: THREE.MeshStandardMaterial;
    [ElectronicsBoxMaterial.lid]: THREE.MeshStandardMaterial;
  };
}
type Btn = GLTF & {
  nodes: {
    ["Push_Button_-_Red"]: THREE.Mesh;
  };
  materials: {
    [ElectronicsBoxMaterial.button]: THREE.MeshStandardMaterial;
  };
}
type Led = GLTF & {
  nodes: {
    LED: THREE.Mesh;
  };
  materials: {
    [ElectronicsBoxMaterial.led]: THREE.MeshStandardMaterial;
  };
}
type Pi = GLTF & {
  nodes: { [PartName.pi]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}
type Farmduino = GLTF & {
  nodes: { [PartName.farmduino]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}
type Solenoid = GLTF & {
  nodes: { [PartName.solenoid]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}
type XAxisCCMount = GLTF & {
  nodes: { [PartName.xAxisCCMount]: THREE.Mesh };
  materials: never;
}

Object.values(ASSETS.models).map(model => useGLTF.preload(model, LIB_DIR));

const ccPath =
  (axisLength: number, y: number, curveDia: number, isX?: boolean) => {
    const lowerLength = (y + axisLength + 180) / 2;
    const upperLength = lowerLength - y;
    const outerRadius = curveDia / 2;
    const height = isX ? 15 : 20;
    const innerRadius = outerRadius - height;

    const path = new Shape();
    path.moveTo(y + 20, 0);
    path.lineTo(y + upperLength, 0);
    path.arc(0, outerRadius, outerRadius, -Math.PI / 2, Math.PI / 2);
    path.lineTo(0, curveDia);
    path.lineTo(0, curveDia - 5);
    path.lineTo(20, curveDia - height);
    path.lineTo(lowerLength, curveDia - height);
    path.arc(0, -innerRadius, innerRadius, Math.PI / 2, -Math.PI / 2, true);
    if (isX) {
      path.lineTo(y + 20, height - 1);
      path.lineTo(y, 5);
      path.lineTo(y, 0);
    } else {
      path.lineTo(y, height - 1);
      path.lineTo(y, height - 5);
    }
    path.lineTo(y + 20, 0);
    return path;
  };

export interface FarmbotModelProps {
  config: Config;
  activeFocus: string;
}

export const Bot = (props: FarmbotModelProps) => {
  const config = props.config;
  const {
    x, y, z, botSizeX, botSizeY, botSizeZ, beamLength, trail, laser, soilHeight,
    bedXOffset, bedYOffset, bedLengthOuter, bedWidthOuter, tracks, zDimension,
    columnLength, zAxisLength, zGantryOffset, bedWallThickness, tool, bedHeight,
    cableCarriers, bounds,
  } = props.config;
  const zZero = zZeroFunc(props.config);
  const zero = {
    x: threeSpace(bedXOffset, bedLengthOuter),
    y: threeSpace(bedYOffset, bedWidthOuter),
    z: zZero,
  };
  const extents = {
    x: threeSpace(bedXOffset + botSizeX, bedLengthOuter),
    y: threeSpace(bedYOffset + botSizeY, bedWidthOuter),
    z: zZero + zDir * botSizeZ,
  };
  const zDip = (x: number, y: number): [number, number, number][] => [
    [x, y, extents.z],
    [x, y, zero.z],
    [x, y, extents.z],
  ];
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
  const ccHorizontal = useGLTF(ASSETS.models.ccHorizontal, LIB_DIR) as CCHorizontal;
  const ccVertical = useGLTF(ASSETS.models.ccVertical, LIB_DIR) as CCVertical;
  const housingVertical = useGLTF(
    ASSETS.models.housingVertical, LIB_DIR) as HousingVertical;
  const horizontalMotorHousing = useGLTF(
    ASSETS.models.horizontalMotorHousing, LIB_DIR) as HorizontalMotorHousing;
  const zAxisMotorMount = useGLTF(
    ASSETS.models.zAxisMotorMount, LIB_DIR) as ZAxisMotorMount;
  const toolbay3 = useGLTF(ASSETS.models.toolbay3, LIB_DIR) as Toolbay3;
  const rotaryTool = useGLTF(ASSETS.models.rotaryTool, LIB_DIR) as RotaryToolFull;
  const RotaryToolComponent = RotaryTool(rotaryTool);
  const vacuumPumpCover = useGLTF(
    ASSETS.models.vacuumPumpCover, LIB_DIR) as VacuumPumpCoverFull;
  const VacuumPumpCoverComponent = VacuumPumpCover(vacuumPumpCover);
  const seedBin = useGLTF(ASSETS.models.seedBin, LIB_DIR) as SeedBin;
  const seedTray = useGLTF(ASSETS.models.seedTray, LIB_DIR) as SeedTray;
  const seedTroughHolder = useGLTF(
    ASSETS.models.seedTroughHolder, LIB_DIR) as SeedTroughHolderFull;
  const SeedTroughHolderComponent = SeedTroughHolder(seedTroughHolder);
  const seedTroughAssembly = useGLTF(
    ASSETS.models.seedTroughAssembly, LIB_DIR) as SeedTroughAssemblyFull;
  const SeedTroughAssemblyComponent = SeedTroughAssembly(seedTroughAssembly);
  const soilSensor = useGLTF(ASSETS.models.soilSensor, LIB_DIR) as SoilSensorFull;
  const SoilSensorComponent = SoilSensor(soilSensor);
  const wateringNozzle = useGLTF(
    ASSETS.models.wateringNozzle, LIB_DIR) as WateringNozzle;
  const cameraMountHalf = useGLTF(
    ASSETS.models.cameraMountHalf, LIB_DIR) as CameraMountHalf;
  const box = useGLTF(ASSETS.models.box, LIB_DIR) as Box;
  const btn = useGLTF(ASSETS.models.btn, LIB_DIR) as Btn;
  const led = useGLTF(ASSETS.models.led, LIB_DIR) as Led;
  const pi = useGLTF(ASSETS.models.pi, LIB_DIR) as Pi;
  const farmduino = useGLTF(ASSETS.models.farmduino, LIB_DIR) as Farmduino;
  const solenoid = useGLTF(ASSETS.models.solenoid, LIB_DIR) as Solenoid;
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
  const distanceToSoil = soilHeight + zDir * z;
  const bedCCSupportHeight = Math.min(150, bedHeight / 2);
  const isJr = props.config.sizePreset == "Jr";
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
            threeSpace(botSizeX + 128, bedLengthOuter) + bedXOffset,
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
    <Extrude name={"xCC"} visible={cableCarriers}
      castShadow={true}
      args={[
        ccPath(botSizeX / 2, botSizeX / 2 - x + 20, bedCCSupportHeight - 40, true),
        { steps: 1, depth: 22, bevelEnabled: false },
      ]}
      position={[
        threeSpace(botSizeX / 2, bedLengthOuter) + bedXOffset,
        threeSpace((tracks ? 0 : extrusionWidth) - 15, bedWidthOuter),
        -40,
      ]}
      rotation={[-Math.PI / 2, -Math.PI, 0 * Math.PI]}>
      <MeshPhongMaterial color={"black"} />
    </Extrude>
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
        zZero + zDir * z,
      ]}
      rotation={[0, 0, 0]}>
      <MeshPhongMaterial color={"white"} map={aluminumTexture} side={DoubleSide} />
    </Extrude>
    <Group name={"zMotor"}>
      <Mesh name={"zMotorHousing"}
        position={[
          threeSpace(x + 4, bedLengthOuter) + bedXOffset,
          threeSpace(y + utmRadius - 47, bedWidthOuter) + bedYOffset,
          zZero + zDir * z + zAxisLength - 80,
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
          zZero + zDir * z + zAxisLength - 140,
        ]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={1000}
        geometry={undefined}
        material={undefined} />
      <Mesh name={"zMotorMount"}
        position={[
          threeSpace(x + 5, bedLengthOuter) + bedXOffset,
          threeSpace(y + utmRadius - 65, bedWidthOuter) + bedYOffset,
          zZero + zDir * z + zAxisLength - 80,
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
          zZero + zDir * z + zAxisLength - 80,
        ]}
        rotation={[Math.PI / 2, 0, 0]}>
        <MeshPhongMaterial color={"#999"} />
      </Cylinder>
    </Group>
    <Mesh name={"shaftCoupler"}
      position={[
        threeSpace(x + 5, bedLengthOuter) + bedXOffset,
        threeSpace(y - 30, bedWidthOuter) + bedYOffset,
        zZero + zDir * z + zAxisLength - 120,
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
        zZero + zDir * z + zAxisLength - 120 + 25 / 2,
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
        zZero + zDir * z + zAxisLength / 2,
      ]}
      rotation={[Math.PI / 2, 0, 0]} />
    <Group name={"ccVertical"}>
      {range((zAxisLength - 350) / 200).map(i =>
        <Mesh key={i}
          position={[
            threeSpace(x + 20, bedLengthOuter) + bedXOffset,
            threeSpace(y + 55, bedWidthOuter) + bedYOffset,
            zZero + zDir * z + i * 200 + 125,
          ]}
          rotation={[0, 0, Math.PI / 2]}
          scale={1000}
          geometry={ccVertical.nodes[PartName.ccVertical].geometry}>
          <MeshPhongMaterial color={"silver"} />
        </Mesh>)}
    </Group>
    <Extrude name={"zCC"} visible={cableCarriers}
      castShadow={true}
      args={[
        ccPath(botSizeZ + zGantryOffset - 100, z + zGantryOffset - 15, 87),
        { steps: 1, depth: 60, bevelEnabled: false },
      ]}
      position={[
        threeSpace(x - 41, bedLengthOuter) + bedXOffset,
        threeSpace(y - 25, bedWidthOuter) + bedYOffset,
        zZero + zDir * z + 125,
      ]}
      rotation={[Math.PI / 2, Math.PI, Math.PI / 2]}>
      <MeshPhongMaterial color={"black"} />
    </Extrude>
    <Mesh name={"zStopMax"}
      position={[
        threeSpace(x - 5, bedLengthOuter) + bedXOffset,
        threeSpace(y + utmRadius + extrusionWidth / 2, bedWidthOuter) + bedYOffset,
        zZero + zDir * z - 30 + zGantryOffset,
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
        zZero + zDir * z + botSizeZ + 140 + zGantryOffset,
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
        zZero + zDir * z + 40,
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
          zZero + zDir * z + 40,
        ],
        [0, 0, 100],
        [0, 0, -200],
        [
          threeSpace(x + 80, bedLengthOuter) + bedXOffset,
          threeSpace(y + 100, bedWidthOuter) + bedYOffset,
          zZero + zDir * z + 245,
        ],
      ), 20, 5, 8]}>
      <MeshPhongMaterial
        color={"white"}
        transparent={true}
        opacity={0.75}
      />
    </Tube>
    <VacuumPumpCoverComponent
      rotation={[0, 0, Math.PI / 2]}
      scale={1000}
      position={[
        threeSpace(x + 12, bedLengthOuter) + bedXOffset,
        threeSpace(y + 55, bedWidthOuter) + bedYOffset,
        zZero + zDir * z + 490,
      ]} />
    <Group name={"camera"}
      rotation={[Math.PI, 0, 0]}
      position={[
        threeSpace(x + 23, bedLengthOuter) + bedXOffset,
        threeSpace(y + 25 + extrusionWidth / 2, bedWidthOuter) + bedYOffset,
        zZero + zDir * z - 140 + zGantryOffset,
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
      width={trail ? 500 : 0}
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
          zZero + zDir * z + utmHeight / 2 - 18,
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
    <RotaryToolComponent name={"rotaryTool"} visible={tool == "rotaryTool"}
      position={[
        threeSpace(x + 11, bedLengthOuter) + bedXOffset,
        threeSpace(y, bedWidthOuter) + bedYOffset,
        zZero + zDir * z + utmHeight / 2 - 15,
      ]}
      rotation={[0, 0, Math.PI / 2]}
      scale={1000} />
    <Cylinder
      visible={laser}
      material-color={"red"}
      args={[5, 5, distanceToSoil]}
      position={[
        threeSpace(x, bedLengthOuter) + bedXOffset,
        threeSpace(y, bedWidthOuter) + bedYOffset,
        zZero + zDir * z - distanceToSoil / 2,
      ]}
      rotation={[Math.PI / 2, 0, 0]} />
    <Extrude name={"gantry-beam"}
      castShadow={true}
      args={[
        beamShape,
        { steps: 1, depth: beamLength, bevelEnabled: false },
      ]}
      position={[
        threeSpace(x - extrusionWidth - 8, bedLengthOuter) + bedXOffset,
        threeSpace((bedWidthOuter + beamLength) / 2, bedWidthOuter),
        columnLength + 40,
      ]}
      rotation={[Math.PI / 2, 0, 0]}>
      <MeshPhongMaterial color={"white"} map={aluminumTexture} side={DoubleSide} />
    </Extrude>
    <Group name={"ccHorizontal"}>
      {range((botSizeY - 10) / 300).map(i =>
        <Mesh key={i}
          position={[
            threeSpace(x - 28, bedLengthOuter) + bedXOffset,
            threeSpace(50 + i * 300, bedWidthOuter) + bedYOffset,
            columnLength + 60,
          ]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={1000}
          geometry={ccHorizontal.nodes[PartName.ccHorizontal].geometry}>
          <MeshPhongMaterial color={"silver"} />
        </Mesh>)}
    </Group>
    <Extrude name={"yCC"} visible={cableCarriers}
      castShadow={true}
      args={[
        ccPath(botSizeY, y + 40, 70),
        { steps: 1, depth: 60, bevelEnabled: false },
      ]}
      position={[
        threeSpace(x - 28, bedLengthOuter) + bedXOffset,
        threeSpace(20, bedWidthOuter) + bedYOffset,
        columnLength + 150,
      ]}
      rotation={[-Math.PI / 2, -Math.PI / 2, 0]}>
      <MeshPhongMaterial color={"black"} />
    </Extrude>
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
      <MeshPhongMaterial color={"black"} />
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
    <Mesh name={"solenoid"}
      position={[
        threeSpace(x - 104, bedLengthOuter) + bedXOffset,
        threeSpace(20, bedWidthOuter),
        columnLength - 200,
      ]}
      rotation={[0, 0, -Math.PI / 2]}
      scale={1000}
      geometry={solenoid.nodes[PartName.solenoid].geometry}
      material={solenoid.materials.PaletteMaterial001} />
    <Group name={"electronics-box"}
      position={new THREE.Vector3(
        threeSpace(x - 62, bedLengthOuter) + bedXOffset,
        threeSpace(-20, bedWidthOuter),
        columnLength - 190,
      )}>
      <Group name={"box"}
        rotation={[0, 0, Math.PI / 2]}>
        <Mesh name={"electronicsBox"}
          geometry={box.nodes.Electronics_Box.geometry}
          material={box.materials[ElectronicsBoxMaterial.box]}
          scale={1000}
          material-color={0xffffff}
          material-emissive={0x999999} />
        <Mesh name={"electronicsBoxGasket"}
          geometry={box.nodes.Electronics_Box_Gasket.geometry}
          material={box.materials[ElectronicsBoxMaterial.gasket]}
          scale={1000} />
        <Mesh name={"electronicsBoxLid"}
          geometry={box.nodes.Electronics_Box_Lid.geometry}
          material={box.materials[ElectronicsBoxMaterial.lid]}
          scale={1000} />
        <Group name={"buttons-and-leds"}
          position={[0, 0, 130]}>
          {[
            { position: -60, color: IColor.estop.on },
            { position: -30, color: IColor.unlock.on },
            { position: 0, color: IColor.blank.on },
            { position: 30, color: IColor.blank.on },
            { position: 60, color: IColor.blank.on },
          ].map(button => {
            const { position, color } = button;
            const btnPosition = position;
            return <Group key={btnPosition} name={"button-group"}>
              <Mesh name={"button-housing"}
                geometry={btn.nodes["Push_Button_-_Red"].geometry}
                material={btn.materials[ElectronicsBoxMaterial.button]}
                position={[-30, btnPosition, 0]}
                scale={1000}
                material-color={0xcccccc} />
              <Cylinder
                name={"button-color"}
                material-color={color}
                args={[9, 0, 3.5]}
                position={[-30, btnPosition, 0]}
                rotation={[Math.PI / 2, 0, 0]} />
              <Cylinder name={"button-center"}
                material-color={0xcccccc}
                args={[6.75, 0, 4]}
                position={[-30, btnPosition, 0]}
                rotation={[Math.PI / 2, 0, 0]} />
            </Group>;
          })}
          {[
            { position: -45, color: IColor.sync.on },
            { position: -15, color: IColor.connect.on },
            { position: 15, color: IColor.blank.on },
            { position: 45, color: IColor.blank.on },
          ].map(ledIndicator => {
            const { position, color } = ledIndicator;
            return <Group key={position}>
              <Mesh name={"led-housing"}
                geometry={led.nodes.LED.geometry}
                material={led.materials[ElectronicsBoxMaterial.led]}
                position={[-50, position, 0]}
                material-color={0xcccccc}
                scale={1000} />
              <Cylinder name={"led-color"}
                material-color={color}
                args={[6.75, 6.75, 3]}
                position={[-50, position, 0]}
                rotation={[Math.PI / 2, 0, 0]} />
            </Group>;
          })}
        </Group>
      </Group>
      <Mesh name={"farmduino"}
        position={[-60, -10, -110]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={1000}
        geometry={farmduino.nodes[PartName.farmduino].geometry}
        material={farmduino.materials.PaletteMaterial001} />
      <Mesh name={"pi"}
        position={[-15, -10, 40]}
        rotation={[Math.PI / 2, 0, Math.PI]}
        scale={1000}
        geometry={pi.nodes[PartName.pi].geometry}
        material={pi.materials.PaletteMaterial001} />
    </Group>
    <Group
      position={[
        threeSpace(x - 32, bedLengthOuter) + bedXOffset,
        threeSpace(2, bedWidthOuter),
        100,
      ]}
      rotation={[0, 0, Math.PI / 2]}>
      <SeedTroughAssemblyComponent name={"seedTroughAssembly"}
        position={[3, -15, 30]}
        scale={1000} />
      <SeedTroughHolderComponent name={"seedTroughHolder"}
        scale={1000} />
    </Group>
    <Group name={"toolbay3"}>
      {(isJr ? [0] : [-200, 200]).map(yPosition =>
        <Group key={yPosition}>
          {[
            { node: PartName.toolbay3, color: "black", id: "toolbay3" },
            { node: PartName.toolbay3Logo, color: "white", id: "toolbay3Logo" },
          ].map(part =>
            <Mesh name={part.id} key={part.id}
              position={[
                threeSpace(105 + bedWallThickness, bedLengthOuter),
                threeSpace(yPosition + bedWidthOuter / 2, bedWidthOuter),
                60,
              ]}
              rotation={[0, 0, -Math.PI / 2]}
              scale={1000}
              geometry={
                toolbay3.nodes[part.node as keyof Toolbay3["nodes"]].geometry}>
              <MeshPhongMaterial color={part.color} />
            </Mesh>)}
        </Group>)}
    </Group>
    <RotaryToolComponent name={"rotaryTool"} visible={tool != "rotaryTool"}
      position={[
        threeSpace(105 + bedWallThickness, bedLengthOuter),
        threeSpace((isJr ? 0 : 100) + bedWidthOuter / 2, bedWidthOuter),
        70,
      ]}
      rotation={[0, 0, Math.PI / 2]}
      scale={1000} />
    <Mesh name={"wateringNozzle"}
      position={[
        threeSpace(11 + 105 + bedWallThickness, bedLengthOuter),
        threeSpace(10 + (isJr ? 100 : 200) + bedWidthOuter / 2, bedWidthOuter),
        5 + 70,
      ]}
      rotation={[0, 0, 2.094 + Math.PI / 2]}
      scale={1000}
      geometry={wateringNozzle.nodes[PartName.wateringNozzle].geometry}
      material={wateringNozzle.materials.PaletteMaterial001} />
    <Mesh name={"seedBin"}
      position={[
        threeSpace(110 + bedWallThickness, bedLengthOuter),
        threeSpace((isJr ? 200 : 300) + bedWidthOuter / 2, bedWidthOuter),
        55,
      ]}
      rotation={[0, 0, Math.PI / 2]}
      scale={1000}
      geometry={seedBin.nodes[PartName.seedBin].geometry}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    <Mesh name={"seedTray"}
      position={[
        threeSpace(110 + bedWallThickness, bedLengthOuter),
        threeSpace((isJr ? -100 : -200) + bedWidthOuter / 2, bedWidthOuter),
        55,
      ]}
      rotation={[0, 0, Math.PI / 2]}
      scale={1000}
      geometry={seedTray.nodes[PartName.seedTray].geometry}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    <SoilSensorComponent name={"soilSensor"}
      position={[
        threeSpace(105 + bedWallThickness, bedLengthOuter),
        threeSpace((isJr ? -200 : -300) + bedWidthOuter / 2, bedWidthOuter),
        70,
      ]}
      rotation={[0, 0, Math.PI / 2]}
      scale={1000} />
    <PowerSupply config={config} />
    <XAxisWaterTube config={config} />
    <Line name={"bounds"}
      visible={bounds}
      color={"white"}
      points={[
        [zero.x, zero.y, zero.z],
        [zero.x, extents.y, zero.z],
        [extents.x, extents.y, zero.z],
        [extents.x, zero.y, zero.z],
        [zero.x, zero.y, zero.z],
        ...zDip(zero.x, zero.y),
        ...zDip(zero.x, extents.y),
        ...zDip(extents.x, extents.y),
        ...zDip(extents.x, zero.y),
        [zero.x, zero.y, extents.z],
      ]} />
    <Group visible={zDimension}>
      <DistanceIndicator
        start={{
          x: threeSpace(0, bedLengthOuter),
          y: threeSpace(bedWidthOuter, bedWidthOuter),
          z: 0,
        }}
        end={{
          x: threeSpace(0, bedLengthOuter),
          y: threeSpace(bedWidthOuter, bedWidthOuter),
          z: zZero - z + zAxisLength,
        }} />
    </Group>
  </Group>;
};
