/* eslint-disable complexity */
import React, { useEffect, useState } from "react";
import * as THREE from "three";
import {
  Cylinder, Extrude, Trail, Tube, useGLTF, useTexture,
} from "@react-three/drei";
import {
  DoubleSide,
  ExtrudeGeometryOptions,
  Shape,
  RepeatWrapping,
} from "three";
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
  activeFocus: string;
  getZ(x: number, y: number): number;
  toolSlots?: SlotWithTool[];
  mountedToolName?: string | undefined;
  dispatch?: Function;
}

export const Bot = React.memo((props: FarmbotModelProps) => {
  const config = props.config;
  const {
    beamLength,
    bedHeight,
    bedLengthOuter,
    bedWallThickness,
    bedWidthOuter,
    bedXOffset,
    bedYOffset,
    bedZOffset,
    bot,
    botSizeX,
    botSizeY,
    botSizeZ,
    bounds,
    cableCarriers,
    cableDebug,
    cameraView,
    ccSupportSize,
    columnLength,
    distanceIndicator,
    imgCenterX,
    imgCenterY,
    imgOffsetX,
    imgOffsetY,
    imgOrigin,
    imgRotation,
    imgScale,
    kitVersion,
    laser,
    labels,
    labelsOnHover,
    legSize,
    light,
    lightsDebug,
    negativeZ,
    perspective,
    rotary,
    sizePreset,
    tool,
    tracks,
    trail,
    vacuum,
    waterFlow,
    x,
    y,
    z,
    zAxisLength,
    zDimension,
    zGantryOffset,
  } = props.config;
  const zZero = React.useMemo(
    () => zZeroFunc(config),
    [columnLength, zGantryOffset],
  );
  const zDir = React.useMemo(
    () => zDirFunc(config),
    [negativeZ],
  );
  const zAxisBase = React.useMemo(() => zZero - zDir * z, [zZero, zDir, z]);
  const toX = React.useCallback(
    (value: number) => threeSpace(value, bedLengthOuter) + bedXOffset,
    [bedLengthOuter, bedXOffset],
  );
  const toY = React.useCallback(
    (value: number) => threeSpace(value, bedWidthOuter) + bedYOffset,
    [bedWidthOuter, bedYOffset],
  );
  const toYNoOffset = React.useCallback(
    (value: number) => threeSpace(value, bedWidthOuter),
    [bedWidthOuter],
  );
  const gantryWheelPlate =
    useGLTF(ASSETS.models.gantryWheelPlate, LIB_DIR) as GantryWheelPlateFull;
  const GantryWheelPlateComponent = React.useMemo(() =>
    GantryWheelPlate(gantryWheelPlate), [gantryWheelPlate]);
  const leftBracket = useGLTF(ASSETS.models.leftBracket, LIB_DIR) as LeftBracket;
  const rightBracket = useGLTF(ASSETS.models.rightBracket, LIB_DIR) as RightBracket;
  const crossSlide = useGLTF(ASSETS.models.crossSlide, LIB_DIR) as CrossSlideFull;
  const CrossSlideComponent = React.useMemo(() =>
    CrossSlide(crossSlide), [crossSlide]);
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
  const VacuumPumpCoverComponent = React.useMemo(() =>
    VacuumPumpCover(vacuumPumpCover), [vacuumPumpCover]);
  const cameraMountHalf = useGLTF(
    ASSETS.models.cameraMountHalf, LIB_DIR) as CameraMountHalf;
  const xAxisCCMount = useGLTF(ASSETS.models.xAxisCCMount, LIB_DIR) as XAxisCCMount;
  const [trackShape, setTrackShape] = useState<Shape>();
  const [beamShape, setBeamShape] = useState<Shape>();
  const [columnShape, setColumnShape] = useState<Shape>();
  const [zAxisShape, setZAxisShape] = useState<Shape>();
  useEffect(() => {
    if (trackShape && beamShape && columnShape && zAxisShape) { return; }
    const loader = new SVGLoader();
    if (!trackShape) {
      loader.load(ASSETS.shapes.track,
        svg => {
          const smallCutout = SVGLoader.createShapes(svg.paths[0])[0];
          const largeCutout = SVGLoader.createShapes(svg.paths[1])[0];
          const outline = SVGLoader.createShapes(svg.paths[2])[0];
          outline.holes.push(smallCutout);
          outline.holes.push(largeCutout);
          setTrackShape(outline);
        });
    }
    if (!beamShape) {
      loader.load(ASSETS.shapes.beam,
        svg => {
          const outline = SVGLoader.createShapes(svg.paths[0])[0];
          range(1, 6).map(i => {
            const hole = SVGLoader.createShapes(svg.paths[i])[0];
            outline.holes.push(hole);
          });
          setBeamShape(outline);
        });
    }
    if (!columnShape) {
      loader.load(ASSETS.shapes.column,
        svg => {
          const outline = SVGLoader.createShapes(svg.paths[3])[0];
          range(3).map(i => {
            const hole = SVGLoader.createShapes(svg.paths[i])[0];
            outline.holes.push(hole);
          });
          setColumnShape(outline);
        });
    }
    if (!zAxisShape) {
      loader.load(ASSETS.shapes.zAxis,
        svg => {
          const hole = SVGLoader.createShapes(svg.paths[1])[0];
          const outline = SVGLoader.createShapes(svg.paths[0])[0];
          outline.holes.push(hole);
          setZAxisShape(outline);
        });
    }
  }, [trackShape, beamShape, columnShape, zAxisShape]);
  const aluminumTexture = useTexture(ASSETS.textures.aluminum + "?=bot");
  useEffect(() => {
    if (!aluminumTexture) { return; }
    aluminumTexture.wrapS = RepeatWrapping;
    aluminumTexture.wrapT = RepeatWrapping;
    aluminumTexture.repeat.set(0.01, 0.0003);
  }, [aluminumTexture]);

  const xTrackDepth = React.useMemo(
    () => botSizeX + xTrackPadding,
    [botSizeX],
  );
  const columnYs = React.useMemo(
    () => [0 - extrusionWidth, bedWidthOuter],
    [bedWidthOuter],
  );
  const yBeltPath = React.useMemo(() => {
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
  }, [y, botSizeY]);
  const columnExtrudeArgs = React.useMemo<
    [Shape | undefined, ExtrudeGeometryOptions]
  >(() => [
    columnShape,
    { steps: 1, depth: columnLength, bevelEnabled: false },
  ], [
    columnShape,
    columnLength,
  ]);
  const trackExtrudeArgs = React.useMemo<
    [Shape | undefined, ExtrudeGeometryOptions]
  >(() => [
    trackShape,
    { steps: 1, depth: xTrackDepth, bevelEnabled: false },
  ], [
    trackShape,
    xTrackDepth,
  ]);
  const zAxisExtrudeArgs = React.useMemo<
    [Shape | undefined, ExtrudeGeometryOptions]
  >(() => [
    zAxisShape,
    { steps: 1, depth: zAxisLength, bevelEnabled: false },
  ], [
    zAxisShape,
    zAxisLength,
  ]);
  const yBeltExtrudeArgs = React.useMemo<
    [Shape | undefined, ExtrudeGeometryOptions]
  >(() => [
    yBeltPath,
    { steps: 1, depth: 6, bevelEnabled: false },
  ], [yBeltPath]);
  const distanceToSoil = React.useMemo(
    () => -props.getZ(x, y) - zDir * z,
    [props.getZ, x, y, zDir, z],
  );
  const defaultTrailWidth = React.useMemo(
    () => (perspective ? 500 : 0.1),
    [perspective],
  );
  const airTubeEndPosition = React.useMemo(() => {
    switch (kitVersion) {
      case "v1.7":
        return [
          toX(x + 80),
          toY(y + 100),
          zAxisBase + 245,
        ] as [number, number, number];
      case "v1.8":
      default:
        return [
          toX(x + 35),
          toY(y),
          zAxisBase + 245,
        ] as [number, number, number];
    }
  }, [
    kitVersion,
    toX,
    toY,
    x,
    y,
    zAxisBase,
  ]);
  const vacuumPumpCoverRotation = React.useMemo(() => {
    switch (kitVersion) {
      case "v1.7":
        return [0, 0, Math.PI / 2] as [number, number, number];
      case "v1.8":
      default:
        return [0, 0, -Math.PI / 2] as [number, number, number];
    }
  }, [kitVersion]);
  const vacuumPumpCoverPosition = React.useMemo(() => {
    switch (kitVersion) {
      case "v1.7":
        return [
          toX(x + 12),
          toY(y + 55),
          zAxisBase + 490,
        ] as [number, number, number];
      case "v1.8":
      default:
        return [
          toX(x + 2),
          toY(y + 110),
          zZero + columnLength + 25,
        ] as [number, number, number];
    }
  }, [
    kitVersion,
    toX,
    toY,
    x,
    y,
    zAxisBase,
    zZero,
    columnLength,
  ]);
  const cameraMountPosition = React.useMemo(() => new THREE.Vector3(
    toX(x + cameraMountOffset.x),
    toY(y + cameraMountOffset.y),
    zAxisBase - 140 + zGantryOffset + 20,
  ), [
    toX,
    toY,
    x,
    y,
    zAxisBase,
    zGantryOffset,
  ]);
  const airTubeCurve = React.useMemo(() => easyCubicBezierCurve3(
    [
      toX(x + 28),
      toY(y),
      zAxisBase + 35,
    ],
    [0, 0, 100],
    [0, 0, -200],
    airTubeEndPosition,
  ), [
    toX,
    toY,
    x,
    y,
    zAxisBase,
    airTubeEndPosition,
  ]);
  const utmPosition = React.useMemo(() => ([
    toX(x + 11),
    toY(y),
    zAxisBase + utmHeight / 2 - 19,
  ] as [number, number, number]), [
    toX,
    toY,
    x,
    y,
    zAxisBase,
  ]);
  const laserPosition = React.useMemo(() => ([
    toX(x),
    toY(y),
    zAxisBase - distanceToSoil / 2,
  ] as [number, number, number]), [
    toX,
    toY,
    x,
    y,
    zAxisBase,
    distanceToSoil,
  ]);
  const trailAttenuation = React.useCallback(
    (t: number) => Math.pow(t, 3),
    [],
  );
  const trailWidth = React.useMemo(
    () => (trail ? defaultTrailWidth : 0),
    [trail, defaultTrailWidth],
  );
  const cableCarrierConfig = React.useMemo(() => ({
    x,
    y,
    z,
    bedHeight,
    bedLengthOuter,
    bedWidthOuter,
    bedXOffset,
    bedYOffset,
    botSizeX,
    botSizeY,
    botSizeZ,
    tracks,
    cableCarriers,
    columnLength,
    zAxisLength,
    zGantryOffset,
    kitVersion,
    negativeZ,
    light,
  }) as Config, [
    x,
    y,
    z,
    bedHeight,
    bedLengthOuter,
    bedWidthOuter,
    bedXOffset,
    bedYOffset,
    botSizeX,
    botSizeY,
    botSizeZ,
    tracks,
    cableCarriers,
    columnLength,
    zAxisLength,
    zGantryOffset,
    kitVersion,
    negativeZ,
    light,
  ]);
  const cameraConfig = React.useMemo(() => ({
    cameraView,
    negativeZ,
    z,
    imgCenterX,
    imgCenterY,
    imgScale,
    imgRotation,
    imgOrigin,
    imgOffsetX,
    imgOffsetY,
  }) as Config, [
    cameraView,
    negativeZ,
    z,
    imgCenterX,
    imgCenterY,
    imgScale,
    imgRotation,
    imgOrigin,
    imgOffsetX,
    imgOffsetY,
  ]);
  const gantryConfig = React.useMemo(() => ({
    beamLength,
    columnLength,
    bedXOffset,
    bedLengthOuter,
    bedWidthOuter,
    x,
    light,
    lightsDebug,
    kitVersion,
  }) as Config, [
    beamLength,
    columnLength,
    bedXOffset,
    bedLengthOuter,
    bedWidthOuter,
    x,
    light,
    lightsDebug,
    kitVersion,
  ]);
  const toolsConfig = React.useMemo(() => ({
    bedXOffset,
    bedYOffset,
    bedLengthOuter,
    bedWidthOuter,
    bedWallThickness,
    labels,
    labelsOnHover,
    x,
    y,
    z,
    tool,
    sizePreset,
    rotary,
    vacuum,
    columnLength,
    zGantryOffset,
    negativeZ,
  }) as Config, [
    bedXOffset,
    bedYOffset,
    bedLengthOuter,
    bedWidthOuter,
    bedWallThickness,
    labels,
    labelsOnHover,
    x,
    y,
    z,
    tool,
    sizePreset,
    rotary,
    vacuum,
    columnLength,
    zGantryOffset,
    negativeZ,
  ]);
  const solenoidConfig = React.useMemo(() => ({
    x,
    y,
    z,
    bedLengthOuter,
    bedWidthOuter,
    bedXOffset,
    bedYOffset,
    columnLength,
    zGantryOffset,
    negativeZ,
    waterFlow,
  }) as Config, [
    x,
    y,
    z,
    bedLengthOuter,
    bedWidthOuter,
    bedXOffset,
    bedYOffset,
    columnLength,
    zGantryOffset,
    negativeZ,
    waterFlow,
  ]);
  const electronicsConfig = React.useMemo(() => ({
    x,
    bedXOffset,
    bedLengthOuter,
    bedWidthOuter,
    columnLength,
    kitVersion,
  }) as Config, [
    x,
    bedXOffset,
    bedLengthOuter,
    bedWidthOuter,
    columnLength,
    kitVersion,
  ]);
  const powerSupplyConfig = React.useMemo(() => ({
    bedWidthOuter,
    bedLengthOuter,
    bedHeight,
    botSizeX,
    legSize,
    ccSupportSize,
    bedZOffset,
    cableDebug,
  }) as Config, [
    bedWidthOuter,
    bedLengthOuter,
    bedHeight,
    botSizeX,
    legSize,
    ccSupportSize,
    bedZOffset,
    cableDebug,
  ]);
  const waterTubeConfig = React.useMemo(() => ({
    bedHeight,
    bedZOffset,
    bedLengthOuter,
    bedWidthOuter,
    waterFlow,
  }) as Config, [
    bedHeight,
    bedZOffset,
    bedLengthOuter,
    bedWidthOuter,
    waterFlow,
  ]);
  const boundsConfig = React.useMemo(() => ({
    bedLengthOuter,
    bedWidthOuter,
    bedXOffset,
    bedYOffset,
    x,
    y,
    z,
    zAxisLength,
    columnLength,
    beamLength,
    bounds,
    botSizeX,
    botSizeY,
    botSizeZ,
    zGantryOffset,
    negativeZ,
    zDimension,
    distanceIndicator,
  }) as Config, [
    bedLengthOuter,
    bedWidthOuter,
    bedXOffset,
    bedYOffset,
    x,
    y,
    z,
    zAxisLength,
    columnLength,
    beamLength,
    bounds,
    botSizeX,
    botSizeY,
    botSizeZ,
    zGantryOffset,
    negativeZ,
    zDimension,
    distanceIndicator,
  ]);
  const wateringConfig = React.useMemo(() => ({
    x,
    y,
    z,
    bedLengthOuter,
    bedWidthOuter,
    bedXOffset,
    bedYOffset,
    columnLength,
    zGantryOffset,
    negativeZ,
  }) as Config, [
    x,
    y,
    z,
    bedLengthOuter,
    bedWidthOuter,
    bedXOffset,
    bedYOffset,
    columnLength,
    zGantryOffset,
    negativeZ,
  ]);

  return <Group name={"bot"}
    visible={bot && props.activeFocus != "Planter bed"}>
    {columnYs.map((y, index) => {
      const bedColumnYOffset =
        (tracks ? 0 : extrusionWidth) * (index == 0 ? 1 : -1);
      return <Group key={y}>
        <Extrude name={"columns"}
          castShadow={true}
          args={columnExtrudeArgs}
          position={[
            toX(x - extrusionWidth - 12),
            toYNoOffset(y + bedColumnYOffset),
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
            toX(x - extrusionWidth - 12),
            toYNoOffset(y - (index == 0 ? 0 : 170) + bedColumnYOffset),
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
            toX(x - (index == 0 ? 47 : 77)),
            toYNoOffset(y - (index == 0 ? 0 : -20) + bedColumnYOffset),
            columnLength + 70,
          ]}
          rotation={[Math.PI / 2, (index == 0 ? Math.PI : 0), Math.PI / 2]}
          scale={1000}
          geometry={undefined}
          material={undefined} />
        <Mesh name={index == 0 ? "leftMotor" : "rightMotor"}
          position={[
            toX(x - 68),
            toYNoOffset(y - (index == 0 ? 5 : -25) + bedColumnYOffset),
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
            toX(x - 63),
            toYNoOffset(y - (index == 0 ? 5 : -25) + bedColumnYOffset),
            columnLength + 55,
          ]}
          rotation={[0, 0, 0]}>
          <MeshPhongMaterial color={"#999"} />
        </Cylinder>
        <Extrude name={"tracks"} visible={tracks}
          castShadow={true}
          args={trackExtrudeArgs}
          position={[
            toX(index == 0
              ? botSizeX + xTrackPadding / 2
              : -xTrackPadding / 2),
            toYNoOffset(y + (index == 0 ? 2.5 : 17.5)),
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
            toX(-132),
            toYNoOffset(y + 10 + bedColumnYOffset),
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
            toX(botSizeX - 5 + xTrackPadding / 2),
            toYNoOffset(y + 10 + bedColumnYOffset),
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
            toX(x - 42),
            toYNoOffset(
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
        toX(x - 32),
        toYNoOffset(-12),
        -40,
      ]}
      rotation={[0, 0, Math.PI / 2]}
      scale={1000}
      geometry={xAxisCCMount.nodes[PartName.xAxisCCMount].geometry}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    <CableCarrierX config={cableCarrierConfig} />
    <CrossSlideComponent name={"crossSlide"}
      position={[
        toX(x - 1.5),
        toY(y + 5),
        columnLength + 105,
      ]}
      rotation={[0, 0, Math.PI / 2]}
      scale={1000} />
    <Extrude name={"z-axis"}
      castShadow={true}
      args={zAxisExtrudeArgs}
      position={[
        toX(x),
        toY(y + utmRadius),
        zAxisBase,
      ]}
      rotation={[0, 0, 0]}>
      <MeshPhongMaterial color={"white"} map={aluminumTexture} side={DoubleSide} />
    </Extrude>
    <Group name={"zMotor"}>
      <Mesh name={"zMotorHousing"}
        position={[
          toX(x + 4),
          toY(y + utmRadius - 47),
          zAxisBase + zAxisLength - 80,
        ]}
        rotation={[0, 0, Math.PI]}
        scale={1000}
        geometry={housingVertical.nodes[PartName.housingVertical].geometry}>
        <MeshPhongMaterial color={"silver"} />
      </Mesh>
      <Mesh name={"zMotor"}
        position={[
          toX(x + 10),
          toY(y + utmRadius - 5),
          zAxisBase + zAxisLength - 140,
        ]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={1000}
        geometry={undefined}
        material={undefined} />
      <Mesh name={"zMotorMount"}
        position={[
          toX(x + 5),
          toY(y + utmRadius - 65),
          zAxisBase + zAxisLength - 80,
        ]}
        rotation={[0, 0, Math.PI]}
        scale={1000}
        geometry={zAxisMotorMount.nodes[PartName.zAxisMotorMount].geometry}>
        <MeshPhongMaterial color={"silver"} side={DoubleSide} />
      </Mesh>
      <Cylinder name={"motorShaft"}
        args={[2.5, 2.5, 40]}
        position={[
          toX(x + 5),
          toY(y + utmRadius - 65),
          zAxisBase + zAxisLength - 80,
        ]}
        rotation={[Math.PI / 2, 0, 0]}>
        <MeshPhongMaterial color={"#999"} />
      </Cylinder>
    </Group>
    <Mesh name={"shaftCoupler"}
      position={[
        toX(x + 5),
        toY(y - 30),
        zAxisBase + zAxisLength - 120,
      ]}
      rotation={[0, 0, 0]}
      scale={1000}
      geometry={undefined}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    <Cylinder name={"shaftCoupler"}
      args={[10, 10, 25]}
      position={[
        toX(x + 5),
        toY(y - 30),
        zAxisBase + zAxisLength - 120 + 25 / 2,
      ]}
      rotation={[Math.PI / 2, 0, 0]}>
      <MeshPhongMaterial color={"silver"} />
    </Cylinder>
    <Cylinder name={"leadscrew"}
      material-color={"#555"}
      args={[4, 4, zAxisLength - 200]}
      position={[
        toX(x + 6),
        toY(y - 30),
        zAxisBase + zAxisLength / 2,
      ]}
      rotation={[Math.PI / 2, 0, 0]} />
    <CableCarrierSupportVertical config={cableCarrierConfig} />
    <CableCarrierZ config={cableCarrierConfig} />
    <Mesh name={"zStopMax"}
      position={[
        toX(x - 5),
        toY(y + utmRadius + extrusionWidth / 2),
        zAxisBase - 30 + zGantryOffset,
      ]}
      rotation={[0, Math.PI / 2, 0]}
      scale={1000}
      geometry={zStop.nodes[PartName.zStop].geometry}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    <Mesh name={"zStopMin"}
      position={[
        toX(x - 5),
        toY(y + utmRadius + extrusionWidth / 2),
        zAxisBase + botSizeZ + 140 + zGantryOffset,
      ]}
      rotation={[0, Math.PI / 2, 0]}
      scale={1000}
      geometry={zStop.nodes[PartName.zStop].geometry}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    <Mesh name={"vacuumPump"}
      position={[
        toX(x + 28),
        toY(y),
        zAxisBase + 40,
      ]}
      rotation={[0, 0, Math.PI / 2]}
      scale={1000}
      geometry={undefined}
      material={undefined} />
    <Tube name={"air-tube"}
      castShadow={true}
      receiveShadow={true}
      args={[airTubeCurve, 20, 5, 8]}>
      <MeshPhongMaterial
        color={"white"}
        transparent={true}
        opacity={0.75}
      />
    </Tube>
    <VacuumPumpCoverComponent
      rotation={vacuumPumpCoverRotation}
      scale={1000}
      position={vacuumPumpCoverPosition} />
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
      config={cameraConfig}
      cameraMountPosition={cameraMountPosition}
      distanceToSoil={distanceToSoil} />
    <Trail
      width={trailWidth}
      attenuation={trailAttenuation}
      color={"red"}
      length={100}
      decay={0.5}
      local={false}
      stride={0}
      interval={1}>
      <Group name={"UTM"}
        position={utmPosition}
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
      position={laserPosition}
      rotation={[Math.PI / 2, 0, 0]} />
    <GantryBeam
      config={gantryConfig}
      aluminumTexture={aluminumTexture}
      beamShape={beamShape} />
    <CableCarrierSupportHorizontal config={cableCarrierConfig} />
    <CableCarrierY config={cableCarrierConfig} />
    <Mesh name={"yStopMin"}
      position={[
        toX(x - extrusionWidth + 2),
        toYNoOffset(bedYOffset - 125),
        columnLength + 40 + extrusionWidth * 3,
      ]}
      rotation={[0, 0, Math.PI]}
      scale={1000}
      geometry={beltClip.nodes[PartName.beltClip].geometry}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    <Extrude name={"yBelt"}
      args={yBeltExtrudeArgs}
      position={[
        toX(x - 14.5),
        toY(-100),
        columnLength + 100,
      ]}
      rotation={[0, -Math.PI / 2, 0]}>
      <MeshPhongMaterial color={distinguishableBlack} />
    </Extrude>
    <Mesh name={"yStopMax"}
      position={[
        toX(x - extrusionWidth + 2),
        toYNoOffset(botSizeY + bedYOffset + 135),
        columnLength + 40 + extrusionWidth * 3 + 5,
      ]}
      rotation={[0, Math.PI, 0]}
      scale={1000}
      geometry={beltClip.nodes[PartName.beltClip].geometry}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    <Solenoid config={solenoidConfig} />
    <ElectronicsBox config={electronicsConfig} />
    <Tools
      dispatch={props.dispatch}
      config={toolsConfig}
      getZ={props.getZ}
      toolSlots={props.toolSlots}
      mountedToolName={props.mountedToolName} />
    {waterFlow &&
      <WateringAnimations
        waterFlow={waterFlow}
        config={wateringConfig}
        getZ={props.getZ} />}
    <PowerSupply config={powerSupplyConfig} />
    <XAxisWaterTube config={waterTubeConfig} />
    <Bounds config={boundsConfig} />
  </Group>;
});
