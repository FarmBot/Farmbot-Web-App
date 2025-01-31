import React from "react";
import { TaggedWeedPointer } from "farmbot";
import { ProfilePointProps } from "./interfaces";
import { Color } from "../../../ui";
import { defaultSpreadCmDia, scaleIcon } from "../util";
import { TaggedPlant } from "../interfaces";
import { BooleanSetting } from "../../../session_keys";
import { FilePath } from "../../../internal_urls";
import { findCrop, findIcon } from "../../../crops/find";

/** Plant point profile. */
export const PlantPoint = (props: ProfilePointProps<TaggedPlant>) => {
  const { point, getX, soilHeight, getConfigValue, designer } = props;
  const currentPlantUuid = designer.selectedPoints?.[0];
  const radius = point.uuid == currentPlantUuid && designer.hoveredSpread
    ? designer.hoveredSpread / 2
    : point.body.radius;
  const plantIconSize = scaleIcon(radius) * 2;
  const slug = point.body.openfarm_slug;
  const spreadDiaCm = findCrop(slug).spread;
  const icon = findIcon(slug);
  const spreadRadius = (spreadDiaCm || defaultSpreadCmDia(radius)) / 2 * 10;
  const profileX = getX(point.body);
  const profileY = point.body.z == 0 ? soilHeight : point.body.z;
  const depth = point.kind == "Point"
    ? point.body.depth
    : 0;
  return <g id={"plant-profile-point"}>
    <defs>
      <radialGradient id={"plant-radius-gradient"}>
        <stop offset="90%" stopColor={Color.darkGreen} stopOpacity={0.1} />
        <stop offset="100%" stopColor={Color.darkGreen} stopOpacity={0} />
      </radialGradient>
    </defs>
    <clipPath id={`plant-radius-clip-path-${point.uuid}`}>
      <rect
        x={profileX - radius}
        y={profileY - radius}
        height={radius}
        width={radius * 2} />
    </clipPath>
    <clipPath id={`spread-clip-path-${point.uuid}`}>
      <rect
        x={profileX - spreadRadius - 2}
        y={profileY - spreadRadius - 2}
        height={spreadRadius + 2}
        width={(spreadRadius + 2) * 2} />
    </clipPath>
    <circle className={"plant-radius"} stroke={"none"}
      clipPath={`url(#plant-radius-clip-path-${point.uuid})`}
      cx={profileX} cy={profileY} r={radius}
      fill={"url(#plant-radius-gradient)"} />
    <g id={"plant-icon"}>
      <image className={"plant-image"}
        xlinkHref={icon}
        x={profileX - plantIconSize / 2}
        y={profileY - plantIconSize}
        height={plantIconSize}
        width={plantIconSize} />
    </g>
    {getConfigValue(BooleanSetting.show_spread) &&
      <circle className={"spread"} id={"spread-profile"} strokeWidth={2}
        cx={profileX} cy={profileY} r={spreadRadius}
        clipPath={`url(#spread-clip-path-${point.uuid})`}
        stroke={spreadDiaCm ? Color.darkGreen : Color.gray}
        opacity={0.5} fill={"none"} />}
    <circle id={"point-coordinate-indicator"} opacity={0.5}
      fill={Color.darkGreen} cx={profileX} cy={profileY} r={5} />
    <line id={"point-depth-indicator"} opacity={0.5}
      stroke={Color.darkGreen} strokeWidth={2}
      x1={profileX} y1={profileY}
      x2={profileX} y2={profileY + depth} />
    <circle id={"point-bottom-indicator"} opacity={0.5}
      fill={Color.darkGreen} cx={profileX} cy={profileY + depth} r={2} />
  </g>;
};

/** Weed point profile. */
export const WeedPoint = (props: ProfilePointProps<TaggedWeedPointer>) => {
  const { point } = props;
  const { radius } = point.body;
  const color = point.body.meta.color || Color.red;
  const plantIconSize = scaleIcon(radius) * 2;
  const profileX = props.getX(point.body);
  const profileY = props.soilHeight;
  return <g id={"weed-profile-point"}>
    <defs>
      <radialGradient id={`weed-radius-gradient-${point.uuid}`}>
        <stop offset="90%" stopColor={color} stopOpacity={0.1} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
    <clipPath id={`weed-radius-clip-path-${point.uuid}`}>
      <rect
        x={profileX - radius}
        y={profileY - radius}
        height={radius}
        width={radius * 2} />
    </clipPath>
    <circle className={"weed-radius"} stroke={"none"}
      clipPath={`url(#weed-radius-clip-path-${point.uuid})`}
      cx={profileX} cy={profileY} r={radius}
      fill={`url(#weed-radius-gradient-${point.uuid})`} />
    <g id={"weed-icon"}>
      <image className={"weed-image"}
        xlinkHref={FilePath.DEFAULT_WEED_ICON}
        x={profileX - plantIconSize / 2}
        y={profileY - plantIconSize}
        height={plantIconSize}
        width={plantIconSize} />
    </g>
    <circle id={"point-coordinate-indicator"} opacity={0.5}
      fill={color} cx={profileX} cy={profileY} r={5} />
  </g>;
};
