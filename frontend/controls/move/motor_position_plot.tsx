import React from "react";
import { Xyz, LocationName, Dictionary, McuParams, McuParamName } from "farmbot";
import moment from "moment";
import { fullLocationData, trim } from "../../util";
import {
  cloneDeep, max, get, isNumber, isEqual, takeRight, ceil, range,
} from "lodash";
import { t } from "../../i18next_wrapper";
import { ValidLocationData } from "../../util/location";
import { BotLocationData } from "../../devices/interfaces";

const HEIGHT = 50;
const HISTORY_LENGTH_SECONDS = 120;
const BORDER_WIDTH = 15;
const BORDERS = BORDER_WIDTH * 2;
const MAX_X = HISTORY_LENGTH_SECONDS;
const DEFAULT_Y_MAX = 100;

const COLOR_LOOKUP: Dictionary<string> = {
  x: "red", y: "green", z: "blue"
};
const LINEWIDTH_LOOKUP: Dictionary<number> = {
  position: 0.5, scaled_encoders: 0.25, load: 0.5,
};

export enum MotorPositionHistory {
  array = "motorPositionHistoryArray",
}

type EveryLocationName = LocationName | "load" | "axis_states";

type Entry = {
  timestamp: number,
  locationData: ValidLocationData,
};

type Paths = Record<EveryLocationName, Record<Xyz, string>>;

const getArray = (): Entry[] =>
  JSON.parse(get(sessionStorage, MotorPositionHistory.array, "[]") as string);

const getReversedArray = (): Entry[] => cloneDeep(getArray()).reverse();

const getLastEntry = (): Entry | undefined => {
  const array = getArray();
  return array[array.length - 1];
};

const findYLimit = (props: PlotContentProps): number => {
  if (props.load) { return 100; }
  const array = getArray();
  const keys = getKeys(props);
  const arrayAbsMax = max(array.map(entry =>
    max(keys.map((key: LocationName) =>
      max(["x", "y", "z"].map((axis: Xyz) =>
        Math.abs(entry.locationData[key][axis] || 0) + 1))))));
  return Math.max(ceil(arrayAbsMax || 0, -2), DEFAULT_Y_MAX);
};

export const updateMotorHistoryArray =
  (rawLocationData: BotLocationData): Entry[] => {
    const locationData = fullLocationData(rawLocationData);
    const update = { timestamp: moment().valueOf(), locationData };
    const arr = getArray();
    const last = getLastEntry();
    if (update && isNumber(update.locationData.position.x) &&
      (!last || !isEqual(last.timestamp, update.timestamp))) {
      arr.push(update);
    }
    const newArray = takeRight(arr, 200)
      .filter(x => {
        const entryAge = (last ? last.timestamp : moment().valueOf()) - x.timestamp;
        return entryAge / 1000 <= HISTORY_LENGTH_SECONDS;
      });
    sessionStorage.setItem(MotorPositionHistory.array, JSON.stringify(newArray));
    return newArray;
  };

const newPaths = (): Paths => ({
  position: { x: "", y: "", z: "" },
  scaled_encoders: { x: "", y: "", z: "" },
  raw_encoders: { x: "", y: "", z: "" },
  load: { x: "", y: "", z: "" },
  axis_states: { x: "", y: "", z: "" },
});

const getValue = (key: EveryLocationName, axis: Xyz, entry: Entry) => {
  const status = entry.locationData[
    "axis_states" as LocationName][axis] as string | undefined;
  const value = entry.locationData[key][axis];
  if (key == "load" && status == "idle") { return 0; }
  return value;
};

const getPaths = (props: PlotContentProps): Paths => {
  const last = getLastEntry();
  const keys = getKeys(props);
  const maxY = findYLimit(props);
  const plotY = calcY(props);
  const paths = newPaths();
  if (last) {
    getReversedArray().map(entry => {
      keys.map((key: EveryLocationName) => {
        ["x", "y", "z"].map((axis: Xyz) => {
          const lastPos = getValue(key, axis, last);
          const pos = getValue(key, axis, entry);
          if (isNumber(lastPos) && isFinite(lastPos)
            && isNumber(maxY) && isNumber(pos)) {
            if (!paths[key][axis].startsWith("M")) {
              const yStart = -lastPos / maxY * HEIGHT / 2;
              paths[key][axis] = `M ${MAX_X},${yStart} `;
            }
            const x = MAX_X - (last.timestamp - entry.timestamp) / 1000;
            const y = plotY(pos);
            paths[key][axis] += `L ${x},${y} `;
          }
        });
      });
    });
  }
  return paths;
};

const TitleLegend = (props: PlotContentProps) => {
  const { load } = props;
  const titleY = load ? -(HEIGHT + BORDER_WIDTH / 2) : -(HEIGHT + BORDER_WIDTH) / 2;
  const legendX = HISTORY_LENGTH_SECONDS / 4;
  return <g id="title_with_legend">
    <text fill={COLOR_LOOKUP.x} fontWeight={"bold"}
      x={legendX - 10} y={titleY}>{"X"}</text>
    <text fill={COLOR_LOOKUP.y} fontWeight={"bold"}
      x={legendX} y={titleY}>{"Y"}</text>
    <text fill={COLOR_LOOKUP.z} fontWeight={"bold"}
      x={legendX + 10} y={titleY}>{"Z"}</text>
    <text fontWeight={"bold"}
      x={HISTORY_LENGTH_SECONDS / 2} y={titleY}>
      {load ? t("Load (%)") : t("Position (mm)")}
    </text>
  </g>;
};

const calcY = (props: PlotContentProps) => (y: number) => {
  const maxY = findYLimit(props);
  const factor = props.load ? 1 : 2;
  return -y / maxY * HEIGHT / factor;
};

const YAxisLabels = (props: PlotContentProps) => {
  const { load } = props;
  const maxY = findYLimit(props);
  const plotY = calcY(props);
  const positions = load
    ? [maxY, maxY / 4, maxY / 2, maxY * 3 / 4, 0]
    : [maxY, maxY / 2, 0, -maxY / 2, -maxY];
  return <g id="y_axis_labels">
    {positions.map(yPosition => {
      const y = plotY(yPosition);
      return <g key={"y_axis_label_" + yPosition}>
        <text x={MAX_X + BORDER_WIDTH / 2} y={y}>
          {yPosition}
        </text>
        <line x1={0} y1={y} x2={MAX_X} y2={y} strokeWidth={0.1} stroke={"grey"} />
        <text x={-BORDER_WIDTH / 2} y={y}>
          {yPosition}
        </text>
      </g>;
    })}
  </g>;
};

const XAxisLabels = (props: PlotContentProps) => {
  const y = props.load ? BORDER_WIDTH / 3 : HEIGHT / 2 + BORDER_WIDTH / 3;
  return <g id="x_axis_labels">
    <text x={HISTORY_LENGTH_SECONDS / 2} y={y + 5}
      fontStyle={"italic"}>
      {t("seconds ago")}
    </text>
    {range(0, HISTORY_LENGTH_SECONDS + 1, 20).map(secondsAgo =>
      <text key={"x_axis_label_" + secondsAgo}
        x={MAX_X - secondsAgo} y={y}>
        {secondsAgo}
      </text>)}
  </g>;
};

const PlotBackground = (props: PlotContentProps) =>
  <g id="plot_background">
    <rect fill="none" x={0} y={props.load ? -HEIGHT : -HEIGHT / 2}
      width={"100%"} height={"100%"} />
    <line x1={0} y1={0} x2={MAX_X} y2={0} strokeWidth={0.25} stroke={"grey"} />
  </g>;

interface PlotContentProps {
  load?: boolean;
  encoders?: boolean;
}

const getKeys = (props: PlotContentProps) => {
  const positionKeys: LocationName[] = props.encoders
    ? ["position", "scaled_encoders"]
    : ["position"];
  const keys: LocationName[] = props.load ? ["load" as LocationName] : positionKeys;
  return keys;
};

export interface MotorPositionPlotProps {
  locationData: ValidLocationData;
  load?: boolean;
  encoders?: boolean;
  firmwareSettings?: McuParams;
}

const PlotLines = (props: MotorPositionPlotProps) => {
  const { load, encoders } = props;
  const keys = getKeys({ load, encoders });
  const paths = getPaths(props);
  const plotY = calcY(props);
  return <g id="plot_lines">
    {keys.map((key: LocationName) =>
      ["x", "y", "z"].map((axis: Xyz) => {
        const color = COLOR_LOOKUP[axis];
        const settingNameLookup: Record<Xyz, McuParamName> = {
          x: "encoder_missed_steps_max_x",
          y: "encoder_missed_steps_max_y",
          z: "encoder_missed_steps_max_z",
        };
        const maxSetting = props.firmwareSettings?.[settingNameLookup[axis]];
        return <g key={key + axis} id={`${axis}-axis`}>
          {load && maxSetting &&
            <line x1={0} y1={plotY(maxSetting)} x2={MAX_X} y2={plotY(maxSetting)}
              strokeDasharray={1} strokeWidth={0.25} stroke={color} />}
          <path fill={"none"}
            stroke={color} strokeWidth={LINEWIDTH_LOOKUP[key]}
            strokeLinecap={"round"} strokeLinejoin={"round"}
            d={paths[key][axis]} />
        </g>;
      }))}
  </g>;
};

export const MotorPositionPlot = (props: MotorPositionPlotProps) => {
  const svgYMin = props.load ? -HEIGHT : -HEIGHT / 2;
  const yMin = svgYMin - BORDER_WIDTH;
  const height = props.load ? HEIGHT + BORDERS : HEIGHT + BORDERS;
  const { load, encoders } = props;
  const plotContentProps = { load, encoders };
  return <svg
    className="motor-position-plot-border"
    viewBox={trim(`${-BORDER_WIDTH} ${yMin}
      ${HISTORY_LENGTH_SECONDS + BORDERS} ${height}`)}>
    <TitleLegend {...plotContentProps} />
    <YAxisLabels {...plotContentProps} />
    <XAxisLabels {...plotContentProps} />
    <svg
      className="motor-position-plot"
      width={HISTORY_LENGTH_SECONDS}
      height={HEIGHT}
      x={0}
      y={svgYMin}
      viewBox={`0 ${svgYMin} ${HISTORY_LENGTH_SECONDS} ${HEIGHT}`}>
      <PlotBackground {...plotContentProps} />
      <PlotLines {...props} />
    </svg>
  </svg>;
};
