import React from "react";
import { Config } from "../config";
import {
  BoxGeometry, Group, InstancedMesh as InstancedMeshComponent,
  MeshBasicMaterial, SphereGeometry,
} from "../components";
import { TaggedSensor, TaggedSensorReading } from "farmbot";
import { threeSpace, zZero } from "../helpers";
import {
  generateData, getInterpolationData, type InterpolationData,
} from "../../farm_designer/map/layers/points/interpolation_data";
import {
  filterMoistureReadings,
} from "../../farm_designer/map/layers/sensor_readings/filter_moisture_readings";
import { getMoistureColor } from "../../farm_designer/map/layers/sensor_readings/moisture";
import { Matrix4 } from "three";
import { perfMeasure } from "../../performance/perf";

export interface MoistureSurfaceProps {
  position: [number, number, number];
  sensors: TaggedSensor[];
  sensorReadings: TaggedSensorReading[];
  config: Config;
  color: string;
  radius: number;
  readingZOverride?: number;
  showMoistureReadings: boolean;
  showMoistureMap: boolean;
}

interface MoistureInstanceBuffers {
  matrices: Float32Array;
  colors: Float32Array;
  opacities: Float32Array;
}

export const getMoistureOpacity = (value: number) =>
  value > 900
    ? 0
    : Math.round((0.75 * value / 900) ** 3 * 100) / 100;

export const buildMoistureInstanceBuffers =
  (data: InterpolationData): MoistureInstanceBuffers => {
    const matrices = new Float32Array(data.length * 16);
    const colors = new Float32Array(data.length * 3);
    const opacities = new Float32Array(data.length);
    data.map((d, i) => {
      const matrixOffset = i * 16;
      matrices[matrixOffset] = 1;
      matrices[matrixOffset + 5] = 1;
      matrices[matrixOffset + 10] = 1;
      matrices[matrixOffset + 12] = d.x;
      matrices[matrixOffset + 13] = d.y;
      matrices[matrixOffset + 14] = d.z / 2;
      matrices[matrixOffset + 15] = 1;
      if (d.z <= 900) { colors[i * 3 + 2] = 1; }
      opacities[i] = getMoistureOpacity(d.z);
    });
    return { matrices, colors, opacities };
  };

const MOISTURE_SURFACE_CONFIG_FIELDS: (keyof Config)[] = [
  "interpolationStepSize",
  "interpolationUseNearest",
  "interpolationPower",
  "bedLengthOuter",
  "bedWidthOuter",
];

export const moistureSurfacePropsEqual = (
  prev: MoistureSurfaceProps,
  next: MoistureSurfaceProps,
) =>
  prev.position[0] === next.position[0] &&
  prev.position[1] === next.position[1] &&
  prev.position[2] === next.position[2] &&
  prev.sensors === next.sensors &&
  prev.sensorReadings === next.sensorReadings &&
  prev.color === next.color &&
  prev.radius === next.radius &&
  prev.readingZOverride === next.readingZOverride &&
  prev.showMoistureReadings === next.showMoistureReadings &&
  prev.showMoistureMap === next.showMoistureMap &&
  MOISTURE_SURFACE_CONFIG_FIELDS.every(field =>
    prev.config[field] === next.config[field]);

const MoistureSurfaceBase = (props: MoistureSurfaceProps) => {
  const {
    interpolationStepSize,
    interpolationUseNearest,
    interpolationPower,
    bedLengthOuter,
    bedWidthOuter,
  } = props.config;
  const options = React.useMemo(() => ({
    stepSize: interpolationStepSize,
    useNearest: interpolationUseNearest,
    power: interpolationPower,
  }), [
    interpolationPower,
    interpolationStepSize,
    interpolationUseNearest,
  ]);
  const data = React.useMemo(() => perfMeasure("moistureSurfaceMs", () => {
    if (!props.showMoistureMap) { return []; }
    const { readings: moistureReadings } =
      filterMoistureReadings(props.sensorReadings, props.sensors);
    generateData({
      kind: "SensorReading",
      points: moistureReadings,
      gridSize: {
        x: bedLengthOuter,
        y: bedWidthOuter,
      },
      getColor: getMoistureColor,
      options,
    });
    return getInterpolationData("SensorReading");
  }), [
    bedLengthOuter,
    bedWidthOuter,
    options,
    props.sensorReadings,
    props.sensors,
    props.showMoistureMap,
  ]);
  const buffers = React.useMemo<MoistureInstanceBuffers>(() =>
    perfMeasure("moistureInstanceNodesMs", () =>
      buildMoistureInstanceBuffers(data)), [data]);
  return <Group position={props.position} name={"moisture-layer"}>
    {props.showMoistureReadings &&
      <MoistureReadings
        config={props.config}
        color={props.color}
        radius={props.radius}
        readingZOverride={props.readingZOverride}
        readings={props.sensorReadings} />}
    {props.showMoistureMap &&
      <InstancedMeshComponent
        args={[undefined, undefined, data.length]}
        count={data.length}>
        <instancedBufferAttribute
          attach={"instanceMatrix"}
          args={[buffers.matrices, 16]} />
        <instancedBufferAttribute
          attach={"instanceColor"}
          args={[buffers.colors, 3]} />
        <BoxGeometry
          args={[options.stepSize, options.stepSize, options.stepSize]}>
          <instancedBufferAttribute
            attach={"attributes-instanceOpacity"}
            args={[buffers.opacities, 1]} />
        </BoxGeometry>
        <MeshBasicMaterial transparent={true} opacity={0.75}
          onBeforeCompile={shader => {
            shader.vertexShader = `
               attribute float instanceOpacity;
               varying float vInstanceOpacity;
               ` + shader.vertexShader;
            shader.vertexShader = shader.vertexShader
              .replace(
                "#include <begin_vertex>",
                `vInstanceOpacity = instanceOpacity;
               #include <begin_vertex>`);
            shader.fragmentShader = `
            varying float vInstanceOpacity;
            ` + shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader
              .replace(
                "vec4 diffuseColor = vec4( diffuse, opacity );",
                "vec4 diffuseColor = vec4( diffuse, opacity * vInstanceOpacity );");
          }} />
      </InstancedMeshComponent>}
  </Group>;
};

export const MoistureSurface = React.memo(
  MoistureSurfaceBase,
  moistureSurfacePropsEqual,
);

export interface MoistureReadingsProps {
  readings: TaggedSensorReading[];
  config: Config;
  color: string;
  radius: number;
  applyOffset?: boolean;
  readingZOverride?: number;
}

const MOISTURE_READING_CONFIG_FIELDS: (keyof Config)[] = [
  "bedLengthOuter",
  "bedWidthOuter",
  "bedXOffset",
  "bedYOffset",
  "columnLength",
  "zGantryOffset",
];

export const moistureReadingsPropsEqual = (
  prev: MoistureReadingsProps,
  next: MoistureReadingsProps,
) =>
  prev.readings === next.readings &&
  prev.color === next.color &&
  prev.radius === next.radius &&
  prev.applyOffset === next.applyOffset &&
  prev.readingZOverride === next.readingZOverride &&
  MOISTURE_READING_CONFIG_FIELDS.every(field =>
    prev.config[field] === next.config[field]);

const MoistureReadingsBase = (props: MoistureReadingsProps) => {
  const { bedLengthOuter, bedWidthOuter, bedXOffset, bedYOffset } = props.config;
  const matrices = React.useMemo(() => {
    const result = new Float32Array(props.readings.length * 16);
    const matrix = new Matrix4();
    props.readings.forEach((reading, index) => {
      matrix.identity().setPosition(
        reading.body.x || 0,
        reading.body.y || 0,
        props.readingZOverride ?? (reading.body.z || 0),
      );
      matrix.toArray(result, index * 16);
    });
    return result;
  }, [props.readingZOverride, props.readings]);
  return <Group position={props.applyOffset
    ? [
      threeSpace(0, bedLengthOuter) + bedXOffset,
      threeSpace(0, bedWidthOuter) + bedYOffset,
      zZero(props.config),
    ]
    : [0, 0, 0]}>
    <InstancedMeshComponent
      args={[undefined, undefined, props.readings.length]}
      count={props.readings.length}>
      <instancedBufferAttribute
        attach={"instanceMatrix"}
        args={[matrices, 16]} />
      <SphereGeometry args={[props.radius, 16, 16]} />
      <MeshBasicMaterial color={props.color} />
    </InstancedMeshComponent>
  </Group>;
};

export const MoistureReadings = React.memo(
  MoistureReadingsBase,
  moistureReadingsPropsEqual,
);
