import React from "react";
import { trim } from "../../util";
import { Telemetry } from "farmbot/dist/resources/api_resources";
import { TaggedTelemetry } from "farmbot";
import { isNumber, last, max, range, sortBy } from "lodash";
import { t } from "../../i18next_wrapper";
import { COLORS, OnMetricHover } from "./fbos_metric_history_table";

const HEIGHT = 100;
const HISTORY_LENGTH_HOURS = 30 * 10;
const BORDER_WIDTH = 15;
const BORDERS = BORDER_WIDTH * 2;
const MAX_X = HISTORY_LENGTH_HOURS;
const MAX_Y = HEIGHT;

const METRIC_NAMES: (keyof Telemetry)[] = [
  "cpu_usage",
  "disk_usage",
  "memory_usage",
  "soc_temp",
  "uptime",
  "wifi_level_percent",
];

const MAXIMUMS: Partial<Record<keyof Telemetry, number>> = {
  memory_usage: 512,
};

const clipX = (
  seconds: string | number | undefined,
  lastEntry: TaggedTelemetry | undefined,
) => {
  const lastAt = lastEntry?.body.created_at as unknown as number | undefined;
  const thisAt = seconds as unknown as number | undefined;
  const withinBounds = lastAt && thisAt
    && (lastAt - thisAt) < (HISTORY_LENGTH_HOURS / 10 * 3600);
  return withinBounds ? lastAt - thisAt : undefined;
};
const plotX = (seconds: number) => MAX_X - (seconds / 3600 * 10);

const getData = (
  all: TaggedTelemetry[],
  metricName: keyof Telemetry,
): [number, number][] => {
  const data: [number, number][] = [];
  const mostRecent = last(sortBy(all, "body.created_at"));
  if (!mostRecent) {
    return data;
  }
  sortBy(all, "body.created_at").map(entry => {
    const x = clipX(entry.body.created_at, mostRecent);
    if (isNumber(x)) {
      const y = parseInt("" + entry.body[metricName]);
      data.push([x, y]);
    }
  });
  return data;
};

const getPath = (
  all: TaggedTelemetry[],
  metricName: keyof Telemetry,
): string => {
  const data = getData(all, metricName);
  const ys = data.map(d => d[1]);
  const yMax = Math.max(MAXIMUMS[metricName] || 100, max(ys) || 1);
  let path = "";
  data.map(d => {
    const x = plotX(d[0]);
    const raw_y = d[1];
    if (isNaN(raw_y)) { return; }
    const y = MAX_Y - (raw_y / yMax) * MAX_Y;
    if (!path.startsWith("M")) {
      path = `M ${x},${y} `;
    } else {
      path += `L ${x},${y} `;
    }
  });
  return path;
};

const YAxisLabels = () =>
  <g id="y_axis_labels" visibility={"hidden"}>
    {[0, MAX_Y].map(yPosition =>
      <g key={"y_axis_label_" + yPosition}>
        <text x={MAX_X + BORDER_WIDTH / 2} y={MAX_Y - yPosition - BORDER_WIDTH}>
          {yPosition}
        </text>
        <text x={-BORDER_WIDTH / 2} y={MAX_Y - yPosition - BORDER_WIDTH}>
          {yPosition}
        </text>
      </g>)}
  </g>;

const XAxisLabels = () =>
  <g id="x_axis_labels">
    <text x={HISTORY_LENGTH_HOURS / 2} y={HEIGHT - BORDER_WIDTH / 1.25}
      fontStyle={"italic"}>
      {t("hours prior to most recent record")}
    </text>
    {range(0, HISTORY_LENGTH_HOURS / 10 + 1, 2).map(hoursAgo =>
      <text key={"x_axis_label_" + hoursAgo}
        x={MAX_X - hoursAgo * 10} y={HEIGHT - BORDER_WIDTH / 3}>
        {hoursAgo}
      </text>)}
  </g>;

const PlotBackground = () =>
  <g id="plot_background">
    <rect fill="white" x={0} y={0} width={"100%"} height={"100%"} />
    <line x1={0} y1={0} x2={MAX_X} y2={0} strokeWidth={0.25} stroke={"grey"} />
    <line x1={0} y1={MAX_Y} x2={MAX_X} y2={MAX_Y}
      strokeWidth={0.25} stroke={"grey"} />
  </g>;

export interface PlotLinesProps {
  telemetry: TaggedTelemetry[];
  hoveredMetric: keyof Telemetry | undefined;
  onHover: OnMetricHover;
}

const PlotLines = (props: PlotLinesProps) => {
  return <g id="plot_lines">
    {METRIC_NAMES.map((metricName: keyof Telemetry) =>
      <path key={metricName}
        onMouseEnter={props.onHover(metricName)}
        onMouseLeave={props.onHover(undefined)}
        fill={"none"}
        stroke={COLORS[metricName]}
        strokeWidth={props.hoveredMetric == metricName ? 4 : 2}
        strokeLinecap={"round"} strokeLinejoin={"round"}
        d={getPath(props.telemetry, metricName)} />)}
  </g>;
};

export interface FbosMetricHistoryPlotProps {
  telemetry: TaggedTelemetry[];
  hoveredMetric: keyof Telemetry | undefined;
  hoveredTime: number | undefined;
  onHover: OnMetricHover;
}

export const FbosMetricHistoryPlot = (props: FbosMetricHistoryPlotProps) => {
  const mostRecent = last(sortBy(props.telemetry, "body.created_at"));
  const hoveredSeconds = clipX(props.hoveredTime, mostRecent);
  return <svg
    className={"fbos-metric-history-plot-border"}
    style={{ marginTop: "2rem", maxHeight: "250px" }}
    width={"100%"}
    height={"100%"}
    viewBox={trim(`${-BORDER_WIDTH} ${-BORDER_WIDTH - 5}
      ${HISTORY_LENGTH_HOURS + BORDERS} ${HEIGHT + BORDERS}`)}>
    <YAxisLabels />
    <XAxisLabels />
    <svg
      className={"fbos-metric-history-plot"}
      width={HISTORY_LENGTH_HOURS}
      height={HEIGHT}
      x={0}
      y={-BORDER_WIDTH}
      viewBox={`0 ${0} ${HISTORY_LENGTH_HOURS} ${HEIGHT}`}>
      <PlotBackground />
      <PlotLines telemetry={props.telemetry}
        hoveredMetric={props.hoveredMetric}
        onHover={props.onHover} />
      {hoveredSeconds &&
        <line y1={0} y2={MAX_Y}
          x1={plotX(hoveredSeconds)}
          x2={plotX(hoveredSeconds)}
          stroke={"black"} strokeWidth={0.5} />}
    </svg>
  </svg>;
};
