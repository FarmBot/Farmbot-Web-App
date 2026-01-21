import React from "react";
import { Config } from "../config";
import { Instance, Instances } from "@react-three/drei";
import {
  BoxGeometry, Group, MeshBasicMaterial, SphereGeometry,
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
  InstancedBufferAttribute,
  InstancedMesh,
  WebGLProgramParametersWithUniforms,
} from "three";

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

export const MoistureSurface = React.memo((props: MoistureSurfaceProps) => {
  const moistureReadings = React.useMemo(() =>
    filterMoistureReadings(props.sensorReadings, props.sensors).readings,
  [props.sensorReadings, props.sensors]);
  const options = React.useMemo(() => ({
    stepSize: props.config.interpolationStepSize,
    useNearest: props.config.interpolationUseNearest,
    power: props.config.interpolationPower,
  }), [
    props.config.interpolationPower,
    props.config.interpolationStepSize,
    props.config.interpolationUseNearest,
  ]);
  const gridSize = React.useMemo(() => ({
    x: props.config.bedLengthOuter,
    y: props.config.bedWidthOuter,
  }), [props.config.bedLengthOuter, props.config.bedWidthOuter]);
  const [data, setData] = React.useState(
    () => getInterpolationData("SensorReading"));
  // eslint-disable-next-line no-null/no-null
  const ref = React.useRef<InstancedMesh>(null);
  React.useEffect(() => {
    generateData({
      kind: "SensorReading",
      points: moistureReadings,
      gridSize,
      getColor: getMoistureColor,
      options,
    });
    setData(getInterpolationData("SensorReading"));
  }, [gridSize, moistureReadings, options]);
  const opacities = React.useMemo(() => {
    const values = new Float32Array(data.length);
    data.forEach((d, i) => {
      values[i] = getMoistureColor(d.z).a;
    });
    return values;
  }, [data]);
  React.useEffect(() => {
    ref.current?.geometry?.setAttribute("instanceOpacity",
      new InstancedBufferAttribute(opacities, 1));
  }, [opacities]);
  const boxArgs = React.useMemo<[number, number, number]>(
    () => [options.stepSize, options.stepSize, options.stepSize],
    [options.stepSize],
  );
  const onBeforeCompile = React.useCallback(
    (shader: WebGLProgramParametersWithUniforms) => {
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
    }, []);
  const instances = React.useMemo(() => data.map(p => {
    const { x, y, z } = p;
    return <Instance
      key={`${x}-${y}`}
      position={[x, y, z / 2]}
      color={getMoistureColor(z).rgb} />;
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
      <Instances limit={data.length} ref={ref}>
        <BoxGeometry args={boxArgs} />
        <MeshBasicMaterial transparent={true} opacity={0.75}
          onBeforeCompile={onBeforeCompile} />
        {instances}
      </Instances>}
  </Group>;
});

export interface MoistureReadingsProps {
  readings: TaggedSensorReading[];
  config: Config;
  color: string;
  radius: number;
  applyOffset?: boolean;
  readingZOverride?: number;
}

export const MoistureReadings = React.memo((props: MoistureReadingsProps) => {
  const { bedLengthOuter, bedWidthOuter, bedXOffset, bedYOffset } = props.config;
  const groupPosition = React.useMemo<[number, number, number]>(() => (
    props.applyOffset
      ? [
        threeSpace(0, bedLengthOuter) + bedXOffset,
        threeSpace(0, bedWidthOuter) + bedYOffset,
        zZero(props.config),
      ]
      : [0, 0, 0]
  ), [
    bedLengthOuter,
    bedWidthOuter,
    bedXOffset,
    bedYOffset,
    props.config.columnLength,
    props.config.zGantryOffset,
    props.applyOffset,
  ]);
  const readingPositions = React.useMemo<[number, number, number][]>(
    () => props.readings.map(reading => ([
      reading.body.x || 0,
      reading.body.y || 0,
      props.readingZOverride ?? (reading.body.z || 0),
    ])),
    [
      props.readings,
      props.readingZOverride,
    ],
  );
  const instanceCount = readingPositions.length;
  const instanceLimit = instanceCount > 0 ? instanceCount : 1;
  const readingInstances = React.useMemo(() => readingPositions.map(
    (position, index) =>
      <Instance key={`${index}-${position.join("-")}`}
        position={position} />,
  ), [readingPositions]);
  return <Group position={groupPosition}>
    <Instances limit={instanceLimit} range={instanceCount}>
      <SphereGeometry args={[props.radius, 16, 16]} />
      <MeshBasicMaterial color={props.color} />
      {readingInstances}
    </Instances>
  </Group>;
});
