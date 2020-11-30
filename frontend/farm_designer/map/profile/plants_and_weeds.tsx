import React from "react";
import { TaggedWeedPointer } from "farmbot";
import { PlantPointState, ProfilePointProps } from "./interfaces";
import { Color } from "../../../ui";
import { defaultSpreadCmDia, scaleIcon } from "../util";
import { DEFAULT_ICON, svgToUrl } from "../../../open_farm/icons";
import { TaggedPlant } from "../interfaces";
import { cachedCrop } from "../../../open_farm/cached_crop";
import { DEFAULT_WEED_ICON } from "../layers/weeds/garden_weed";
import { BooleanSetting } from "../../../session_keys";

/** Plant point profile. */
export class PlantPoint
  extends React.Component<ProfilePointProps<TaggedPlant>, PlantPointState> {
  state: PlantPointState = {
    icon: DEFAULT_ICON,
    spreadDiaCm: defaultSpreadCmDia(this.props.point.body.radius),
  };

  componentDidMount() {
    cachedCrop(this.props.point.body.openfarm_slug)
      .then(({ svg_icon, spread }) =>
        this.setState({ icon: svgToUrl(svg_icon), spreadDiaCm: spread || 0 }));
  }

  render() {
    const { point, getX, soilHeight, getConfigValue } = this.props;
    const { icon, spreadDiaCm } = this.state;
    const { radius } = point.body;
    const plantIconSize = scaleIcon(radius) * 2;
    const spreadRadius = (spreadDiaCm || defaultSpreadCmDia(radius)) / 2 * 10;
    const profileX = getX(point.body);
    const profileY = soilHeight;
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
          x={profileX - spreadRadius}
          y={profileY - spreadRadius}
          height={spreadRadius}
          width={spreadRadius * 2} />
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
    </g>;
  }
}

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
        xlinkHref={DEFAULT_WEED_ICON}
        x={profileX - plantIconSize / 2}
        y={profileY - plantIconSize}
        height={plantIconSize}
        width={plantIconSize} />
    </g>
    <circle id={"point-coordinate-indicator"} opacity={0.5}
      fill={color} cx={profileX} cy={profileY} r={5} />
  </g>;
};
