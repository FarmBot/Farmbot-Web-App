import React from "react";
import { trim } from "../../util";
import { Telemetry } from "farmbot/dist/resources/api_resources";
import { TaggedTelemetry } from "farmbot";
import { flatten, isNumber, last, max, range, sortBy } from "lodash";
import { t } from "../../i18next_wrapper";
import { COLORS, OnMetricHover } from "./fbos_metric_history_table";

const HEIGHT = 100;
const HISTORY_LENGTH_HOUR_TENTHS = 24 * 10;
const BORDER_WIDTH = 15;
const BORDERS = BORDER_WIDTH * 2;
const MAX_X = HISTORY_LENGTH_HOUR_TENTHS;
const MAX_Y = HEIGHT;
const MAX_GAP_SECONDS = 15 * 60;
const TOP_EXTRA_HEIGHT = 7;

/** Names of metrics in plot. */
const METRIC_NAMES: (keyof Telemetry)[] = [
  "cpu_usage",
  "disk_usage",
  "memory_usage",
  "soc_temp",
  "uptime",
  "wifi_level_percent",
];

/** Maximum plot range if not 100. */
const MAXIMUMS: Partial<Record<keyof Telemetry, number>> = {
  memory_usage: 512,
};

/** Returns seconds ago if within plot bounds. */
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
/** Convert hours to plot x-axis values. */
const plotXHours = (hours: number) => MAX_X - (hours * 10);
/** Convert seconds to plot x-axis values. */
const plotXSeconds = (seconds: number) => plotXHours(seconds / 3600);

type DataSegment = Record<"x" | "y", number>[];

/** Process data: clip to plot bounds and split into continuous runs. */
const getData = (
  all: TaggedTelemetry[],
  metricName: keyof Telemetry,
): DataSegment[] => {
  const data: Record<"x" | "y", number>[] = [];
  const mostRecent = last(sortBy(all, "body.created_at"));
  if (!mostRecent) {
    return [data];
  }
  sortBy(all, "body.created_at").map(entry => {
    const x = clipX(entry.body.created_at, mostRecent);
    if (isNumber(x)) {
      const y = parseInt("" + entry.body[metricName]);
      if (isFinite(y)) {
        data.push({ x, y });
      }
    }
  });
  const splitData: DataSegment[] = [];
  let continuousData: DataSegment = [];
  data.map((d, i) => {
    if (i == 0) {
      continuousData.push(d);
      return;
    }
    if ((data[i - 1].x - d.x) > MAX_GAP_SECONDS) {
      splitData.push(continuousData);
      continuousData = [];
    }
    continuousData.push(d);
  });
  splitData.push(continuousData);
  return splitData;
};

/** Returns SVG path string. */
const getPath = (
  data: DataSegment,
  metricName: keyof Telemetry,
  allSegments: DataSegment[],
): string => {
  const allYs = flatten(allSegments.map(ds => ds.map(d => d.y)));
  const yMax = Math.max(MAXIMUMS[metricName] || 100, max(allYs) || 1);
  let path = "";
  data.map(d => {
    const x = plotXSeconds(d.x);
    const raw_y = d.y;
    const y = MAX_Y - (raw_y / yMax) * MAX_Y;
    if (!path.startsWith("M")) {
      path = `M ${x},${y} `;
    } else {
      path += `L ${x},${y} `;
    }
  });
  return path;
};

/** y-axis labels SVG */
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

/** x-axis labels SVG */
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

/** plot background color and top and bottom lines */
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

/** Metric data lines SVG */
const PlotLines = (props: PlotLinesProps) => {
  return <g id="plot_lines">
    {METRIC_NAMES.map((metricName: keyof Telemetry) => {
      const allSegments = getData(props.telemetry, metricName);
      return allSegments.map((data, index) =>
        <path key={metricName + index}
          onMouseEnter={props.onHover(metricName)}
          onMouseLeave={props.onHover(undefined)}
          fill={"none"}
          stroke={COLORS[metricName]}
          strokeWidth={props.hoveredMetric == metricName ? 2.5 : 1.5}
          strokeLinecap={"round"} strokeLinejoin={"round"}
          d={getPath(data, metricName, allSegments)} />);
    })}
  </g>;
};

interface VersionChangeLinesProps {
  telemetry: TaggedTelemetry[];
}

interface VersionChangeRecord {
  changedAt: number;
  previousVersion: string;
  nextVersion: string;
}

/** SVG lines for FBOS version changes */
const VersionChangeLines = (props: VersionChangeLinesProps) => {
  const changes: VersionChangeRecord[] = [];
  const mostRecent = last(sortBy(props.telemetry, "body.created_at"));
  props.telemetry.map((d, i) => {
    if (i == 0) { return; }
    const previousVersion = props.telemetry[i - 1].body.fbos_version;
    const nextVersion = d.body.fbos_version;
    if (nextVersion && previousVersion &&
      nextVersion != previousVersion) {
      const changedAt = clipX(d.body.created_at, mostRecent);
      isNumber(changedAt) &&
        changes.push({ changedAt, previousVersion, nextVersion });
    }
  });
  return <g id="version-change-lines">
    {changes.map(change =>
      <g key={"" + change.changedAt}>
        <line y1={0} y2={MAX_Y}
          x1={plotXSeconds(change.changedAt)}
          x2={plotXSeconds(change.changedAt)}
          stroke={"gray"} strokeWidth={1} strokeDasharray={2} />
        <text x={plotXSeconds(change.changedAt) - 3} y={-4} fill={"gray"}
          textAnchor={"end"} style={{ textAnchor: "end" }}>
          v{change.previousVersion}
        </text>
        <text x={plotXSeconds(change.changedAt) + 3} y={-4} fill={"gray"}
          textAnchor={"start"} style={{ textAnchor: "start" }}>
          v{change.nextVersion}
        </text>
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
    viewBox={trim(`${-BORDER_WIDTH} ${-BORDER_WIDTH - 5 - TOP_EXTRA_HEIGHT}
      ${MAX_X + BORDERS} ${MAX_Y + BORDERS + TOP_EXTRA_HEIGHT}`)}>
    <YAxisLabels />
    <XAxisLabels />
    <svg
      className={"fbos-metric-history-plot"}
      width={MAX_X}
      height={MAX_Y + TOP_EXTRA_HEIGHT}
      x={0}
      y={-BORDER_WIDTH - TOP_EXTRA_HEIGHT}
      viewBox={`0 ${-TOP_EXTRA_HEIGHT} ${MAX_X} ${MAX_Y + TOP_EXTRA_HEIGHT}`}>
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
