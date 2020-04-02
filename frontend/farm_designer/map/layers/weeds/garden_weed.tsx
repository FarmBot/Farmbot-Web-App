import * as React from "react";
import { GardenWeedProps } from "../../interfaces";
import { transformXY } from "../../util";
import { Actions } from "../../../../constants";
import { Color } from "../../../../ui";
import { mapPointClickAction } from "../../actions";

export const DEFAULT_WEED_ICON = "/app-resources/img/generic-weed.svg";

export const GardenWeed = (props: GardenWeedProps) => {

  const iconHover = (action: "start" | "end") => () => {
    const hover = action === "start";
    props.dispatch({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: hover ? props.weed.uuid : undefined
    });
  };

  const { weed, mapTransformProps, hovered, current, selected, animate } = props;
  const { id, x, y, meta, radius } = weed.body;
  const { qx, qy } = transformXY(x, y, mapTransformProps);
  const color = meta.color || "red";
  const stopOpacity = ["gray", "pink", "orange"].includes(color) ? 0.5 : 0.25;
  const className = [
    "weed-image", `is-chosen-${current || selected}`, animate ? "animate" : "",
  ].join(" ");
  const iconRadius = hovered ? radius * 0.88 : radius * 0.8;
  return <g id={`weed-${id}`} className={`map-weed ${color}`}
    onMouseEnter={iconHover("start")}
    onMouseLeave={iconHover("end")}
    onClick={mapPointClickAction(props.dispatch, weed.uuid,
      `/app/designer/weeds/${id}`)}>
    <defs>
      <radialGradient id={`Weed${id}Gradient`}>
        <stop offset="90%" stopColor={color} stopOpacity={stopOpacity} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>

    {animate &&
      <circle
        className="soil-cloud"
        cx={qx}
        cy={qy}
        r={radius}
        fill={Color.soilCloud}
        fillOpacity={0} />}

    {props.spreadVisible &&
      <circle
        id={"weed-radius"}
        cx={qx}
        cy={qy}
        r={radius}
        fill={`url(#Weed${id}Gradient)`}
        opacity={hovered ? 1 : 0.5} />}

    <g id="weed-icon">
      <image
        className={className}
        xlinkHref={DEFAULT_WEED_ICON}
        height={iconRadius * 2}
        width={iconRadius * 2}
        x={qx - iconRadius}
        y={qy - iconRadius} />
    </g>
  </g>;
};
