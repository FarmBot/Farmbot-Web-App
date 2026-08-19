import React from "react";
import { Config, PositionConfig } from "../../config";
import { Line } from "@react-three/drei";
import { Group } from "../../components";
import {
  get3DPositionNoMirrorFunc,
  threeSpace,
  zero as zeroFunc,
  zDir as zDirFunc,
} from "../../helpers";
import { DistanceIndicator, Highlight } from "../../elements";
import { ControlPillButton, noControlRaycast } from "../../controls";
import { ThreeDObjectSelectionHandler } from "../../selection_types";
import { t } from "../../../i18next_wrapper";

export interface BoundsProps {
  config: Config;
  configPosition: PositionConfig;
  onSelectObject?: ThreeDObjectSelectionHandler;
}

const CONFIG_FIELDS: (keyof Config)[] = [
  "bedLengthOuter", "bedWidthOuter", "zAxisLength", "columnLength",
  "beamLength", "bounds", "zDimension", "distanceIndicator", "bedXOffset",
  "bedYOffset", "botSizeX", "botSizeY", "botSizeZ", "negativeZ",
  "zGantryOffset",
  "safeHeight", "minSoilZ", "maxSoilZ",
];

const sameFields = <T, K extends keyof T>(
  prev: T,
  next: T,
  fields: K[],
) => fields.every(field => prev[field] === next[field]);

export const areBoundsPropsEqual = (prev: BoundsProps, next: BoundsProps) => {
  if (prev.onSelectObject !== next.onSelectObject) { return false; }
  if (!sameFields(prev.config, next.config, CONFIG_FIELDS)) { return false; }
  const positionFields = new Set<keyof PositionConfig>();
  if (prev.config.zDimension) { positionFields.add("z"); }
  switch (prev.config.distanceIndicator) {
    case "beamLength":
    case "columnLength":
      positionFields.add("x");
      break;
    case "zAxisLength":
      positionFields.add("x");
      positionFields.add("y");
      positionFields.add("z");
      break;
  }
  return sameFields(
    prev.configPosition,
    next.configPosition,
    [...positionFields],
  );
};

interface HeightPlaneProps {
  color: string;
  config: Config;
  label: string;
  name: string;
  pillYOffset: number;
  z: number;
  onClick(): void;
}

type BoundsPoint = [number, number, number];

export const heightPlanePillLength = (
  label: string,
  labelSize: number,
  minimum = 150,
) => Math.max(
  minimum,
  Math.ceil(Array.from(label).length * labelSize * 0.6 + 48),
);

const rectangleSegments = (
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  z: number,
): BoundsPoint[] => [
  [minX, minY, z], [maxX, minY, z],
  [maxX, minY, z], [maxX, maxY, z],
  [maxX, maxY, z], [minX, maxY, z],
  [minX, maxY, z], [minX, minY, z],
];

export const getBoundsLinePoints = (config: Config): BoundsPoint[] => {
  const zero = zeroFunc(config);
  const maxX = zero.x + config.botSizeX;
  const maxY = zero.y + config.botSizeY;
  const bottom = zero.z - config.botSizeZ;
  const vertical: BoundsPoint[] = [
    [zero.x, zero.y, bottom], [zero.x, zero.y, zero.z],
    [maxX, zero.y, bottom], [maxX, zero.y, zero.z],
    [maxX, maxY, bottom], [maxX, maxY, zero.z],
    [zero.x, maxY, bottom], [zero.x, maxY, zero.z],
  ];
  const top = config.safeHeight == 0
    ? []
    : rectangleSegments(zero.x, zero.y, maxX, maxY, zero.z);
  return [
    ...rectangleSegments(zero.x, zero.y, maxX, maxY, bottom),
    ...vertical,
    ...top,
  ];
};

const HeightPlane = (props: HeightPlaneProps) => {
  const { botSizeX, botSizeY } = props.config;
  const getWorldPosition = get3DPositionNoMirrorFunc(props.config);
  const zero = zeroFunc(props.config);
  const start = getWorldPosition({ x: 0, y: 0 });
  const end = getWorldPosition({ x: botSizeX, y: botSizeY });
  const z = zero.z + props.z;
  const label = t(props.label);
  const labelSize = 24;
  return <Group name={`${props.name}-plane`}>
    <Line
      name={`${props.name}-lines`}
      points={[
        [start.x, start.y, z],
        [end.x, start.y, z],
        [end.x, end.y, z],
        [start.x, end.y, z],
        [start.x, start.y, z],
      ]}
      color={props.color}
      lineWidth={2}
      raycast={noControlRaycast} />
    <ControlPillButton
      name={`${props.name}-pill`}
      position={[
        start.x,
        (start.y + end.y) / 2 + props.pillYOffset,
        z + 12,
      ]}
      rotation={[Math.PI / 2, Math.PI / 2, 0]}
      label={label}
      length={heightPlanePillLength(label, labelSize)}
      width={48}
      thickness={10}
      labelSize={labelSize}
      color={props.color}
      hoverColor={props.color}
      depthTest={true}
      depthWrite={true}
      onClick={props.onClick} />
  </Group>;
};

const BoundsComponent = (props: BoundsProps) => {
  if (!props.config.bounds &&
    !props.config.zDimension &&
    !props.config.distanceIndicator) {
    return <></>;
  }
  const {
    bedLengthOuter, bedWidthOuter,
    zAxisLength, columnLength, beamLength, bounds,
    bedYOffset,
  } = props.config;
  const { x, y, z } = props.configPosition;
  const zDir = zDirFunc(props.config);
  const zero = zeroFunc(props.config);
  const get3DPosition = get3DPositionNoMirrorFunc(props.config);
  return <Group name={"bounds-and-distances"}>
    <Line name={"bounds"}
      visible={bounds}
      segments={true}
      points={getBoundsLinePoints(props.config)}
      lineWidth={1.1}
      color={"white"}
      raycast={noControlRaycast} />
    {bounds && <Highlight highlightName={"safe-height"}>
      <HeightPlane
        name={"safe-height"}
        label={"Safe height"}
        color={"green"}
        config={props.config}
        z={props.config.safeHeight}
        pillYOffset={0}
        onClick={() => props.onSelectObject?.({ kind: "safeHeight", id: 0 })} />
    </Highlight>}
    {bounds && <Highlight highlightName={"soil-height"}>
      <HeightPlane
        name={"min-soil"}
        label={"Min soil"}
        color={"#8b5a2b"}
        config={props.config}
        z={props.config.minSoilZ}
        pillYOffset={-120}
        onClick={() => props.onSelectObject?.({ kind: "soilHeight", id: 1 })} />
    </Highlight>}
    {bounds && <Highlight highlightName={"soil-height"}>
      <HeightPlane
        name={"max-soil"}
        label={"Max soil"}
        color={"#8b5a2b"}
        config={props.config}
        z={props.config.maxSoilZ}
        pillYOffset={120}
        onClick={() => props.onSelectObject?.({ kind: "soilHeight", id: 0 })} />
    </Highlight>}
    <Group visible={props.config.zDimension}>
      <DistanceIndicator
        start={{
          x: threeSpace(0, bedLengthOuter),
          y: threeSpace(bedWidthOuter, bedWidthOuter),
          z: 0,
        }}
        end={{
          x: threeSpace(0, bedLengthOuter),
          y: threeSpace(bedWidthOuter, bedWidthOuter),
          z: zero.z - z + zAxisLength,
        }} />
    </Group>
    <Group visible={props.config.distanceIndicator == "beamLength"}>
      <DistanceIndicator
        start={{
          x: get3DPosition({ x: x + 100,
            y: bedWidthOuter / 2 - beamLength / 2 - bedYOffset }).x,
          y: get3DPosition({ x: x + 100,
            y: bedWidthOuter / 2 - beamLength / 2 - bedYOffset }).y,
          z: columnLength + 200,
        }}
        end={{
          x: get3DPosition({ x: x + 100,
            y: bedWidthOuter / 2 + beamLength / 2 - bedYOffset }).x,
          y: get3DPosition({ x: x + 100,
            y: bedWidthOuter / 2 + beamLength / 2 - bedYOffset }).y,
          z: columnLength + 200,
        }} />
    </Group>
    <Group visible={props.config.distanceIndicator == "columnLength"}>
      <DistanceIndicator
        start={{
          x: get3DPosition({ x: x + 100,
            y: bedWidthOuter + 200 - bedYOffset }).x,
          y: get3DPosition({ x: x + 100,
            y: bedWidthOuter + 200 - bedYOffset }).y,
          z: 30,
        }}
        end={{
          x: get3DPosition({ x: x + 100,
            y: bedWidthOuter + 200 - bedYOffset }).x,
          y: get3DPosition({ x: x + 100,
            y: bedWidthOuter + 200 - bedYOffset }).y,
          z: 30 + columnLength,
        }} />
    </Group>
    <Group visible={props.config.distanceIndicator == "zAxisLength"}>
      <DistanceIndicator
        start={{
          x: get3DPosition({ x: x + 100, y }).x,
          y: get3DPosition({ x: x + 100, y }).y,
          z: zero.z - zDir * z,
        }}
        end={{
          x: get3DPosition({ x: x + 100, y }).x,
          y: get3DPosition({ x: x + 100, y }).y,
          z: zero.z - zDir * z + zAxisLength,
        }} />
    </Group>
  </Group>;
};

export const Bounds = React.memo(BoundsComponent, areBoundsPropsEqual);
