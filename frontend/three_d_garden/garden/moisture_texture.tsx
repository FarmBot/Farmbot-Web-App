import React from "react";
import { Config } from "../config";
import { Instance, Instances, Sphere } from "@react-three/drei";
import { BoxGeometry, Group, MeshBasicMaterial } from "../components";
import { TaggedSensor, TaggedSensorReading } from "farmbot";
import { threeSpace, zZero } from "../helpers";
import {
  generateData, getInterpolationData,
} from "../../farm_designer/map/layers/points/interpolation_map";
import {
  filterMoistureReadings, getMoistureColor,
} from "../../farm_designer/map/layers/sensor_readings/sensor_readings_layer";
import { InstancedBufferAttribute, InstancedMesh } from "three";

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
  const { readings: moistureReadings } =
    filterMoistureReadings(props.sensorReadings, props.sensors);
  const options = {
    stepSize: props.config.interpolationStepSize,
    useNearest: props.config.interpolationUseNearest,
    power: props.config.interpolationPower,
  };
  generateData({
    kind: "SensorReading",
    points: moistureReadings,
    gridSize: { x: props.config.bedLengthOuter, y: props.config.bedWidthOuter },
    getColor: getMoistureColor,
    options,
  });
  const data = getInterpolationData("SensorReading");
  // eslint-disable-next-line no-null/no-null
  const ref = React.useRef<InstancedMesh>(null);
  React.useEffect(() => {
    const opacities = new Float32Array(data.length);
    data.map((d, i) => {
      opacities[i] = getMoistureColor(d.z).a;
    });
    ref.current?.geometry?.setAttribute("instanceOpacity",
      new InstancedBufferAttribute(opacities, 1));
  }, [data]);
  return <Group position={props.position} name={"moisture-layer"}>
    {props.showMoistureReadings &&
      <MoistureReadings
        config={props.config}
        color={props.color}
        radius={props.radius}
        readingZOverride={props.readingZOverride}
        readings={props.sensorReadings} />}
    {props.showMoistureMap &&
      <Instances limit={data.length} ref={ref}>
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
        {data.map(p => {
          const { x, y, z } = p;
          return <Instance
            key={`${x}-${y}`}
            position={[x, y, z / 2]}
            color={getMoistureColor(z).rgb} />;
        })}
      </Instances>}
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
