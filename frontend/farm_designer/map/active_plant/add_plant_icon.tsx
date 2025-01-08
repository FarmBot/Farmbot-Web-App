import React from "react";
import { round, scaleIcon, transformXY } from "../util";
import { AxisNumberProperty, MapTransformProps } from "../interfaces";
import { Path } from "../../../internal_urls";
import { findIcon } from "../../../crops/find";

export interface AddPlantIconProps {
  cursorPosition: AxisNumberProperty | undefined;
  mapTransformProps: MapTransformProps;
}

export const AddPlantIcon = (props: AddPlantIconProps) => {
  if (!props.cursorPosition) { return <g />; }
  const { x, y } = props.cursorPosition;
  const radius = 25;
  const { qx, qy } = transformXY(round(x), round(y), props.mapTransformProps);
  const iconRadius = scaleIcon(radius);
  const icon = findIcon(Path.getCropSlug());
  return <g id="adding-plant-icon">
    <image
      className={"adding-plant"}
      style={{ pointerEvents: "none" }}
      x={qx - iconRadius}
      y={qy - iconRadius}
      width={iconRadius * 2}
      height={iconRadius * 2}
      xlinkHref={icon} />
  </g>;
};
