import * as React from "react";
import { GardenPointProps } from "../../interfaces";
import { transformXY } from "../../util";
import { Actions } from "../../../../constants";
import { mapPointClickAction } from "../../actions";

export const GardenPoint = (props: GardenPointProps) => {

  const iconHover = (action: "start" | "end") => () => {
    const hover = action === "start";
    props.dispatch({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: hover ? props.point.uuid : undefined
    });
  };

  const { point, mapTransformProps, hovered } = props;
  const { id, x, y, meta } = point.body;
  const { qx, qy } = transformXY(x, y, mapTransformProps);
  const color = meta.color || "green";
  return <g id={`point-${id}`} className={"map-point"} stroke={color}
    onMouseEnter={iconHover("start")}
    onMouseLeave={iconHover("end")}
    onClick={mapPointClickAction(props.dispatch, point.uuid,
      `/app/designer/points/${id}`)}>
    <circle id="point-radius" cx={qx} cy={qy} r={point.body.radius}
      fill={hovered ? color : "transparent"} />
    <circle id="point-center" cx={qx} cy={qy} r={2} />
  </g>;
};
