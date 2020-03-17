import * as React from "react";
import { Xyz, LocationName, Dictionary } from "farmbot";
import moment from "moment";
import { BotLocationData, BotPosition } from "../../devices/interfaces";
import { trim } from "../../util";
import {
  cloneDeep, max, get, isNumber, isEqual, takeRight, ceil, range,
} from "lodash";
import { t } from "../../i18next_wrapper";

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
  position: 0.5, scaled_encoders: 0.25
};

export enum MotorPositionHistory {
  array = "motorPositionHistoryArray",
}

type Entry = {
  timestamp: number,
  locationData: Record<LocationName, BotPosition>
};

type Paths = Record<LocationName, Record<Xyz, string>>;

const getArray = (): Entry[] =>
  JSON.parse(get(sessionStorage, MotorPositionHistory.array, "[]"));

const getReversedArray = (): Entry[] => cloneDeep(getArray()).reverse();

const getLastEntry = (): Entry | undefined => {
  const array = getArray();
  return array[array.length - 1];
};

const findYLimit = (): number => {
  const array = getArray();
  const arrayAbsMax = max(array.map(entry =>
    max(["position", "scaled_encoders"].map((key: LocationName) =>
      max(["x", "y", "z"].map((axis: Xyz) =>
        Math.abs(entry.locationData[key][axis] || 0) + 1))))));
  return Math.max(ceil(arrayAbsMax || 0, -2), DEFAULT_Y_MAX);
};

const updateArray = (update: Entry): Entry[] => {
  const arr = getArray();
  const last = getLastEntry();
  if (update && isNumber(update.locationData.position.x) &&
    (!last || !isEqual(last.timestamp, update.timestamp))) {
    arr.push(update);
  }
  const newArray = takeRight(arr, 100)
    .filter(x => {
      const entryAge = (last ? last.timestamp : moment().unix()) - x.timestamp;
      return entryAge <= HISTORY_LENGTH_SECONDS;
    });
  sessionStorage.setItem(MotorPositionHistory.array, JSON.stringify(newArray));
  return newArray;
};

const newPaths = (): Paths => ({
  position: { x: "", y: "", z: "" },
  scaled_encoders: { x: "", y: "", z: "" },
  raw_encoders: { x: "", y: "", z: "" }
});

const getPaths = (): Paths => {
  const last = getLastEntry();
  const maxY = findYLimit();
  const paths = newPaths();
  if (last) {
    getReversedArray().map(entry => {
      ["position", "scaled_encoders"].map((key: LocationName) => {
        ["x", "y", "z"].map((axis: Xyz) => {
          const lastPos = last.locationData[key][axis];
          const pos = entry.locationData[key][axis];
          if (isNumber(lastPos) && isFinite(lastPos)
            && isNumber(maxY) && isNumber(pos)) {
            if (!paths[key][axis].startsWith("M")) {
              const yStart = -lastPos / maxY * HEIGHT / 2;
              paths[key][axis] = `M ${MAX_X},${yStart} `;
            }
            const x = MAX_X - (last.timestamp - entry.timestamp);
            const y = -pos / maxY * HEIGHT / 2;
            paths[key][axis] += `L ${x},${y} `;
          }
        });
      });
    });
  }
  return paths;
};

const TitleLegend = () => {
  const titleY = -(HEIGHT + BORDER_WIDTH) / 2;
  const legendX = HISTORY_LENGTH_SECONDS / 4;
  return <g id="title_with_legend">
    <text fill={COLOR_LOOKUP.x} fontWeight={"bold"}
      x={legendX - 10} y={titleY}>{"X"}</text>
    <text fill={COLOR_LOOKUP.y} fontWeight={"bold"}
      x={legendX} y={titleY}>{"Y"}</text>
    <text fill={COLOR_LOOKUP.z} fontWeight={"bold"}
      x={legendX + 10} y={titleY}>{"Z"}</text>
    <text fontWeight={"bold"}
      x={HISTORY_LENGTH_SECONDS / 2} y={titleY}>{t("Position (mm)")}</text>
  </g>;
};

const YAxisLabels = () => {
  const maxY = findYLimit();
  return <g id="y_axis_labels">
    {[maxY, maxY / 2, 0, -maxY / 2, -maxY].map(yPosition =>
      <g key={"y_axis_label_" + yPosition}>
        <text x={MAX_X + BORDER_WIDTH / 2} y={-yPosition / maxY * HEIGHT / 2}>
          {yPosition}
        </text>
        <text x={-BORDER_WIDTH / 2} y={-yPosition / maxY * HEIGHT / 2}>
          {yPosition}
        </text>
      </g>)}
  </g>;
};

const XAxisLabels = () =>
  <g id="x_axis_labels">
    <text x={HISTORY_LENGTH_SECONDS / 2} y={HEIGHT / 2 + BORDER_WIDTH / 1.25}
      fontStyle={"italic"}>
      {t("seconds ago")}
    </text>
    {range(0, HISTORY_LENGTH_SECONDS + 1, 20).map(secondsAgo =>
      <text key={"x_axis_label_" + secondsAgo}
        x={MAX_X - secondsAgo} y={HEIGHT / 2 + BORDER_WIDTH / 3}>
        {secondsAgo}
      </text>)}
  </g>;

const PlotBackground = () =>
  <g id="plot_background">
    <rect fill="white" x={0} y={-HEIGHT / 2} width={"100%"} height={"100%"} />
    <line x1={0} y1={0} x2={MAX_X} y2={0} strokeWidth={0.25} stroke={"grey"} />
  </g>;

const PlotLines = ({ locationData }: { locationData: BotLocationData }) => {
  updateArray({ timestamp: moment().unix(), locationData });
  const paths = getPaths();
  return <g id="plot_lines">
    {["position", "scaled_encoders"].map((key: LocationName) =>
      ["x", "y", "z"].map((axis: Xyz) =>
        <path key={key + axis} fill={"none"}
          stroke={COLOR_LOOKUP[axis]} strokeWidth={LINEWIDTH_LOOKUP[key]}
          strokeLinecap={"round"} strokeLinejoin={"round"}
          d={paths[key][axis]} />))}
  </g>;
};

export const MotorPositionPlot = (props: { locationData: BotLocationData }) => {
  return <svg
    className="motor-position-plot-border"
    style={{ marginTop: "2rem", maxHeight: "250px" }}
    width="100%"
    height="100%"
    viewBox={trim(`${-BORDER_WIDTH} ${-HEIGHT / 2 - BORDER_WIDTH}
      ${HISTORY_LENGTH_SECONDS + BORDERS} ${HEIGHT + BORDERS}`)}>
    <TitleLegend />
    <YAxisLabels />
    <XAxisLabels />
    <svg
      className="motor-position-plot"
      width={HISTORY_LENGTH_SECONDS}
      height={HEIGHT}
      x={0}
      y={-HEIGHT / 2}
      viewBox={`0 ${-HEIGHT / 2} ${HISTORY_LENGTH_SECONDS} ${HEIGHT}`}>
      <PlotBackground />
      <PlotLines locationData={props.locationData} />
    </svg>
  </svg>;
};
