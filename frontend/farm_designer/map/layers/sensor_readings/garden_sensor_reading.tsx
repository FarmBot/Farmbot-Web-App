import * as React from "react";
import * as moment from "moment";
import { transformXY } from "../../util";
import { TaggedSensorReading } from "farmbot";
import { MapTransformProps } from "../../interfaces";
import { isNumber } from "lodash";
import { formatLogTime } from "../../../../logs";
import { t } from "i18next";
import { Color } from "../../../../ui";

const VISIBLE_PERIOD_SECONDS = 24 * 60 * 60.;

export interface GardenSensorReadingProps {
  sensorReading: TaggedSensorReading;
  mapTransformProps: MapTransformProps;
  endTime: string | undefined;
  timeOffset: number;
  sensorLookup: Record<string, string>;
}

interface GardenSensorReadingState {
  hovered: boolean;
}

export class GardenSensorReading
  extends React.Component<GardenSensorReadingProps, GardenSensorReadingState> {
  state: GardenSensorReadingState = { hovered: false };

  hover = () => this.setState({ hovered: true });
  unhover = () => this.setState({ hovered: false });

  render() {
    const {
      sensorReading, mapTransformProps, endTime, timeOffset, sensorLookup
    } = this.props;
    const { id, x, y, value, mode, created_at, pin } = sensorReading.body;
    if (isNumber(x) && isNumber(y)) {
      const { qx, qy } = transformXY(x, y, mapTransformProps);
      const val = 255 - value / (mode === 1 ? 1024. : 1) * 255;
      const age = moment(endTime).unix() - moment(created_at).unix();
      const opacity = Math.max(0, 1 - age / VISIBLE_PERIOD_SECONDS);
      const sensorName = sensorLookup[pin]
        ? `${sensorLookup[pin]} (${t("pin")} ${pin})`
        : `${t("pin")} ${pin}`;
      const modeText = mode === 0 ? t("digital") : t("analog");
      const hovered = this.state.hovered ? "visible" : "hidden";
      const textX = qx + 13;
      return <g id={"sensor-reading-" + id}>
        <circle
          fill={`rgb(${val}, ${val}, ${val})`}
          cx={qx} cy={qy} r={10} opacity={opacity}
          onMouseEnter={this.hover}
          onMouseLeave={this.unhover} />
        <circle
          visibility={hovered}
          fill={"none"} stroke={Color.darkGray} strokeWidth={2}
          cx={qx} cy={qy} r={10} />
        <text
          x={textX} y={qy}
          visibility={hovered}>
          <tspan x={textX} dy={"0.6em"}>{sensorName}</tspan>
          <tspan x={textX} dy={"1.2em"}>
            {`${t("value")} ${value} (${modeText})`}
          </tspan>
          <tspan x={textX} dy={"1.2em"}>
            {formatLogTime(moment(created_at).unix(), timeOffset)}
          </tspan>
        </text>
      </g>;
    }
    return <g id={"sensor-reading-" + id} />;
  }
}
