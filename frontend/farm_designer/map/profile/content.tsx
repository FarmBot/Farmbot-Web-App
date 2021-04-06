import React from "react";
import { uniq, sortBy, ceil, range, cloneDeep, reverse } from "lodash";
import { TaggedPoint, TaggedToolSlotPointer, TaggedWeedPointer } from "farmbot";
import {
  FlipProfileProps,
  GetProfileX, GetProfileXFromNumber, GetProfileXProps,
  InterpolatedSoilProps,
  LabeledHorizontalLineProps,
  ProfileGridProps, ProfilePointProps, ProfileSvgProps,
  SelectPointsProps,
  WithinRangeProps,
} from "./interfaces";
import { Color } from "../../../ui";
import { getFbosZValue } from "../legend/z_display";
import { BotOriginQuadrant } from "../../interfaces";
import { ToolProfilePoint, UTMProfile } from "./tools";
import { TaggedPlant } from "../interfaces";
import { t } from "../../../i18next_wrapper";
import { BooleanSetting } from "../../../session_keys";
import { PlantPoint, WeedPoint } from "./plants_and_weeds";
import { getInterpolationData } from "../layers/points/interpolation_map";
import { getPathArray } from "../../../history";

/** Profile lines drawn through points of the same color in the selected region. */
export const ProfileSvg = (props: ProfileSvgProps) => {
  const { expanded, mapTransformProps, tools, position } = props;
  const lineAxis = props.axis;
  const profileAxis = lineAxis == "x" ? "y" : "x";
  const profilePoints = selectPoints({
    allPoints: props.allPoints,
    axis: lineAxis,
    position: position,
    selectionWidth: props.selectionWidth,
    botPositionX: props.botPosition.x,
  });
  const byColor = groupByColor(profilePoints, profileAxis);
  const width = ceil(props.botSize[profileAxis].value + 1, -2);
  const soilHeight = getFbosZValue(props.sourceFbosConfig, "soil_height");
  const safeHeight = getFbosZValue(props.sourceFbosConfig, "safe_height");
  const maxHeight = Math.max(
    props.botSize.z.value + 1,
    Math.max(...props.allPoints.map(p => Math.abs(p.body.z))),
    soilHeight,
    safeHeight,
  );
  const height = ceil(maxHeight, -2);
  const getX = getProfileX({ profileAxis, mapTransformProps, width });
  const reversed = flipProfile({ profileAxis, mapTransformProps });
  return <svg className={expanded ? "expand" : undefined}
    id={`${profileAxis}-axis-profile-at-${lineAxis}-eq-${position[lineAxis]}`}
    viewBox={`-40 -20 ${width + 80} ${height + 40}`}
    preserveAspectRatio={expanded ? undefined : "none"}>
    {expanded && <Grid
      getX={getX} height={height} width={width} negativeZ={props.negativeZ} />}
    {expanded && getPathArray()[3] === "location_info" &&
      <InterpolatedSoil axis={lineAxis} getX={getX}
        position={position} selectionWidth={props.selectionWidth} />}
    <LabeledHorizontalLine id={"soil-height"} label={t("soil")}
      profileHeight={height} color={Color.gridSoil}
      y={soilHeight} width={width} expanded={expanded} />
    <LabeledHorizontalLine id={"safe-height"} label={t("safe")}
      color={Color.blue} y={safeHeight} width={width} expanded={expanded} />
    {!props.botSize.z.isDefault &&
      <LabeledHorizontalLine id={"z-max-height"} label={t("max")} dashed={true}
        color={Color.gray} y={props.botSize.z.value} width={width}
        expanded={expanded} />}
    {byColor.map((points, colorIndex) =>
      <g id={`${points[0].body.meta.color}-color-points`} key={colorIndex}>
        {points.map((point, index) => {
          if (index == 0) {
            return expanded
              ? <DrawPoint key={point.uuid} getX={getX} point={point}
                soilHeight={soilHeight} tools={tools} profileAxis={profileAxis}
                reversed={reversed} getConfigValue={props.getConfigValue} />
              : <g id={"not-expanded-singular-point"} key={point.uuid} />;
          }
          const prev = points[index - 1];
          const { color } = point.body.meta;
          return <g id={"profile-point-and-connector"} key={point.uuid}
            stroke={color} fill={color}>
            {color && point.body.pointer_type == "GenericPointer" &&
              props.getConfigValue(BooleanSetting.show_points) &&
              <line id={"profile-point-connector"}
                strokeWidth={expanded ? 5 : 20} opacity={0.5}
                x1={getX(prev.body)} y1={Math.abs(prev.body.z)}
                x2={getX(point.body)} y2={Math.abs(point.body.z)} />}
            {expanded && <DrawPoint point={point} getX={getX} tools={tools}
              soilHeight={soilHeight} profileAxis={profileAxis}
              reversed={reversed} getConfigValue={props.getConfigValue} />}
          </g>;
        })}
      </g>)}
    {props.getConfigValue(BooleanSetting.show_farmbot) &&
      <UTMProfile profileAxis={profileAxis} expanded={expanded} getX={getX}
        position={position} selectionWidth={props.selectionWidth}
        mountedToolInfo={props.mountedToolInfo} reversed={reversed}
        botPosition={props.botPosition} />}
  </svg>;
};

/** For safe and soil heights. */
const LabeledHorizontalLine = (props: LabeledHorizontalLineProps) =>
  <g id={props.id}>
    <line strokeWidth={3} stroke={props.color}
      strokeDasharray={props.dashed ? 10 : undefined}
      x1={0} y1={props.y} x2={props.width} y2={props.y} />
    {props.expanded && <text x={props.width - 5} y={props.y - 5}
      dominantBaseline={"bottom"} textAnchor={"end"}
      stroke={"none"} fill={props.color} fontWeight={"bold"}>
      {props.label}
    </text>}
    {props.profileHeight && props.y != 0 &&
      <rect x={0} y={props.y} fill={props.color} fillOpacity={0.5} stroke={"none"}
        width={props.width} height={props.profileHeight - props.y} />}
  </g>;

/** Determine profile SVG X coordinate based on profile and map orientation. */
export const getProfileX = (props: GetProfileXProps): GetProfileX =>
  (coordinate) => {
    const rawX = coordinate[props.profileAxis] || 0;
    return getProfileXFromNumber(props)(rawX);
  };

/** Change profile SVG X coordinate based on map orientation. */
const getProfileXFromNumber =
  (props: GetProfileXProps): GetProfileXFromNumber =>
    (rawX) => flipProfile(props) ? props.width - rawX : rawX;

/** Determine profile direction based on profile and map orientation. */
const flipProfile = (props: FlipProfileProps) => {
  const { quadrant, xySwap } = props.mapTransformProps;
  const axis = props.profileAxis;
  const axisY = axis == "y";
  const axis1 = xySwap ? "y" : "x";
  const axis3 = xySwap ? "x" : "y";
  switch (quadrant) {
    case BotOriginQuadrant.ONE: return axis == axis1;
    case BotOriginQuadrant.TWO: return !xySwap && axisY;
    case BotOriginQuadrant.THREE: return axis == axis3 && !axisY;
    case BotOriginQuadrant.FOUR: return true;
  }
};

/** Profile point. */
const DrawPoint = (props: ProfilePointProps) => {
  const { point, tools } = props;
  return <g id={"profile-point"}>
    <PointGraphic point={point} getX={props.getX} tools={tools}
      soilHeight={props.soilHeight} profileAxis={props.profileAxis}
      reversed={props.reversed} getConfigValue={props.getConfigValue} />
  </g>;
};

const PointGraphic = (props: ProfilePointProps) => {
  const { point } = props;
  const { color } = props.point.body.meta;
  switch (point.body.pointer_type) {
    case "ToolSlot":
      return props.getConfigValue(BooleanSetting.show_farmbot)
        ? <ToolProfilePoint
          {...props as ProfilePointProps<TaggedToolSlotPointer>} />
        : <g id={"tools-hidden"} />;
    case "Plant":
      return props.getConfigValue(BooleanSetting.show_plants)
        ? <PlantPoint
          {...props as ProfilePointProps<TaggedPlant>} />
        : <g id={"plants-hidden"} />;
    case "Weed":
      return props.getConfigValue(BooleanSetting.show_weeds)
        ? <WeedPoint
          {...props as ProfilePointProps<TaggedWeedPointer>} />
        : <g id={"weeds-hidden"} />;
    case "GenericPointer":
    default:
      return props.getConfigValue(BooleanSetting.show_points)
        ? <circle id={"profile-map-point"}
          opacity={0.5} stroke={color} fill={color}
          cx={props.getX(point.body)} cy={Math.abs(point.body.z)} r={5} />
        : <g id={"points-hidden"} />;
  }
};

/** Draw interpolated soil height profile. */
const InterpolatedSoil = (props: InterpolatedSoilProps) =>
  <g id={"interpolated-soil-height"}>
    {getInterpolationData()
      .filter(p =>
        withinProfileRange({
          axis: props.axis,
          selectionWidth: props.selectionWidth,
          profilePosition: props.position,
          location: p,
        }))
      .map(p =>
        <rect key={`${p.x}-${p.y}`}
          x={props.getX(p) - 12.5} y={Math.abs(p.z)} width={25} height={1}
          fillOpacity={0.85} />)}
  </g>;

/** Profile grid lines and labels. */
const Grid = (props: ProfileGridProps) => {
  const { height, width, negativeZ, getX } = props;
  return <g id={"profile-grid"} color={Color.mediumGray} stroke={Color.mediumGray}
    strokeWidth={1} opacity={0.5}
    textAnchor={"middle"} dominantBaseline={"central"}>
    <rect x={0} y={0} width={width} height={height} fill={"none"} />
    <text x={-20} y={0}>{0}</text>
    <text x={width + 20} y={0}>{0}</text>
    {range(100, height, 100).map(v =>
      <g key={v} id={"z-axis-labels"}>
        <text x={-20} y={v}>{negativeZ ? -v : v}</text>
        <text x={width + 20} y={v}>{negativeZ ? -v : v}</text>
        <line x1={0} y1={v} x2={width} y2={v} />
      </g>)}
    {range(100, width, 100).map(h =>
      <g key={h} id={"axis-labels"}>
        <text x={h} y={height + 10}>{getX({ x: h, y: h, z: 0 })}</text>
        <line x1={h} y1={0} x2={h} y2={height} />
      </g>)}
  </g>;
};

/** Check if a location is within the profile line range. */
export const withinProfileRange =
  ({ axis, profilePosition, selectionWidth, location }: WithinRangeProps) =>
    (profilePosition[axis] - selectionWidth / 2) < location[axis] &&
    location[axis] < (profilePosition[axis] + selectionWidth / 2);

/** Select points within `width` of line selected in map. */
const selectPoints = (props: SelectPointsProps) => {
  const { allPoints, axis, position, selectionWidth, botPositionX } = props;
  return allPoints.map(p => {
    const point = cloneDeep(p);
    if (p.body.pointer_type == "ToolSlot" && p.body.gantry_mounted) {
      point.body.x = botPositionX || 0;
    }
    return point;
  }).filter((p: TaggedPoint) =>
    withinProfileRange({
      axis,
      selectionWidth,
      profilePosition: position,
      location: p.body,
    }));
};

/** Separate selected points by color in preparation for profile line. */
const groupByColor = (profilePoints: TaggedPoint[], axis: "x" | "y") =>
  uniq(profilePoints.map(p => p.body.meta.color)).map(color =>
    reverse(sortBy(profilePoints.filter(p =>
      p.body.meta.color == color), ["body.pointer_type", `body.${axis}`])));
