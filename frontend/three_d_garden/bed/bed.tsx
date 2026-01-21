import React from "react";
import {
  Box, Detailed, Extrude, Line, Plane, useHelper, useTexture,
} from "@react-three/drei";
import {
  DoubleSide,
  Path as LinePath,
  Shape,
  RepeatWrapping,
  BufferGeometry,
  Mesh as MeshType,
  BackSide,
  Color,
  Texture,
} from "three";
import { range } from "lodash";
import {
  threeSpace,
  getColorFromBrightness,
  zZero,
  zero as zeroFunc,
  extents as extentsFunc,
} from "../helpers";
import { Config, detailLevels, SurfaceDebugOption } from "../config";
import { ASSETS, RenderOrder } from "../constants";
import { DistanceIndicator } from "../elements";
import { FarmbotAxes, Caster, UtilitiesPost, Packaging } from "./objects";
import {
  Group, Mesh, MeshNormalMaterial, MeshPhongMaterial,
} from "../components";
import { AxisNumberProperty, TaggedPlant } from
  "../../farm_designer/map/interfaces";
import {
  TaggedCurve, TaggedGenericPointer, TaggedImage,
  TaggedSensor,
  TaggedSensorReading,
} from "farmbot";
import { GetWebAppConfigValue } from "../../config_storage/actions";
import { DesignerState } from "../../farm_designer/interfaces";
import type { BotPosition } from "../../devices/interfaces";
import type { MovementState } from "../../interfaces";
import type { UpdatePlant } from "../../plants/plant_info";
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
import { ThreeElements, ThreeEvent, useThree } from "@react-three/fiber";
import { ImageTexture } from "../garden";
import { VertexNormalsHelper } from "three/examples/jsm/Addons";
import { MoistureSurface } from "../garden/moisture_texture";
import { HeightMaterial } from "../garden/height_material";
import { clearSoilCursor, setSoilCursor } from "../cursor";

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

type MeshProps = ThreeElements["mesh"];

interface SurfaceProps extends MeshProps {
  config: Config;
}

const Surface = (props: SurfaceProps) => {
  // eslint-disable-next-line no-null/no-null
  const ref = React.useRef<MeshType>(null) as React.RefObject<MeshType>;
  useHelper(ref, VertexNormalsHelper, 1000);
  return <Mesh ref={props.config.surfaceDebug ? ref : undefined} {...props}>
    {props.children}
  </Mesh>;
};

export interface AddPlantProps {
  gridSize: AxisNumberProperty;
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
  curves: TaggedCurve[];
  designer: DesignerState;
  plants?: TaggedPlant[];
  updatePlant?: UpdatePlant;
  destroyPlant?: (uuid: string) => void;
  botOnline?: boolean;
  arduinoBusy?: boolean;
  currentBotLocation?: BotPosition;
  movementState?: MovementState;
  defaultAxes?: string;
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
  invalidate?: () => void;
  selectedPlant?: { x: number; y: number };
}

export const Bed = React.memo((props: BedProps) => {
  const {
    bedWidthOuter, bedLengthOuter, botSizeZ, bedHeight, bedZOffset,
    legSize, legsFlush, extraLegsX, extraLegsY, bedBrightness,
    ccSupportSize, axes, xyDimensions, bedXOffset, bedYOffset,
  } = props.config;
  const { invalidate } = useThree();
  const thickness = props.config.bedWallThickness;
  const botSize = React.useMemo(() => ({
    x: bedLengthOuter,
    y: bedWidthOuter,
    z: botSizeZ,
    thickness,
  }), [bedLengthOuter, bedWidthOuter, botSizeZ, thickness]);
  const bedStartZ = bedHeight;
  const bedColor = React.useMemo(
    () => getColorFromBrightness(bedBrightness),
    [bedBrightness],
  );
  const groundZ = React.useMemo(
    () => -bedHeight - bedZOffset,
    [bedHeight, bedZOffset],
  );
  const casterHeight = React.useMemo(() => legSize * 1.375, [legSize]);
  const legXPositions = React.useMemo(() => {
    const extraX = extraLegsX
      ? range(0, bedLengthOuter, bedLengthOuter / (extraLegsX + 1)).slice(1)
      : [];
    return [
      legSize / 2 + thickness,
      ...extraX,
      bedLengthOuter - legSize / 2 - thickness,
    ];
  }, [bedLengthOuter, extraLegsX, legSize, thickness]);
  const legYPositions = React.useMemo(() => legXPositions.map((_, index) => {
    const extraY = extraLegsY && (index == 0
      || index == (legXPositions.length - 1))
      ? range(0, bedWidthOuter, bedWidthOuter / (extraLegsY + 1)).slice(1)
      : [];
    return [
      legSize / 2 + thickness,
      ...extraY,
      bedWidthOuter - legSize / 2 - thickness,
    ];
  }), [
    bedWidthOuter,
    extraLegsY,
    legSize,
    legXPositions,
    thickness,
  ]);

  const applyRepeat = React.useCallback(
    (texture: Texture, repeat: [number, number]) => {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.repeat.set(repeat[0], repeat[1]);
      texture.needsUpdate = true;
      invalidate?.();
    },
    [invalidate],
  );
  const configureBedWoodTexture = React.useCallback(
    (texture: Texture) => applyRepeat(texture, [0.0003, 0.003]),
    [applyRepeat],
  );
  const configureLegWoodTexture = React.useCallback(
    (texture: Texture) => applyRepeat(texture, [0.02, 0.05]),
    [applyRepeat],
  );
  const bedWoodTexture = useTexture(
    ASSETS.textures.wood + "?=bedWood",
    configureBedWoodTexture,
  );
  const legWoodTexture = useTexture(
    ASSETS.textures.wood + "?=legWood",
    configureLegWoodTexture,
  );

  const bedShape = React.useMemo(() => bedStructure2D(botSize), [botSize]);
  const bedExtrudeArgs = React.useMemo(() => ([
    bedShape,
    { steps: 1, depth: bedHeight, bevelEnabled: false },
  ] as [Shape, { steps: number, depth: number, bevelEnabled: boolean }]), [
    bedShape,
    bedHeight,
  ]);
  const bedPosition = React.useMemo<[number, number, number]>(() => ([
    threeSpace(0, bedLengthOuter),
    threeSpace(0, bedWidthOuter),
    -bedStartZ,
  ]), [bedLengthOuter, bedWidthOuter, bedStartZ]);
  const bedExtrudeProps = React.useMemo(() => ({
    name: "bed",
    castShadow: true,
    receiveShadow: true,
    args: bedExtrudeArgs,
    position: bedPosition,
  }), [bedExtrudeArgs, bedPosition]);
  const crosshairZero = React.useMemo(() => zeroFunc(props.config), [
    props.config.bedLengthOuter,
    props.config.bedWidthOuter,
    props.config.bedXOffset,
    props.config.bedYOffset,
    props.config.columnLength,
    props.config.zGantryOffset,
  ]);
  const crosshairExtents = React.useMemo(() => extentsFunc(props.config), [
    props.config.bedLengthOuter,
    props.config.bedWidthOuter,
    props.config.bedXOffset,
    props.config.bedYOffset,
    props.config.columnLength,
    props.config.zGantryOffset,
    props.config.botSizeX,
    props.config.botSizeY,
    props.config.botSizeZ,
  ]);
  const xCrosshairPoints = React.useMemo<[number, number, number][]>(
    () => ([
      [crosshairZero.x, 0, 0],
      [crosshairExtents.x, 0, 0],
    ]), [crosshairExtents.x, crosshairZero.x]);
  const yCrosshairPoints = React.useMemo<[number, number, number][]>(
    () => ([
      [0, crosshairZero.y, 0],
      [0, crosshairExtents.y, 0],
    ]), [crosshairExtents.y, crosshairZero.y]);
  const selectedCrosshairPosition = React.useMemo(() => {
    const selectedPlant = props.selectedPlant;
    if (!selectedPlant) { return undefined; }
    const bedX = selectedPlant.x - bedXOffset;
    const bedY = selectedPlant.y - bedYOffset;
    const z = zZero(props.config) + props.getZ(bedX, bedY);
    return {
      x: threeSpace(selectedPlant.x, bedLengthOuter),
      y: threeSpace(selectedPlant.y, bedWidthOuter),
      z,
    };
  }, [
    bedLengthOuter,
    bedWidthOuter,
    bedXOffset,
    bedYOffset,
    props.config,
    props.getZ,
    props.selectedPlant,
  ]);

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
  const zZeroPosition = React.useMemo(
    () => zZero(props.config),
    [props.config.columnLength, props.config.zGantryOffset],
  );
  const soilPosition = React.useMemo<[number, number, number]>(() => ([
    threeSpace(0, bedLengthOuter) + bedXOffset,
    threeSpace(0, bedWidthOuter) + bedYOffset,
    zZeroPosition,
  ]), [
    bedLengthOuter,
    bedWidthOuter,
    bedXOffset,
    bedYOffset,
    zZeroPosition,
  ]);
  const soilClickHandler = React.useMemo(() => {
    if (!props.addPlantProps) { return undefined; }
    return soilClick({
      config: props.config,
      addPlantProps: props.addPlantProps,
      pointerPlantRef,
      navigate,
      getZ: props.getZ,
    });
  }, [
    navigate,
    pointerPlantRef,
    props.addPlantProps,
    props.config,
    props.getZ,
  ]);
  const soilPointerMoveHandler = React.useMemo(() => {
    if (!props.addPlantProps) { return undefined; }
    return soilPointerMove({
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
      invalidate: props.invalidate,
      getZ: props.getZ,
    });
  }, [
    billboardRef,
    imageRef,
    pointerPlantRef,
    props.activePositionRef,
    props.addPlantProps,
    props.config,
    props.getZ,
    radiusRef,
    torusRef,
    xCrosshairRef,
    yCrosshairRef,
  ]);
  const isTopSoilIntersection = React.useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      const { intersections } = event;
      if (!intersections || intersections.length === 0) { return true; }
      return intersections[0].object?.name === "soil";
    },
    [],
  );
  const handleSoilPointerMove = React.useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (isTopSoilIntersection(event)) {
        setSoilCursor();
      } else {
        clearSoilCursor();
      }
      soilPointerMoveHandler?.(event);
    },
    [isTopSoilIntersection, soilPointerMoveHandler],
  );
  const handleSoilPointerEnter = React.useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (!isTopSoilIntersection(event)) { return; }
      setSoilCursor();
    },
    [isTopSoilIntersection],
  );
  const handleSoilPointerLeave = React.useCallback(() => {
    clearSoilCursor();
  }, []);
  const soilProps = React.useMemo(() => ({
    name: "soil",
    onClick: soilClickHandler,
    onPointerMove: handleSoilPointerMove,
    onPointerEnter: handleSoilPointerEnter,
    onPointerLeave: handleSoilPointerLeave,
    castShadow: true,
    receiveShadow: true,
    config: props.config,
    geometry: props.soilSurfaceGeometry,
    position: soilPosition,
  }), [
    props.config,
    props.soilSurfaceGeometry,
    soilClickHandler,
    handleSoilPointerMove,
    handleSoilPointerEnter,
    handleSoilPointerLeave,
    soilPosition,
  ]);

  const commonSoil = React.useMemo(() => ({
    side: DoubleSide,
    shininess: 0,
  }), []);

  const soilOffsets = React.useMemo(() => ({
    x: props.config.bedXOffset - props.config.bedLengthOuter / 2,
    y: props.config.bedYOffset - props.config.bedWidthOuter / 2,
  }), [
    props.config.bedXOffset,
    props.config.bedLengthOuter,
    props.config.bedYOffset,
    props.config.bedWidthOuter,
  ]);
  const soilTexture = React.useMemo(() => <ImageTexture
    images={props.images}
    config={props.config}
    addPlantProps={props.addPlantProps}
    sensors={props.sensors}
    sensorReadings={props.sensorReadings}
    showMoistureReadings={props.showMoistureReadings}
    showMoistureMap={props.showMoistureMap}
    xOffset={soilOffsets.x}
    yOffset={soilOffsets.y}
    z={0} />, [
    props.images,
    props.config,
    props.addPlantProps,
    props.sensors,
    props.sensorReadings,
    props.showMoistureReadings,
    props.showMoistureMap,
    soilOffsets,
  ]);

  const surfaceHeightColors = React.useMemo(() => ({
    low: new Color(0.5, 0.5, 0.5),
    high: new Color(0.5, 0, 0),
  }), []);
  const SurfaceHeightMaterial = React.useCallback(
    (materialProps: { children: React.ReactNode }) =>
      <HeightMaterial {...materialProps}
        min={0}
        max={100}
        lowColor={surfaceHeightColors.low}
        highColor={surfaceHeightColors.high} />,
    [surfaceHeightColors],
  );
  const SurfaceMaterial = React.useMemo(() => {
    switch (props.config.surfaceDebug) {
      case SurfaceDebugOption.normals:
        return MeshNormalMaterial;
      case SurfaceDebugOption.height:
        return SurfaceHeightMaterial;
      default:
        return MeshPhongMaterial;
    }
  }, [props.config.surfaceDebug, SurfaceHeightMaterial]);
  const surfaceMaterialProps = React.useMemo(() => ({
    flatShading: true,
    side: BackSide,
    shininess: 0,
    color: getColorFromBrightness(props.config.soilBrightness),
  }), [props.config.soilBrightness]);
  const surfaceTexture = soilTexture;
  const detailDistances = React.useMemo(
    () => detailLevels(props.config),
    [props.config],
  );
  const bedUndersideArgs = React.useMemo<[number, number]>(
    () => [bedLengthOuter, bedWidthOuter],
    [bedLengthOuter, bedWidthOuter],
  );
  const bedUndersidePosition = React.useMemo<[number, number, number]>(() => ([
    threeSpace(bedLengthOuter / 2, bedLengthOuter),
    threeSpace(bedWidthOuter / 2, bedWidthOuter),
    -bedHeight + 1,
  ]), [bedLengthOuter, bedWidthOuter, bedHeight]);
  const bedLengthIndicatorY = React.useMemo(
    () => threeSpace(0, bedWidthOuter) - 100,
    [bedWidthOuter],
  );
  const bedWidthIndicatorX = React.useMemo(
    () => threeSpace(bedLengthOuter, bedLengthOuter) + 100,
    [bedLengthOuter],
  );
  const bedLengthIndicator = React.useMemo(() => ({
    start: {
      x: threeSpace(0, bedLengthOuter),
      y: bedLengthIndicatorY,
      z: groundZ,
    },
    end: {
      x: threeSpace(bedLengthOuter, bedLengthOuter),
      y: bedLengthIndicatorY,
      z: groundZ,
    },
  }), [bedLengthOuter, bedLengthIndicatorY, groundZ]);
  const bedWidthIndicator = React.useMemo(() => ({
    start: {
      x: bedWidthIndicatorX,
      y: threeSpace(0, bedWidthOuter),
      z: groundZ,
    },
    end: {
      x: bedWidthIndicatorX,
      y: threeSpace(bedWidthOuter, bedWidthOuter),
      z: groundZ,
    },
  }), [bedWidthIndicatorX, bedWidthOuter, groundZ]);
  const bedHeightIndicator = React.useMemo(() => ({
    start: {
      x: bedWidthIndicatorX,
      y: threeSpace(0, bedWidthOuter),
      z: groundZ,
    },
    end: {
      x: bedWidthIndicatorX,
      y: threeSpace(0, bedWidthOuter),
      z: 0,
    },
  }), [bedWidthIndicatorX, bedWidthOuter, groundZ]);
  const distanceIndicatorVisible = React.useMemo(
    () => xyDimensions || props.activeFocus == "Planter bed",
    [props.activeFocus, xyDimensions],
  );
  const ccSupportArgs = React.useMemo<[number, number, number]>(() => ([
    bedLengthOuter / 2,
    ccSupportSize,
    ccSupportSize,
  ]), [bedLengthOuter, ccSupportSize]);
  const lowerSupportPosition = React.useMemo<[number, number, number]>(() => ([
    threeSpace(bedLengthOuter / 4, bedLengthOuter),
    threeSpace(-ccSupportSize / 2, bedWidthOuter),
    -Math.min(150, bedHeight / 2) - ccSupportSize / 2,
  ]), [bedLengthOuter, bedWidthOuter, bedHeight, ccSupportSize]);
  const upperSupportPosition = React.useMemo<[number, number, number]>(() => ([
    threeSpace(bedLengthOuter * 3 / 4, bedLengthOuter),
    threeSpace(-ccSupportSize / 2, bedWidthOuter),
    -50 - ccSupportSize / 2,
  ]), [bedLengthOuter, bedWidthOuter, ccSupportSize]);
  const moistureSurfacePosition = React.useMemo<[number, number, number]>(
    () => ([
      threeSpace(0, bedLengthOuter) + bedXOffset,
      threeSpace(bedWidthOuter, bedWidthOuter) + bedYOffset,
      zZeroPosition,
    ]),
    [bedLengthOuter, bedWidthOuter, bedXOffset, bedYOffset, zZeroPosition],
  );
  const legGroups = React.useMemo(() => legXPositions.map((x, index) =>
    <Group key={index}>
      {legYPositions[index].map(y =>
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
    </Group>), [
    bedColor,
    bedHeight,
    bedLengthOuter,
    bedWidthOuter,
    bedZOffset,
    casterHeight,
    legSize,
    legWoodTexture,
    legXPositions,
    legYPositions,
    legsFlush,
    props.config,
  ]);

  return <Group name={"bed-group"}>
    <Detailed distances={detailDistances}>
      <Extrude {...bedExtrudeProps}>
        <MeshPhongMaterial
          map={bedWoodTexture} color={bedColor} side={DoubleSide} />
      </Extrude>
      <Extrude {...bedExtrudeProps}>
        <MeshPhongMaterial color={"#ad7039"} side={DoubleSide} />
      </Extrude>
    </Detailed>
    <Plane name={"bed-underside"}
      args={bedUndersideArgs}
      castShadow={true}
      position={bedUndersidePosition}>
      <MeshPhongMaterial side={DoubleSide} shininess={0} color={"black"} />
    </Plane>
    <Group name={"distance-indicator-group"}
      visible={distanceIndicatorVisible}>
      <DistanceIndicator
        start={bedLengthIndicator.start}
        end={bedLengthIndicator.end} />
      <DistanceIndicator
        start={bedWidthIndicator.start}
        end={bedWidthIndicator.end} />
    </Group>
    <Group visible={props.config.distanceIndicator == "bedHeight"}>
      <DistanceIndicator
        start={bedHeightIndicator.start}
        end={bedHeightIndicator.end} />
    </Group>
    <Group name={"axes-group"} visible={axes}>
      <FarmbotAxes config={props.config} />
    </Group>
    <Box name={"lower-cc-support"}
      castShadow={true}
      receiveShadow={true}
      args={ccSupportArgs}
      position={lowerSupportPosition}>
      <MeshPhongMaterial map={legWoodTexture} color={bedColor} side={DoubleSide} />
    </Box>
    <Box name={"upper-cc-support"}
      castShadow={true}
      receiveShadow={true}
      args={ccSupportArgs}
      position={upperSupportPosition}>
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
    {selectedCrosshairPosition &&
      <Group name={"selected-plant-crosshair"}>
        <Line
          name={"selected-plant-crosshair-x"}
          points={xCrosshairPoints}
          position={[
            0,
            selectedCrosshairPosition.y,
            selectedCrosshairPosition.z,
          ]}
          color={"white"}
          transparent={true}
          opacity={0.9}
          lineWidth={2}
          renderOrder={RenderOrder.plantLabels} />
        <Line
          name={"selected-plant-crosshair-y"}
          points={yCrosshairPoints}
          position={[
            selectedCrosshairPosition.x,
            0,
            selectedCrosshairPosition.z,
          ]}
          color={"white"}
          transparent={true}
          opacity={0.9}
          lineWidth={2}
          renderOrder={RenderOrder.plantLabels} />
      </Group>}
    <React.Suspense>
      <Detailed distances={detailDistances}>
        <Surface {...soilProps}>
          <SurfaceMaterial {...surfaceMaterialProps}>
            {surfaceTexture}
          </SurfaceMaterial>
        </Surface>
        <Surface {...soilProps}>
          <MeshPhongMaterial {...commonSoil} color={"#29231e"} />
        </Surface>
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
        position={moistureSurfacePosition}
      />}
    {legGroups}
    <UtilitiesPost config={props.config} activeFocus={props.activeFocus} />
    <Packaging config={props.config} />
  </Group>;
});
