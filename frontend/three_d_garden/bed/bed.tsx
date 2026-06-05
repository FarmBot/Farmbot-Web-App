import React from "react";
import {
  Box, Detailed, Extrude, Plane, useHelper,
} from "@react-three/drei";
import {
  DoubleSide,
  Path as LinePath,
  Shape,
  RepeatWrapping,
  BufferGeometry,
  Mesh as MeshType,
  InstancedMesh as ThreeInstancedMesh,
  BackSide,
  FrontSide,
  Color,
  type Side,
  Matrix4,
  Vector3,
  Quaternion,
  Euler,
  ExtrudeGeometry,
  CylinderGeometry,
} from "three";
import { range } from "lodash";
import { threeSpace, getColorFromBrightness, zZero } from "../helpers";
import { Config, detailLevels, SurfaceDebugOption } from "../config";
import { ASSETS } from "../constants";
import { DistanceIndicator } from "../elements";
import { FarmbotAxes, UtilitiesPost, Packaging } from "./objects";
import {
  Group, InstancedMesh, Mesh, MeshNormalMaterial, MeshPhongMaterial,
  BoxGeometry,
} from "../components";
import { AxisNumberProperty } from "../../farm_designer/map/interfaces";
import {
  TaggedCurve, TaggedGenericPointer, TaggedImage,
  TaggedSensor,
  TaggedSensorReading,
} from "farmbot";
import { GetWebAppConfigValue } from "../../config_storage/actions";
import { BooleanSetting, StringSetting } from "../../session_keys";
import { DesignerState } from "../../farm_designer/interfaces";
import { useNavigate } from "react-router";
import {
  ActivePositionRef,
  BillboardRef,
  ImageRef,
  PointerObjects, PointerPlantRef, RadiusRef, soilClick, soilPointerMove,
  TorusRef,
  XCrosshairRef,
  YCrosshairRef,
} from "./objects/pointer_objects";
import { ThreeElements } from "@react-three/fiber";
import { ImageTexture } from "../garden";
import {
  VertexNormalsHelper,
} from "three/examples/jsm/helpers/VertexNormalsHelper.js";
import { MoistureSurface } from "../garden/moisture_texture";
import { HeightMaterial } from "../garden/height_material";
import { FocusVisibilityGroup } from "../focus_transition";
import { useTextureVariant } from "../texture_variants";

const soil = (
  Type: typeof LinePath | typeof Shape,
  botSize: Record<"x" | "y" | "z" | "thickness", number>,
): LinePath | Shape => {
  const { x, y, thickness } = botSize;

  const hole = new Type();
  hole.moveTo(thickness, thickness);
  hole.lineTo(thickness, y - thickness);
  hole.lineTo(x - thickness, y - thickness);
  hole.lineTo(x - thickness, thickness);
  hole.lineTo(thickness, thickness);
  return hole;
};

const bedStructure2D = (
  botSize: Record<"x" | "y" | "z" | "thickness", number>,
) => {
  const { x, y } = botSize;
  const shape = new Shape();

  // outer edge
  shape.moveTo(0, 0);
  shape.lineTo(0, y);
  shape.lineTo(x, y);
  shape.lineTo(x, 0);
  shape.lineTo(0, 0);

  // inner edge
  shape.holes.push(soil(LinePath, botSize));

  return shape;
};

type MeshProps = Omit<ThreeElements["mesh"], "ref">;

interface SurfaceProps extends MeshProps {
  config: Config;
}

const Surface = (props: SurfaceProps) => {
  // eslint-disable-next-line no-null/no-null
  const ref = React.useRef<MeshType>(null) as React.RefObject<MeshType>;
  useHelper(ref, VertexNormalsHelper, 1000);
  const enableHelper = [
    SurfaceDebugOption.normals,
    SurfaceDebugOption.height,
  ].includes(props.config.surfaceDebug);
  return <Mesh ref={enableHelper ? ref : undefined} {...props}>
    {props.children}
  </Mesh>;
};

interface BedFrameProps {
  bedLengthOuter: number;
  bedWidthOuter: number;
  bedHeight: number;
  bedStartZ: number;
  botSize: Record<"x" | "y" | "z" | "thickness", number>;
  children: React.ReactElement;
}

const BedFrame = (props: BedFrameProps) =>
  <Extrude name={"bed"}
    castShadow={true}
    receiveShadow={true}
    args={[
      bedStructure2D(props.botSize),
      { steps: 1, depth: props.bedHeight, bevelEnabled: false },
    ]}
    position={[
      threeSpace(0, props.bedLengthOuter),
      threeSpace(0, props.bedWidthOuter),
      -props.bedStartZ,
    ]}>
    {props.children}
  </Extrude>;

interface SoilLayerProps {
  config: Config;
  geometry: BufferGeometry;
  position: [number, number, number];
  onClick?: ReturnType<typeof soilClick>;
  onPointerMove?: ReturnType<typeof soilPointerMove>;
  children: React.ReactElement;
}

const SoilLayer = (props: SoilLayerProps) =>
  <Surface
    name={"soil"}
    onClick={props.onClick}
    onPointerMove={props.onPointerMove}
    castShadow={true}
    receiveShadow={true}
    config={props.config}
    geometry={props.geometry}
    position={props.position}>
    {props.children}
  </Surface>;

const SurfaceHeightMaterial = (props: { children: React.ReactNode }) =>
  <HeightMaterial {...props}
    min={0}
    max={100}
    lowColor={new Color(0.5, 0.5, 0.5)}
    highColor={new Color(0.5, 0, 0)} />;

interface TexturedBedMaterialProps {
  bedColor: string;
}

export const TexturedBedMaterial = (props: TexturedBedMaterialProps) => {
  const bedWoodTexture = useTextureVariant(ASSETS.textures.wood, {
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping,
    repeat: [0.0003, 0.003],
  });

  return <MeshPhongMaterial
    map={bedWoodTexture}
    color={props.bedColor}
    side={DoubleSide} />;
};

type BedFramePropsWithoutChildren = Omit<BedFrameProps, "children">;
type SoilLayerPropsWithoutChildren = Omit<SoilLayerProps, "children">;

interface BedSupportInstance {
  x: number;
  y: number;
}

interface BedSupportsProps {
  bedLengthOuter: number;
  bedWidthOuter: number;
  bedHeight: number;
  bedZOffset: number;
  legsFlush: boolean;
  legSize: number;
  bedColor: string;
  legWoodTexture: ReturnType<typeof useTextureVariant>;
  supports: BedSupportInstance[];
}

const noScale = new Vector3(1, 1, 1);
const noRotation = new Quaternion();
const minBedLegHeight = 0.1;
const bracketGeometryCache: Record<number, ExtrudeGeometry> = {};
const wheelGeometryCache: Record<number, CylinderGeometry> = {};
const axleGeometryCache: Record<number, CylinderGeometry> = {};

export const getBracketGeometry = (legSize: number) => {
  if (!bracketGeometryCache[legSize]) {
    const shape = new Shape();
    shape.moveTo(0, 0);
    shape.lineTo(legSize, 0);
    shape.lineTo(legSize / 3 * 2, -legSize);
    shape.lineTo(legSize / 3, -legSize);
    shape.lineTo(0, 0);
    bracketGeometryCache[legSize] = new ExtrudeGeometry(shape, {
      steps: 1,
      depth: legSize,
      bevelEnabled: false,
    });
  }
  return bracketGeometryCache[legSize];
};

export const getWheelGeometry = (legSize: number) => {
  wheelGeometryCache[legSize] ||=
    new CylinderGeometry(legSize * 0.625, legSize * 0.625, legSize / 3);
  return wheelGeometryCache[legSize];
};

export const getAxleGeometry = (legSize: number) => {
  axleGeometryCache[legSize] ||=
    new CylinderGeometry(legSize / 10, legSize / 10, legSize * 1.1);
  return axleGeometryCache[legSize];
};

const BedSupports = (props: BedSupportsProps) => {
  const {
    bedLengthOuter, bedWidthOuter, bedHeight, bedZOffset, legsFlush, legSize,
    bedColor, legWoodTexture, supports,
  } = props;
  const casterHeight = legSize * 1.375;
  const legHeight = Math.max(
    minBedLegHeight,
    bedZOffset + (legsFlush ? bedHeight : 0) - casterHeight,
  );
  const supportMatrices = React.useMemo(() => {
    const casterRotation =
      new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0));
    const wheelRotation =
      new Matrix4().makeRotationFromEuler(new Euler(Math.PI / 2, 0, 0));
    return supports.map(support => {
      const legPosition = new Vector3(
        threeSpace(support.x, bedLengthOuter),
        threeSpace(support.y, bedWidthOuter),
        -bedZOffset / 2
        - (legsFlush ? bedHeight / 2 : bedHeight)
        + (casterHeight / 2),
      );
      const leg = new Matrix4().compose(legPosition, noRotation, noScale);
      const caster = new Matrix4().compose(
        new Vector3(
          -legSize / 2,
          legSize / 2,
          (-bedZOffset - (legsFlush ? bedHeight : 0) + casterHeight) / 2,
        ),
        casterRotation,
        noScale,
      );
      const wheel = new Matrix4().makeTranslation(
        legSize / 2,
        -legSize * 0.75,
        legSize / 2,
      ).multiply(wheelRotation);
      return {
        leg,
        caster: leg.clone().multiply(caster),
        wheel: leg.clone().multiply(caster).multiply(wheel),
      };
    });
  }, [
    bedHeight,
    bedLengthOuter,
    bedWidthOuter,
    bedZOffset,
    casterHeight,
    legSize,
    legsFlush,
    supports,
  ]);
  const bracketGeometry = getBracketGeometry(legSize);
  const wheelGeometry = getWheelGeometry(legSize);
  const axleGeometry = getAxleGeometry(legSize);
  // eslint-disable-next-line no-null/no-null
  const legRef = React.useRef<ThreeInstancedMesh>(null);
  // eslint-disable-next-line no-null/no-null
  const bracketRef = React.useRef<ThreeInstancedMesh>(null);
  // eslint-disable-next-line no-null/no-null
  const wheelRef = React.useRef<ThreeInstancedMesh>(null);
  // eslint-disable-next-line no-null/no-null
  const axleRef = React.useRef<ThreeInstancedMesh>(null);

  React.useLayoutEffect(() => {
    supportMatrices.forEach((matrices, index) => {
      legRef.current?.setMatrixAt(index, matrices.leg);
      bracketRef.current?.setMatrixAt(index, matrices.caster);
      wheelRef.current?.setMatrixAt(index, matrices.wheel);
      axleRef.current?.setMatrixAt(index, matrices.wheel);
    });
    [
      legRef.current,
      bracketRef.current,
      wheelRef.current,
      axleRef.current,
    ].forEach(mesh => {
      if (mesh) { mesh.instanceMatrix.needsUpdate = true; }
    });
  }, [supportMatrices]);

  return <Group name={"bed-supports"}>
    <InstancedMesh
      ref={legRef}
      name={"bed-leg-wood"}
      args={[undefined, undefined, supports.length]}
      castShadow={true}
      receiveShadow={true}>
      <BoxGeometry args={[legSize, legSize, legHeight]} />
      <MeshPhongMaterial map={legWoodTexture} color={bedColor} />
    </InstancedMesh>
    <InstancedMesh
      ref={bracketRef}
      name={"caster-bracket"}
      args={[bracketGeometry, undefined, supports.length]}
      // eslint-disable-next-line no-null/no-null
      dispose={null}
      castShadow={true}
      receiveShadow={true}>
      <MeshPhongMaterial color={"silver"} />
    </InstancedMesh>
    <InstancedMesh
      ref={wheelRef}
      name={"wheel"}
      args={[wheelGeometry, undefined, supports.length]}
      // eslint-disable-next-line no-null/no-null
      dispose={null}
      castShadow={true}
      receiveShadow={true}>
      <MeshPhongMaterial color={"#434343"} />
    </InstancedMesh>
    <InstancedMesh
      ref={axleRef}
      name={"axle"}
      args={[axleGeometry, undefined, supports.length]}
      // eslint-disable-next-line no-null/no-null
      dispose={null}
      castShadow={true}
      receiveShadow={true}>
      <MeshPhongMaterial color={"#434343"} />
    </InstancedMesh>
  </Group>;
};

interface LowDetailBedFrameProps {
  commonBedFrameProps: BedFramePropsWithoutChildren;
}

const LowDetailBedFrame = (props: LowDetailBedFrameProps) =>
  <BedFrame {...props.commonBedFrameProps}>
    <MeshPhongMaterial color={"#ad7039"} side={DoubleSide} />
  </BedFrame>;

interface LowDetailSoilLayerProps {
  layerProps: SoilLayerPropsWithoutChildren;
}

const LowDetailSoilLayer = (props: LowDetailSoilLayerProps) =>
  <SoilLayer {...props.layerProps}>
    <MeshPhongMaterial side={DoubleSide} shininess={0} color={"#29231e"} />
  </SoilLayer>;

interface DetailedSoilLayerProps {
  bedProps: BedProps;
  layerProps: SoilLayerPropsWithoutChildren;
  soilSurfaceSide: Side;
}

const DetailedSoilLayer = (props: DetailedSoilLayerProps) => {
  const { bedProps } = props;
  const soilTexture = React.useMemo(
    () => <ImageTexture
      images={bedProps.images}
      config={bedProps.config}
      addPlantProps={bedProps.addPlantProps}
      sensors={bedProps.sensors}
      sensorReadings={bedProps.sensorReadings}
      showMoistureReadings={bedProps.showMoistureReadings}
      showMoistureMap={bedProps.showMoistureMap}
      xOffset={bedProps.config.bedXOffset
        - bedProps.config.bedLengthOuter / 2}
      yOffset={bedProps.config.bedYOffset
        - bedProps.config.bedWidthOuter / 2}
      z={0} />,
    [
      bedProps.images,
      bedProps.config,
      bedProps.addPlantProps,
      bedProps.sensors,
      bedProps.sensorReadings,
      bedProps.showMoistureReadings,
      bedProps.showMoistureMap,
    ]);

  return <SoilLayer {...props.layerProps}>
    <>
      {bedProps.config.surfaceDebug == SurfaceDebugOption.normals &&
        <MeshNormalMaterial
          flatShading={true}
          side={props.soilSurfaceSide}>
          {soilTexture}
        </MeshNormalMaterial>}
      {bedProps.config.surfaceDebug == SurfaceDebugOption.height &&
        <SurfaceHeightMaterial>
          {soilTexture}
        </SurfaceHeightMaterial>}
      {![SurfaceDebugOption.normals, SurfaceDebugOption.height]
        .includes(bedProps.config.surfaceDebug) &&
        <MeshPhongMaterial
          flatShading={true}
          side={props.soilSurfaceSide}
          shininess={0}
          color={getColorFromBrightness(bedProps.config.soilBrightness)}>
          {soilTexture}
        </MeshPhongMaterial>}
    </>
  </SoilLayer>;
};

export interface AddPlantProps {
  gridSize: AxisNumberProperty;
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
  curves: TaggedCurve[];
  designer: DesignerState;
}

export interface BedProps {
  config: Config;
  activeFocus: string;
  mapPoints: TaggedGenericPointer[];
  addPlantProps?: AddPlantProps;
  getZ(x: number, y: number): number;
  images?: TaggedImage[];
  soilSurfaceGeometry: BufferGeometry;
  showMoistureMap: boolean;
  showMoistureReadings: boolean;
  sensors: TaggedSensor[];
  sensorReadings: TaggedSensorReading[];
  activePositionRef: ActivePositionRef;
}

const BED_CONFIG_FIELDS: (keyof Config)[] = [
  "axes",
  "bedBrightness",
  "bedHeight",
  "bedLengthOuter",
  "bedType",
  "bedWallThickness",
  "bedWidthOuter",
  "bedXOffset",
  "bedYOffset",
  "bedZOffset",
  "botSizeX",
  "botSizeY",
  "botSizeZ",
  "cableCarriers",
  "ccSupportSize",
  "columnLength",
  "distanceIndicator",
  "extraLegsX",
  "extraLegsY",
  "imgCalZ",
  "imgCenterX",
  "imgCenterY",
  "imgOffsetX",
  "imgOffsetY",
  "imgOrigin",
  "imgRotation",
  "imgScale",
  "interpolationPower",
  "interpolationStepSize",
  "interpolationUseNearest",
  "kitVersion",
  "label",
  "legSize",
  "legsFlush",
  "lightsDebug",
  "lowDetail",
  "mirrorX",
  "mirrorY",
  "moistureDebug",
  "packaging",
  "sizePreset",
  "soilBrightness",
  "surfaceDebug",
  "utilitiesPost",
  "xyDimensions",
  "zGantryOffset",
];

const BED_SETTING_FIELDS = [
  BooleanSetting.show_images,
  StringSetting.photo_filter_begin,
  StringSetting.photo_filter_end,
] as const;

const bedConfigFieldsEqual = (prev: Config, next: Config) =>
  BED_CONFIG_FIELDS.every(field => prev[field] === next[field]);

const bedSettingFieldsEqual = (prev: BedProps, next: BedProps) =>
  BED_SETTING_FIELDS.every(field =>
    prev.addPlantProps?.getConfigValue(field)
    === next.addPlantProps?.getConfigValue(field));

const bedPropsEqual = (prev: Readonly<BedProps>, next: Readonly<BedProps>) =>
  prev.activeFocus === next.activeFocus
  && prev.mapPoints === next.mapPoints
  && prev.addPlantProps === next.addPlantProps
  && prev.getZ === next.getZ
  && prev.images === next.images
  && prev.soilSurfaceGeometry === next.soilSurfaceGeometry
  && prev.showMoistureMap === next.showMoistureMap
  && prev.showMoistureReadings === next.showMoistureReadings
  && prev.sensors === next.sensors
  && prev.sensorReadings === next.sensorReadings
  && prev.activePositionRef === next.activePositionRef
  && bedConfigFieldsEqual(prev.config, next.config)
  && bedSettingFieldsEqual(prev, next);

type RenderSoilSurfaceGeometryConfig = Pick<Config,
  "bedLengthOuter" | "bedWidthOuter" | "bedXOffset" | "bedYOffset"
  | "mirrorX" | "mirrorY">;

export const getRenderSoilSurfaceGeometry = (
  config: RenderSoilSurfaceGeometryConfig,
  soilSurfaceGeometry: BufferGeometry,
) => {
  if (!config.mirrorX && !config.mirrorY) {
    return soilSurfaceGeometry;
  }
  const geometry = soilSurfaceGeometry.clone();
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const xMid = config.bedLengthOuter / 2 - config.bedXOffset;
  const yMid = config.bedWidthOuter / 2 - config.bedYOffset;
  const positionArray = position.array;
  const normalArray = normal?.array;
  for (let i = 0; i < position.count; i++) {
    const offset = i * 3;
    if (config.mirrorX) {
      positionArray[offset] = 2 * xMid - positionArray[offset];
    }
    if (config.mirrorY) {
      positionArray[offset + 1] = 2 * yMid - positionArray[offset + 1];
    }
    if (normalArray && config.mirrorX) {
      normalArray[offset] = -normalArray[offset];
    }
    if (normalArray && config.mirrorY) {
      normalArray[offset + 1] = -normalArray[offset + 1];
    }
  }
  position.needsUpdate = true;
  if (normal) { normal.needsUpdate = true; }
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
};

const BedBase = (props: BedProps) => {
  const {
    bedWidthOuter, bedLengthOuter, botSizeZ, bedHeight, bedZOffset,
    legSize, legsFlush, extraLegsX, extraLegsY, bedBrightness,
    ccSupportSize, axes, xyDimensions, bedXOffset, bedYOffset,
    bedWallThickness, mirrorX, mirrorY,
  } = props.config;
  const thickness = bedWallThickness;
  const botSize = { x: bedLengthOuter, y: bedWidthOuter, z: botSizeZ, thickness };
  const bedStartZ = bedHeight;
  const bedColor = getColorFromBrightness(bedBrightness);
  const groundZ = -bedHeight - bedZOffset;
  const supports = React.useMemo(() => {
    const xPositions = [
      0 + legSize / 2 + thickness,
      ...(extraLegsX
        ? range(0, bedLengthOuter, bedLengthOuter / (extraLegsX + 1)).slice(1)
        : []),
      bedLengthOuter - legSize / 2 - thickness,
    ];
    const yPositions = (index: number) =>
      [
        0 + legSize / 2 + thickness,
        ...(extraLegsY && (index == 0 || index == (xPositions.length - 1))
          ? range(0, bedWidthOuter, bedWidthOuter / (extraLegsY + 1)).slice(1)
          : []),
        bedWidthOuter - legSize / 2 - thickness,
      ];
    return xPositions.flatMap((x, index) =>
      yPositions(index).map(y => ({ x, y })));
  }, [
    bedLengthOuter,
    bedWidthOuter,
    extraLegsX,
    extraLegsY,
    legSize,
    thickness,
  ]);

  const legWoodTexture = useTextureVariant(ASSETS.textures.wood, {
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping,
    repeat: [0.02, 0.05],
  });

  // eslint-disable-next-line no-null/no-null
  const pointerPlantRef: PointerPlantRef = React.useRef(null);

  // eslint-disable-next-line no-null/no-null
  const radiusRef: RadiusRef = React.useRef(null);

  // eslint-disable-next-line no-null/no-null
  const torusRef: TorusRef = React.useRef(null);

  // eslint-disable-next-line no-null/no-null
  const billboardRef: BillboardRef = React.useRef(null);

  // eslint-disable-next-line no-null/no-null
  const imageRef: ImageRef = React.useRef(null);

  // eslint-disable-next-line no-null/no-null
  const xCrosshairRef: XCrosshairRef = React.useRef(null);

  // eslint-disable-next-line no-null/no-null
  const yCrosshairRef: YCrosshairRef = React.useRef(null);

  const navigate = useNavigate();

  const mirroredAxesCount = Number(mirrorX) + Number(mirrorY);
  const soilSurfaceSide = mirroredAxesCount % 2 == 1 ? FrontSide : BackSide;
  const soilSurfaceConfig = React.useMemo(() => ({
    bedLengthOuter,
    bedWidthOuter,
    bedXOffset,
    bedYOffset,
    mirrorX,
    mirrorY,
  }), [
    bedLengthOuter,
    bedWidthOuter,
    bedXOffset,
    bedYOffset,
    mirrorX,
    mirrorY,
  ]);
  const renderSoilSurfaceGeometry = React.useMemo(() =>
    getRenderSoilSurfaceGeometry(
      soilSurfaceConfig,
      props.soilSurfaceGeometry,
    ), [
    props.soilSurfaceGeometry,
    soilSurfaceConfig,
  ]);
  const soilPosition: [number, number, number] = [
    threeSpace(0, bedLengthOuter) + bedXOffset,
    threeSpace(0, bedWidthOuter) + bedYOffset,
    zZero(props.config),
  ];
  const onSoilClick = props.addPlantProps
    // eslint-disable-next-line react-hooks/refs
    ? soilClick({
      config: props.config,
      addPlantProps: props.addPlantProps,
      pointerPlantRef,
      navigate,
      getZ: props.getZ,
    })
    : undefined;
  const onSoilPointerMove = React.useMemo(
    () =>
      props.addPlantProps
        // eslint-disable-next-line react-hooks/refs
        ? soilPointerMove({
          addPlantProps: props.addPlantProps,
          config: props.config,
          pointerPlantRef,
          radiusRef,
          torusRef,
          billboardRef,
          imageRef,
          xCrosshairRef,
          yCrosshairRef,
          activePositionRef: props.activePositionRef,
          getZ: props.getZ,
        })
        : undefined,
    [
      props.addPlantProps,
      props.config,
      props.activePositionRef,
      props.getZ,
    ]);
  const commonSoilLayerProps = {
    config: props.config,
    geometry: renderSoilSurfaceGeometry,
    position: soilPosition,
    onClick: onSoilClick,
    onPointerMove: onSoilPointerMove,
  };
  const commonBedFrameProps = {
    bedLengthOuter,
    bedWidthOuter,
    bedHeight,
    bedStartZ,
    botSize,
  };

  return <Group name={"bed-group"}>
    {props.config.lowDetail
      ? <LowDetailBedFrame commonBedFrameProps={commonBedFrameProps} />
      : <Detailed distances={detailLevels(props.config)}>
        <BedFrame {...commonBedFrameProps}>
          <TexturedBedMaterial bedColor={bedColor} />
        </BedFrame>
        <LowDetailBedFrame commonBedFrameProps={commonBedFrameProps} />
      </Detailed>}
    <Plane name={"bed-underside"}
      args={[bedLengthOuter, bedWidthOuter]}
      castShadow={true}
      position={[
        threeSpace(bedLengthOuter / 2, bedLengthOuter),
        threeSpace(bedWidthOuter / 2, bedWidthOuter),
        -props.config.bedHeight + 1,
      ]}>
      <MeshPhongMaterial side={DoubleSide} shininess={0} color={"black"} />
    </Plane>
    <FocusVisibilityGroup name={"distance-indicator-group"}
      preserveDepthWrite={true}
      visible={xyDimensions || props.activeFocus == "Planter bed"}>
      <DistanceIndicator
        start={{
          x: threeSpace(0, bedLengthOuter),
          y: threeSpace(0, bedWidthOuter) - 100,
          z: groundZ,
        }}
        end={{
          x: threeSpace(bedLengthOuter, bedLengthOuter),
          y: threeSpace(0, bedWidthOuter) - 100,
          z: groundZ,
        }} />
      <DistanceIndicator
        start={{
          x: threeSpace(bedLengthOuter, bedLengthOuter) + 100,
          y: threeSpace(0, bedWidthOuter),
          z: groundZ,
        }}
        end={{
          x: threeSpace(bedLengthOuter, bedLengthOuter) + 100,
          y: threeSpace(bedWidthOuter, bedWidthOuter),
          z: groundZ,
        }} />
    </FocusVisibilityGroup>
    <Group visible={props.config.distanceIndicator == "bedHeight"}>
      <DistanceIndicator
        start={{
          x: threeSpace(bedLengthOuter, bedLengthOuter) + 100,
          y: threeSpace(0, bedWidthOuter),
          z: groundZ,
        }}
        end={{
          x: threeSpace(bedLengthOuter, bedLengthOuter) + 100,
          y: threeSpace(0, bedWidthOuter),
          z: 0,
        }} />
    </Group>
    <Group name={"axes-group"} visible={axes}>
      <FarmbotAxes config={props.config} />
    </Group>
    {props.config.cableCarriers &&
      <>
        <Box name={"lower-cc-support"}
          castShadow={true}
          receiveShadow={true}
          args={[bedLengthOuter / 2, ccSupportSize, ccSupportSize]}
          position={[
            threeSpace(bedLengthOuter / 4, bedLengthOuter),
            threeSpace(-ccSupportSize / 2, bedWidthOuter),
            -Math.min(150, bedHeight / 2) - ccSupportSize / 2,
          ]}>
          <MeshPhongMaterial map={legWoodTexture} color={bedColor}
            side={DoubleSide} />
        </Box>
        <Box name={"upper-cc-support"}
          castShadow={true}
          receiveShadow={true}
          args={[bedLengthOuter / 2, ccSupportSize, ccSupportSize]}
          position={[
            threeSpace(bedLengthOuter * 3 / 4, bedLengthOuter),
            threeSpace(-ccSupportSize / 2, bedWidthOuter),
            -50 - ccSupportSize / 2,
          ]}>
          <MeshPhongMaterial map={legWoodTexture} color={bedColor}
            side={DoubleSide} />
        </Box>
      </>}
    {props.addPlantProps &&
      <PointerObjects
        pointerPlantRef={pointerPlantRef}
        radiusRef={radiusRef}
        torusRef={torusRef}
        billboardRef={billboardRef}
        imageRef={imageRef}
        xCrosshairRef={xCrosshairRef}
        yCrosshairRef={yCrosshairRef}
        activePositionRef={props.activePositionRef}
        config={props.config}
        addPlantProps={props.addPlantProps}
        mapPoints={props.mapPoints} />}
    <React.Suspense>
      {props.config.lowDetail
        ? <LowDetailSoilLayer layerProps={commonSoilLayerProps} />
        : <Detailed distances={detailLevels(props.config)}>
          <DetailedSoilLayer
            bedProps={props}
            layerProps={commonSoilLayerProps}
            soilSurfaceSide={soilSurfaceSide} />
          <LowDetailSoilLayer layerProps={commonSoilLayerProps} />
        </Detailed>}
    </React.Suspense>
    {props.config.moistureDebug &&
      <MoistureSurface
        sensors={props.sensors}
        sensorReadings={props.sensorReadings}
        showMoistureReadings={true}
        showMoistureMap={true}
        config={props.config}
        color={"black"}
        radius={50}
        readingZOverride={600}
        position={[
          threeSpace(0, bedLengthOuter) + bedXOffset,
          threeSpace(bedWidthOuter, bedWidthOuter) + bedYOffset,
          zZero(props.config),
        ]}
      />}
    <BedSupports
      bedLengthOuter={bedLengthOuter}
      bedWidthOuter={bedWidthOuter}
      bedHeight={bedHeight}
      bedZOffset={bedZOffset}
      legsFlush={legsFlush}
      legSize={legSize}
      bedColor={bedColor}
      legWoodTexture={legWoodTexture}
      supports={supports} />
    <UtilitiesPost config={props.config} activeFocus={props.activeFocus} />
    <Packaging config={props.config} />
  </Group>;
};

export const Bed = React.memo(BedBase, bedPropsEqual);
