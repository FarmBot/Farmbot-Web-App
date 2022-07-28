import React from "react";
import { trim } from "../../util";
import { Telemetry } from "farmbot/dist/resources/api_resources";
import { TaggedTelemetry } from "farmbot";
import { isNumber, last, max, range, sortBy } from "lodash";
import { t } from "../../i18next_wrapper";
import { COLORS, OnMetricHover } from "./fbos_metric_history_table";

const HEIGHT = 100;
const HISTORY_LENGTH_HOUR_TENTHS = 24 * 10;
const BORDER_WIDTH = 15;
const BORDERS = BORDER_WIDTH * 2;
const MAX_X = HISTORY_LENGTH_HOUR_TENTHS;
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
  seconds: number | undefined,
  lastEntry: TaggedTelemetry | undefined,
) => {
  const lastAt = lastEntry?.body.created_at;
  const thisAt = seconds;
  const withinBounds = lastAt && thisAt
    && (lastAt - thisAt) < (HISTORY_LENGTH_HOUR_TENTHS / 10 * 3600);
  return withinBounds ? lastAt - thisAt : undefined;
};
const plotXHours = (hours: number) => MAX_X - (hours * 10);
const plotXSeconds = (seconds: number) => plotXHours(seconds / 3600);

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
    const x = plotXSeconds(d[0]);
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
    <text x={MAX_X / 2} y={MAX_Y}
      fontStyle={"italic"}>
      {t("hours prior to most recent record")}
    </text>
    {range(0, HISTORY_LENGTH_HOUR_TENTHS / 10 + 1, 2).map(hoursAgo =>
      <text key={"x_axis_label_" + hoursAgo}
        x={plotXHours(hoursAgo)} y={MAX_Y - BORDER_WIDTH / 2}>
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
        strokeWidth={props.hoveredMetric == metricName ? 2.5 : 1.5}
        strokeLinecap={"round"} strokeLinejoin={"round"}
        d={getPath(props.telemetry, metricName)} />)}
  </g>;
};

interface VersionChangeLinesProps {
  telemetry: TaggedTelemetry[];
}

const VersionChangeLines = (props: VersionChangeLinesProps) => {
  const changes: [number, string, string][] = [];
  const mostRecent = last(sortBy(props.telemetry, "body.created_at"));
  props.telemetry.map((d, i) => {
    if (i == 0) { return; }
    const previousVersion = props.telemetry[i - 1].body.fbos_version;
    if (d.body.fbos_version && previousVersion &&
      d.body.fbos_version != previousVersion) {
      const x = clipX(d.body.created_at, mostRecent);
      isNumber(x) && changes.push([x, previousVersion, d.body.fbos_version]);
    }
  });
  return <g id="version-change-lines">
    {changes.map(c =>
      <g id={"" + c[0]}>
        <line y1={0} y2={MAX_Y}
          x1={plotXSeconds(c[0])}
          x2={plotXSeconds(c[0])}
          stroke={"gray"} strokeWidth={1} strokeDasharray={2} />
        <text x={plotXSeconds(c[0]) - 3} y={5} color={"gray"}
          textAnchor={"end"} style={{ textAnchor: "end" }}>v{c[1]}</text>
        <text x={plotXSeconds(c[0]) + 3} y={5} color={"gray"}
          textAnchor={"start"} style={{ textAnchor: "start" }}>v{c[2]}</text>
      </g>)}
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
    width={"100%"}
    height={"100%"}
    viewBox={trim(`${-BORDER_WIDTH} ${-BORDER_WIDTH - 5}
      ${MAX_X + BORDERS} ${MAX_Y + BORDERS}`)}>
    <YAxisLabels />
    <XAxisLabels />
    <svg
      className={"fbos-metric-history-plot"}
      width={MAX_X}
      height={MAX_Y}
      x={0}
      y={-BORDER_WIDTH}
      viewBox={`0 ${0} ${MAX_X} ${MAX_Y}`}>
      <PlotBackground />
      <PlotLines telemetry={props.telemetry}
        hoveredMetric={props.hoveredMetric}
        onHover={props.onHover} />
      <VersionChangeLines telemetry={props.telemetry} />
      {hoveredSeconds &&
        <line y1={0} y2={MAX_Y}
          x1={plotXSeconds(hoveredSeconds)}
          x2={plotXSeconds(hoveredSeconds)}
          stroke={"black"} strokeWidth={0.5} />}
    </svg>
  </svg>;
};
