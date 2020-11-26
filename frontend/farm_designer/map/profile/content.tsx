import React from "react";
import { uniq, sortBy, ceil, range, isUndefined, cloneDeep } from "lodash";
import { TaggedPoint } from "farmbot";
import {
  GetProfileX, GetProfileXFromNumber, GetProfileXProps,
  ProfileGridProps, ProfilePointProps, ProfileSvgProps,
  ProfileToolProps, ProfileUtmProps, SelectPointsProps,
  WithinRangeProps,
} from "./interfaces";
import { Color } from "../../../ui";
import { getToolColor } from "../layers/tool_slots/tool_graphics";
import { getFbosZValue } from "../legend/z_display";
import { BotOriginQuadrant } from "../../interfaces";

/** Profile lines drawn through points of the same color in the selected region. */
export const ProfileSvg = (props: ProfileSvgProps) => {
  const { expanded, mapTransformProps, tools } = props;
  const lineAxis = props.axis;
  const profileAxis = lineAxis == "x" ? "y" : "x";
  const profilePoints = selectPoints({
    allPoints: props.allPoints,
    axis: lineAxis,
    position: props.position,
    selectionWidth: props.selectionWidth,
    botPositionX: props.botPosition.x,
  });
  const byColor = groupByColor(profilePoints, profileAxis);
  const width = ceil(props.botSize[profileAxis].value + 1, -2);
  const height = ceil(props.botSize.z.value + 1, -2);
  const soilHeight = getFbosZValue(props.sourceFbosConfig, "soil_height");
  const safeHeight = getFbosZValue(props.sourceFbosConfig, "safe_height");
  const getX = getProfileX({ profileAxis, mapTransformProps, width });
  return <svg className={expanded ? "expand" : undefined}
    viewBox={`-40 -20 ${width + 80} ${height + 40}`}
    preserveAspectRatio={expanded ? undefined : "none"}>
    {expanded && <Grid
      getX={getX} height={height} width={width} negativeZ={props.negativeZ} />}
    <line strokeWidth={3} stroke={Color.gridSoil}
      x1={0} y1={soilHeight} x2={width} y2={soilHeight} />
    <line strokeWidth={3} stroke={Color.blue}
      x1={0} y1={safeHeight} x2={width} y2={safeHeight} />
    {byColor.map(points => points.map((point, index) => {
      if (index == 0) {
        return expanded
          ? <DrawPoint key={point.uuid} getX={getX} point={point} tools={tools} />
          : <g key={point.uuid} />;
      }
      const prev = points[index - 1];
      const { color } = point.body.meta;
      return <g id={"profile-point"} key={point.uuid}
        stroke={color} fill={color} opacity={0.5}>
        <line strokeWidth={expanded ? 5 : 20}
          x1={getX(prev.body)} y1={Math.abs(prev.body.z)}
          x2={getX(point.body)} y2={Math.abs(point.body.z)} />
        {expanded && <DrawPoint point={point} getX={getX} tools={tools} />}
      </g>;
    }))}
    <UTM profileAxis={profileAxis} expanded={expanded} getX={getX}
      position={props.position} selectionWidth={props.selectionWidth}
      mountedToolInfo={props.mountedToolInfo}
      botPosition={props.botPosition} />
  </svg>;
};

export const getProfileX = (props: GetProfileXProps): GetProfileX =>
  (coordinate) => {
    const rawX = coordinate[props.profileAxis] || 0;
    return getProfileXFromNumber(props)(rawX);
  };

const getProfileXFromNumber =
  (props: GetProfileXProps): GetProfileXFromNumber =>
    (rawX) => {
      const { width } = props;
      const flipX = width - rawX;
      const { quadrant, xySwap } = props.mapTransformProps;
      const axis = props.profileAxis;
      const axisY = axis == "y";
      const axis1 = xySwap ? "y" : "x";
      const axis3 = xySwap ? "x" : "y";
      switch (quadrant) {
        case BotOriginQuadrant.ONE: return axis == axis1 ? flipX : rawX;
        case BotOriginQuadrant.TWO: return !xySwap && axisY ? flipX : rawX;
        case BotOriginQuadrant.THREE: return axis == axis3 && !axisY ? flipX : rawX;
        case BotOriginQuadrant.FOUR: return flipX;
      }
    };

/** Virtual UTM profile. */
const UTM = (props: ProfileUtmProps) => {
  const { x, y } = props.botPosition;
  const inProfile = !isUndefined(x) && !isUndefined(y) &&
    withinRange({
      axis: props.profileAxis == "x" ? "y" : "x",
      selectionWidth: props.selectionWidth,
      profilePosition: props.position,
      location: { x, y },
    });
  const profileUtmH = props.getX(props.botPosition);
  const profileUtmV = Math.abs(props.botPosition.z || 0);
  if (!inProfile) { return <g />; }
  if (!props.expanded) {
    return <g id={"UTM"} opacity={0.25}>
      <line strokeWidth={20} stroke={Color.darkGray}
        x1={profileUtmH} y1={0} x2={profileUtmH} y2={profileUtmV} />
      <rect fill={Color.black}
        x={profileUtmH - 5} y={profileUtmV - 5} width={10} height={10} />
    </g>;
  }
  return <g id={"UTM"} opacity={0.25}>
    <line strokeWidth={20} stroke={Color.darkGray}
      x1={profileUtmH - 40} y1={0}
      x2={profileUtmH - 40} y2={profileUtmV} />
    <rect fill={Color.darkGray}
      x={profileUtmH - 30} y={profileUtmV - 40}
      width={60} height={40} />
    <rect fill={Color.black}
      x={profileUtmH - 2} y={profileUtmV - 2}
      width={4} height={4} />
    <image x={profileUtmH - 25} y={profileUtmV - 35} width={50} height={30}
      xlinkHref={"/app-resources/img/farmbot.svg"} />
    {props.mountedToolInfo.name &&
      <ToolProfile toolName={props.mountedToolInfo.name}
        x={profileUtmH - 30} y={profileUtmV} width={60} height={20} />}
  </g>;
};

/** SVG tool profile element with color and label. */
const ToolProfile = (props: ProfileToolProps) => {
  const { toolName, x, y, width, height } = props;
  return <g id={"profile-tool"}>
    <rect fill={getToolColor(toolName)}
      x={x} y={y} width={width} height={height} />
    <text x={x + 5} y={y + 15}
      textLength={width - 10} lengthAdjust={"spacingAndGlyphs"}
      stroke={"none"} fill={Color.offWhite} fontWeight={"bold"}>
      {toolName}
    </text>
  </g>;
};

/** Point -> tool profile with color and label (if applicable). */
const ToolProfilePoint = (props: ProfilePointProps) => {
  const { point, tools } = props;
  if (point.body.pointer_type != "ToolSlot") { return <g />; }
  const { tool_id } = point.body;
  const toolName = tools.filter(tool => tool.body.id == tool_id)[0]?.body.name;
  return <ToolProfile toolName={toolName}
    x={props.getX(point.body) - 30} y={Math.abs(point.body.z)}
    width={60} height={20} />;
};

/** Profile point. */
const DrawPoint = (props: ProfilePointProps) => {
  const { point, tools } = props;
  const { color } = point.body.meta;
  return <g id={"profile-point"}>
    <ToolProfilePoint point={point} getX={props.getX} tools={tools} />
    <circle stroke={color} fill={color} opacity={0.5}
      cx={props.getX(point.body)} cy={Math.abs(point.body.z)} r={5} />
  </g>;
};

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
      <g key={v} id={"axis-labels"}>
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
const withinRange =
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
  })
    .filter((p: TaggedPoint) =>
      withinRange({
        axis,
        selectionWidth,
        profilePosition: position,
        location: p.body,
      }));
};

/** Separate selected points by color in preparation for profile line. */
const groupByColor = (profilePoints: TaggedPoint[], axis: "x" | "y") =>
  uniq(profilePoints.map(p => p.body.meta.color)).map(color =>
    sortBy(profilePoints.filter(p =>
      p.body.meta.color == color), `body.${axis}`));
