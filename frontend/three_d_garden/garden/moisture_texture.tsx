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
import {
  Color, InstancedBufferAttribute, InstancedMesh, Matrix4,
} from "three";
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
  // eslint-disable-next-line no-null/no-null
  const ref = React.useRef<InstancedMesh>(null);
  const tempMatrix = React.useMemo(() => new Matrix4(), []);
  const tempColor = React.useMemo(() => new Color(), []);
  React.useLayoutEffect(() => {
    perfMeasure("moistureInstanceNodesMs", () => {
      const mesh = ref.current;
      if (!mesh) { return; }
      const opacities = new Float32Array(data.length);
      data.map((d, i) => {
        const color = getMoistureColor(d.z);
        tempMatrix.identity().setPosition(d.x, d.y, d.z / 2);
        mesh.setMatrixAt(i, tempMatrix);
        mesh.setColorAt(i, tempColor.set(color.rgb));
        opacities[i] = color.a;
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
      }
      mesh.geometry?.setAttribute("instanceOpacity",
        new InstancedBufferAttribute(opacities, 1));
    });
  }, [data, tempColor, tempMatrix]);
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
        ref={ref}
        args={[undefined, undefined, data.length]}
        count={data.length}>
        <BoxGeometry
          args={[options.stepSize, options.stepSize, options.stepSize]} />
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
