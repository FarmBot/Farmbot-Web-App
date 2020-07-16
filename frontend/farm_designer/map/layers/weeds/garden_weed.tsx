import * as React from "react";
import { GardenWeedProps } from "../../interfaces";
import { transformXY, scaleIcon } from "../../util";
import { Actions } from "../../../../constants";
import { Color } from "../../../../ui";
import { mapPointClickAction, selectPoint } from "../../actions";
import { Circle } from "../plants/circle";

export const DEFAULT_WEED_ICON = "/app-resources/img/generic-weed.svg";

interface GardenWeedState {
  iconHovered: boolean;
}

export class GardenWeed
  extends React.Component<GardenWeedProps, GardenWeedState> {
  state: GardenWeedState = { iconHovered: false };

  iconHover = (action: "start" | "end") => () => {
    const startHover = action === "start";
    this.setState({ iconHovered: startHover });
    this.props.dispatch({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: startHover ? this.props.weed.uuid : undefined
    });
  };

  render() {
    const {
      weed, mapTransformProps, hovered, current, selected, animate,
      radiusVisible, dispatch,
    } = this.props;
    const { id, x, y, meta, radius } = weed.body;
    const { qx, qy } = transformXY(x, y, mapTransformProps);
    const color = meta.color || "red";
    const stopOpacity = ["gray", "pink", "orange"].includes(color) ? 0.5 : 0.25;
    const className = [
      "weed-image", `is-chosen-${current || selected}`, animate ? "animate" : "",
    ].join(" ");
    const plantIconSize = scaleIcon(radius);
    const iconRadius = hovered ? plantIconSize * 1.1 : plantIconSize;
    return <g id={`weed-${id}`} className={`map-weed ${color}`}
      onMouseEnter={this.iconHover("start")}
      onMouseLeave={this.iconHover("end")}
      onClick={() => {
        dispatch(selectPoint([weed.uuid]));
        mapPointClickAction(dispatch, weed.uuid,
          `/app/designer/weeds/${id}`)();
      }}>
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

      {radiusVisible &&
        <circle
          id={"weed-radius"}
          cx={qx}
          cy={qy}
          r={radius}
          fill={`url(#Weed${id}Gradient)`}
          opacity={hovered ? 1 : 0.5} />}

      {(current || selected || (hovered && !this.state.iconHovered)) &&
        <g id="selected-weed-indicator">
          <Circle
            className={`weed-indicator ${animate ? "animate" : ""}`}
            x={qx}
            y={qy}
            r={plantIconSize}
            selected={true} />
        </g>}

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
  }
}
