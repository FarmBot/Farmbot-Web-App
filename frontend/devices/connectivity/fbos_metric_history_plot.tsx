import React from "react";
import { trim } from "../../util";
import { Telemetry } from "farmbot/dist/resources/api_resources";
import { TaggedTelemetry } from "farmbot";
import { last, max, range, sortBy } from "lodash";
import { t } from "../../i18next_wrapper";

const HEIGHT = 100;
const HISTORY_LENGTH_HOURS = 30 * 10;
const BORDER_WIDTH = 15;
const BORDERS = BORDER_WIDTH * 2;
const MAX_X = HISTORY_LENGTH_HOURS;
const MAX_Y = 100;

const METRIC_NAMES: (keyof Telemetry)[] = [
  "cpu_usage",
  "disk_usage",
  "memory_usage",
  "soc_temp",
  "uptime",
  "wifi_level_percent",
];

const COLORS: Record<keyof Telemetry, string> = {
  id: "red",
  created_at: "red",
  updated_at: "red",
  target: "red",
  soc_temp: "red",
  throttled: "blue",
  wifi_level_percent: "orange",
  uptime: "green",
  memory_usage: "purple",
  disk_usage: "gray",
  cpu_usage: "yellow",
  fbos_version: "red",
  firmware_hardware: "red",
};

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
    const lastAt = mostRecent.body.created_at as unknown as number;
    const thisAt = entry.body.created_at as unknown as number;
    if (lastAt && thisAt
      && (lastAt - thisAt) < (HISTORY_LENGTH_HOURS / 10 * 3600)) {
      const x = lastAt - thisAt;
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
  const yMax = max(ys) || 1;
  let path = "";
  data.map(d => {
    const x = MAX_X - (d[0] / 3600 * 10);
    const raw_y = d[1];
    const y = MAX_Y - (raw_y / yMax) * MAX_Y;
    if (!path.startsWith("M")) {
      path = `M ${x},${y} `;
    } else {
      path += `L ${x},${y} `;
    }
  });
  return path;
};

const YAxisLabels = () => {
  const maxY = 100;
  return <g id="y_axis_labels">
    {[0, maxY].map(yPosition =>
      <g key={"y_axis_label_" + yPosition}>
        <text x={MAX_X + BORDER_WIDTH / 2} y={maxY - yPosition - BORDER_WIDTH}>
          {yPosition}
        </text>
        <text x={-BORDER_WIDTH / 2} y={maxY - yPosition - BORDER_WIDTH}>
          {yPosition}
        </text>
      </g>)}
  </g>;
};

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

const PlotLines = ({ telemetry }: { telemetry: TaggedTelemetry[] }) => {
  return <g id="plot_lines">
    {METRIC_NAMES.map((metricName: keyof Telemetry) =>
      <path key={metricName} fill={"none"}
        stroke={COLORS[metricName]} strokeWidth={2}
        strokeLinecap={"round"} strokeLinejoin={"round"}
        d={getPath(telemetry, metricName)} />)}
  </g>;
};

export interface FbosMetricHistoryPlotProps {
  telemetry: TaggedTelemetry[];
}

export const FbosMetricHistoryPlot = (props: FbosMetricHistoryPlotProps) => {
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
      <PlotLines telemetry={props.telemetry} />
    </svg>
  </svg>;
};
