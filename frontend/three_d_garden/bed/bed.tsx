import React from "react";
import {
  Box, Detailed, Extrude, Plane, useHelper, useTexture,
} from "@react-three/drei";
import {
  DoubleSide,
  Path as LinePath,
  Shape,
  RepeatWrapping,
  BufferGeometry,
  Mesh as MeshType,
  BackSide,
  FrontSide,
  Color,
} from "three";
import { range } from "lodash";
import { threeSpace, getColorFromBrightness, zZero } from "../helpers";
import { Config, detailLevels, SurfaceDebugOption } from "../config";
import { ASSETS } from "../constants";
import { DistanceIndicator } from "../elements";
import { FarmbotAxes, Caster, UtilitiesPost, Packaging } from "./objects";
import {
  Group, Mesh, MeshNormalMaterial, MeshPhongMaterial,
} from "../components";
import { AxisNumberProperty } from "../../farm_designer/map/interfaces";
import {
  TaggedCurve, TaggedGenericPointer, TaggedImage,
  TaggedSensor,
  TaggedSensorReading,
} from "farmbot";
import { GetWebAppConfigValue } from "../../config_storage/actions";
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
import { VertexNormalsHelper } from "three/examples/jsm/Addons.js";
import { MoistureSurface } from "../garden/moisture_texture";
import { HeightMaterial } from "../garden/height_material";
import { soilSurfaceExtents } from "../triangles";
import { FocusVisibilityGroup } from "../focus_transition";

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

export const Bed = (props: BedProps) => {
  const {
    bedWidthOuter, bedLengthOuter, botSizeZ, bedHeight, bedZOffset,
    legSize, legsFlush, extraLegsX, extraLegsY, bedBrightness,
    ccSupportSize, axes, xyDimensions, bedXOffset, bedYOffset,
  } = props.config;
  const thickness = props.config.bedWallThickness;
  const botSize = { x: bedLengthOuter, y: bedWidthOuter, z: botSizeZ, thickness };
  const bedStartZ = bedHeight;
  const bedColor = getColorFromBrightness(bedBrightness);
  const groundZ = -bedHeight - bedZOffset;
  const legXPositions = [
    0 + legSize / 2 + thickness,
    ...(extraLegsX
      ? range(0, bedLengthOuter, bedLengthOuter / (extraLegsX + 1)).slice(1)
      : []),
    bedLengthOuter - legSize / 2 - thickness,
  ];
  const legYPositions = (index: number) =>
    [
      0 + legSize / 2 + thickness,
      ...(extraLegsY && (index == 0 || index == (legXPositions.length - 1))
        ? range(0, bedWidthOuter, bedWidthOuter / (extraLegsY + 1)).slice(1)
        : []),
      bedWidthOuter - legSize / 2 - thickness,
    ];
  const casterHeight = legSize * 1.375;

  const bedWoodTextureBase = useTexture(ASSETS.textures.wood + "?=bedWood");
  const bedWoodTexture = React.useMemo(() => {
    const texture = bedWoodTextureBase.clone();
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(0.0003, 0.003);
    return texture;
  }, [bedWoodTextureBase]);
  const legWoodTextureBase = useTexture(ASSETS.textures.wood + "?=legWood");
  const legWoodTexture = React.useMemo(() => {
    const texture = legWoodTextureBase.clone();
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(0.02, 0.05);
    return texture;
  }, [legWoodTextureBase]);

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

  const commonSoil = {
    side: DoubleSide,
    shininess: 0,
  };

  const soilTexture = React.useMemo(
    () => <ImageTexture
      images={props.images}
      config={props.config}
      addPlantProps={props.addPlantProps}
      sensors={props.sensors}
      sensorReadings={props.sensorReadings}
      showMoistureReadings={props.showMoistureReadings}
      showMoistureMap={props.showMoistureMap}
      xOffset={props.config.bedXOffset - props.config.bedLengthOuter / 2}
      yOffset={props.config.bedYOffset - props.config.bedWidthOuter / 2}
      z={0} />,
    [
      props.images,
      props.config,
      props.addPlantProps,
      props.sensors,
      props.sensorReadings,
      props.showMoistureReadings,
      props.showMoistureMap,
    ]);

  const surfaceTexture = soilTexture;
  const mirroredAxesCount =
    Number(props.config.mirrorX) + Number(props.config.mirrorY);
  const soilSurfaceSide = mirroredAxesCount % 2 == 1 ? FrontSide : BackSide;
  const renderSoilSurfaceGeometry = React.useMemo(() => {
    if (!props.config.mirrorX && !props.config.mirrorY) {
      return props.soilSurfaceGeometry;
    }
    const geometry = props.soilSurfaceGeometry.clone();
    const position = geometry.getAttribute("position");
    const normal = geometry.getAttribute("normal");
    const extents = soilSurfaceExtents(props.config);
    const xMid = (extents.x.min + extents.x.max) / 2;
    const yMid = (extents.y.min + extents.y.max) / 2;
    for (let i = 0; i < position.count; i++) {
      if (props.config.mirrorX) {
        position.setX(i, 2 * xMid - position.getX(i));
      }
      if (props.config.mirrorY) {
        position.setY(i, 2 * yMid - position.getY(i));
      }
      if (normal) {
        if (props.config.mirrorX) {
          normal.setX(i, -normal.getX(i));
        }
        if (props.config.mirrorY) {
          normal.setY(i, -normal.getY(i));
        }
      }
    }
    position.needsUpdate = true;
    if (normal) { normal.needsUpdate = true; }
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    return geometry;
  }, [props.soilSurfaceGeometry, props.config]);
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
    <Detailed distances={detailLevels(props.config)}>
      <BedFrame {...commonBedFrameProps}>
        <MeshPhongMaterial
          map={bedWoodTexture} color={bedColor} side={DoubleSide} />
      </BedFrame>
      <BedFrame {...commonBedFrameProps}>
        <MeshPhongMaterial color={"#ad7039"} side={DoubleSide} />
      </BedFrame>
    </Detailed>
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
    <Box name={"lower-cc-support"}
      castShadow={true}
      receiveShadow={true}
      args={[bedLengthOuter / 2, ccSupportSize, ccSupportSize]}
      position={[
        threeSpace(bedLengthOuter / 4, bedLengthOuter),
        threeSpace(-ccSupportSize / 2, bedWidthOuter),
        -Math.min(150, bedHeight / 2) - ccSupportSize / 2,
      ]}>
      <MeshPhongMaterial map={legWoodTexture} color={bedColor} side={DoubleSide} />
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
      <MeshPhongMaterial map={legWoodTexture} color={bedColor} side={DoubleSide} />
    </Box>
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
      <Detailed distances={detailLevels(props.config)}>
        <SoilLayer {...commonSoilLayerProps}>
          <>
            {props.config.surfaceDebug == SurfaceDebugOption.normals &&
              <MeshNormalMaterial
                flatShading={true}
                side={soilSurfaceSide}>
                {surfaceTexture}
              </MeshNormalMaterial>}
            {props.config.surfaceDebug == SurfaceDebugOption.height &&
              <SurfaceHeightMaterial>
                {surfaceTexture}
              </SurfaceHeightMaterial>}
            {![SurfaceDebugOption.normals, SurfaceDebugOption.height]
              .includes(props.config.surfaceDebug) &&
              <MeshPhongMaterial
                flatShading={true}
                side={soilSurfaceSide}
                shininess={0}
                color={getColorFromBrightness(props.config.soilBrightness)}>
                {surfaceTexture}
              </MeshPhongMaterial>}
          </>
        </SoilLayer>
        <SoilLayer {...commonSoilLayerProps}>
          <MeshPhongMaterial {...commonSoil} color={"#29231e"} />
        </SoilLayer>
      </Detailed>
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
    {legXPositions.map((x, index) =>
      <Group key={index}>
        {legYPositions(index).map(y =>
          <Group name={"bed-leg"} key={y}
            position={[
              threeSpace(x, bedLengthOuter),
              threeSpace(y, bedWidthOuter),
              -bedZOffset / 2
              - (legsFlush ? bedHeight / 2 : bedHeight)
              + (casterHeight / 2),
            ]}>
            <Box name={"bed-leg-wood"}
              castShadow={true}
              receiveShadow={true}
              args={[
                legSize,
                legSize,
                bedZOffset + (legsFlush ? bedHeight : 0) - casterHeight,
              ]}>
              <MeshPhongMaterial map={legWoodTexture} color={bedColor} />
            </Box>
            <Caster config={props.config} />
          </Group>)}
      </Group>)}
    <UtilitiesPost config={props.config} activeFocus={props.activeFocus} />
    <Packaging config={props.config} />
  </Group>;
};
