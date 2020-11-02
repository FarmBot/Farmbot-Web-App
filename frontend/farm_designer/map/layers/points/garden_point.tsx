import * as React from "react";
import { GardenPointProps } from "../../interfaces";
import { transformXY } from "../../util";
import { Actions } from "../../../../constants";
import { mapPointClickAction } from "../../actions";
import { CameraViewArea } from "../farmbot/bot_figure";
import { round } from "lodash";

export const GardenPoint = (props: GardenPointProps) => {

  const iconHover = (action: "start" | "end") => () => {
    const hover = action === "start";
    props.dispatch({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: hover ? props.point.uuid : undefined
    });
  };

  const { point, mapTransformProps, hovered } = props;
  const { id, x, y, z, meta } = point.body;
  const { min, max } = props.soilHeightRange;
  const normalizedZ = round(255 * (max > min ? (z - min) / (max - min) : 1));
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
    {props.soilHeightLabels && meta.created_by == "measure-soil-height" &&
      <text x={qx} y={qy}
        fontSize={40} fontWeight={"bold"}
        fill={hovered
          ? "black"
          : `rgb(${normalizedZ}, ${normalizedZ}, ${normalizedZ})`}
        fillOpacity={1}
        textAnchor={"middle"} alignmentBaseline={"middle"}>
        {z}
      </text>}
    {meta.gridId && meta.gridId == props.cameraViewGridId &&
      <CameraViewArea
        position={{ x, y, z: 0 }}
        cropPhotos={props.cropPhotos}
        cameraCalibrationData={props.cameraCalibrationData}
        mapTransformProps={mapTransformProps} />}
  </g>;
};
