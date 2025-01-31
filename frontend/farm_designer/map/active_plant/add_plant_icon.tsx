import React from "react";
import { round, scaleIcon, transformXY } from "../util";
import { AxisNumberProperty, MapTransformProps } from "../interfaces";
import { Path } from "../../../internal_urls";
import { findIcon } from "../../../crops/find";
import { DesignerState } from "../../interfaces";
import { DEFAULT_PLANT_RADIUS } from "../../plant";

export interface AddPlantIconProps {
  designer: DesignerState;
  cursorPosition: AxisNumberProperty | undefined;
  mapTransformProps: MapTransformProps;
}

export const AddPlantIcon = (props: AddPlantIconProps) => {
  if (!props.cursorPosition) { return <g />; }
  const { x, y } = props.cursorPosition;
  const { qx, qy } = transformXY(round(x), round(y), props.mapTransformProps);
  const iconRadius = scaleIcon(props.designer.cropRadius || DEFAULT_PLANT_RADIUS);
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
