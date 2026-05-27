import React from "react";
import { Config } from "../config";
import { Sphere } from "@react-three/drei";
import {
  BoxGeometry, Group, InstancedMesh as InstancedMeshComponent,
  MeshBasicMaterial,
} from "../components";
import { TaggedSensor, TaggedSensorReading } from "farmbot";
import { threeSpace, zZero } from "../helpers";
import {
  generateData, getInterpolationData,
} from "../../farm_designer/map/layers/points/interpolation_map";
import {
  filterMoistureReadings, getMoistureColor,
} from "../../farm_designer/map/layers/sensor_readings/sensor_readings_layer";
import { Color, Matrix4 } from "three";
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

export const MoistureSurface = (props: MoistureSurfaceProps) => {
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
    perfMeasure("moistureInstanceNodesMs", () => {
      const matrices = new Float32Array(data.length * 16);
      const colors = new Float32Array(data.length * 3);
      const opacities = new Float32Array(data.length);
      const matrix = new Matrix4();
      const instanceColor = new Color();
      data.map((d, i) => {
        const color = getMoistureColor(d.z);
        matrix.identity().setPosition(d.x, d.y, d.z / 2);
        matrix.toArray(matrices, i * 16);
        instanceColor.set(color.rgb).toArray(colors, i * 3);
        opacities[i] = color.a;
      });
      return { matrices, colors, opacities };
    }), [data]);
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

export interface MoistureReadingsProps {
  readings: TaggedSensorReading[];
  config: Config;
  color: string;
  radius: number;
  applyOffset?: boolean;
  readingZOverride?: number;
}

export const MoistureReadings = (props: MoistureReadingsProps) => {
  const { bedLengthOuter, bedWidthOuter, bedXOffset, bedYOffset } = props.config;
  return <Group position={props.applyOffset
    ? [
      threeSpace(0, bedLengthOuter) + bedXOffset,
      threeSpace(0, bedWidthOuter) + bedYOffset,
      zZero(props.config),
    ]
    : [0, 0, 0]}>
    {props.readings.map(reading =>
      <Sphere
        key={reading.uuid}
        args={[props.radius, 16, 16]}
        position={[
          reading.body.x || 0,
          reading.body.y || 0,
          props.readingZOverride ?? (reading.body.z || 0),
        ]}>
        <MeshBasicMaterial color={props.color} />
      </Sphere>)}
  </Group>;
};
