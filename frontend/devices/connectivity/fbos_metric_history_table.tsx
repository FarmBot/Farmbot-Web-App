import React from "react";
import {
  ThrottleType,
  convertUptime,
  ThrottleIndicator,
} from "../../settings/fbos_settings/fbos_details";
import { t } from "../../i18next_wrapper";
import { TaggedTelemetry } from "farmbot";
import { TimeSettings } from "../../interfaces";
import { FbosMetricHistoryPlot } from "./fbos_metric_history_plot";
import { formatTime } from "../../util";
import moment from "moment";
import { Telemetry } from "farmbot/dist/resources/api_resources";
import { cloneDeep, sortBy } from "lodash";
import { forceOnline } from "../must_be_online";
import { generateDemoTelemetry } from "./fbos_metric_demo_data";

const METRIC_TITLES = (): Partial<Record<keyof Telemetry, string>> => ({
  soc_temp: t("Temp"),
  wifi_level_percent: t("WiFi"),
  uptime: t("Uptime"),
  memory_usage: t("Memory"),
  disk_usage: t("Disk"),
  cpu_usage: t("CPU"),
  throttled: t("Voltage"),
});

export const COLORS: Partial<Record<keyof Telemetry, string>> = {
  soc_temp: "red",
  wifi_level_percent: "blue",
  uptime: "green",
  memory_usage: "purple",
  disk_usage: "gray",
  cpu_usage: "orange",
};

export type OnMetricHover =
  (metricName: keyof Telemetry | undefined) => () => void;

interface TableHeaderCellProps {
  metricName: keyof Telemetry;
  hoveredMetric: keyof Telemetry | undefined;
  onHover: OnMetricHover;
  rightAlign?: boolean;
  style?: React.CSSProperties;
}

const TableHeaderCell = (props: TableHeaderCellProps) =>
  <th
    style={{
      color: COLORS[props.metricName],
      background: props.hoveredMetric == props.metricName ? "rgba(255,255,255,0.2)" : undefined,
      textAlign: props.rightAlign ? "right" : undefined,
      ...props.style,
    }}
    onMouseEnter={props.onHover(props.metricName)}
    onMouseLeave={props.onHover(undefined)}>
    {METRIC_TITLES()[props.metricName]}
  </th>;

interface TableBodyCellProps {
  metricName: keyof Telemetry;
  hoveredMetric: keyof Telemetry | undefined;
  onHover: OnMetricHover;
  recordSelected: boolean;
  rightAlign?: boolean;
  children: React.ReactNode;
}

const TableBodyCell = (props: TableBodyCellProps) => {
  const selected = props.recordSelected || props.hoveredMetric == props.metricName;
  return <td
    style={{
      background: selected ? "rgba(255,255,255,0.2)" : undefined,
      textAlign: props.rightAlign ? "right" : undefined,
    }}
    onMouseEnter={props.onHover(props.metricName)}
    onMouseLeave={props.onHover(undefined)}>
    {props.children}
  </td>;
};

export interface FbosMetricHistoryTableProps {
  telemetry: TaggedTelemetry[];
  timeSettings: TimeSettings;
}

interface FbosMetricHistoryState {
  hoveredMetric: keyof Telemetry | undefined;
  hoveredTime: number | undefined;
  demoData: TaggedTelemetry[],
}

export class FbosMetricHistoryTable
  extends React.Component<FbosMetricHistoryTableProps, FbosMetricHistoryState> {
  state: FbosMetricHistoryState = {
    hoveredMetric: undefined,
    hoveredTime: undefined,
    demoData: generateDemoTelemetry(),
  };

  hoverMetric: OnMetricHover = metricName => () =>
    this.setState({ hoveredMetric: metricName });

  hoverTime = (time: number | undefined) => () =>
    this.setState({ hoveredTime: time });

  get telemetry() {
    return forceOnline() ? this.state.demoData : this.props.telemetry;
  }

  render() {
    const commonProps = {
      hoveredMetric: this.state.hoveredMetric,
      hoveredTime: this.state.hoveredTime,
      onHover: this.hoverMetric,
    };
    const rightAlignProps = { ...commonProps, rightAlign: true };
    const sortedTelemetry = sortBy(cloneDeep(this.telemetry), "body.created_at")
      .reverse();
    return <div className={"fbos-metric-history grid"}>
      <FbosMetricHistoryPlot {...commonProps} telemetry={this.telemetry} />
      <div className={"fbos-metric-history-table-wrapper"}>
        <table>
          <thead>
            <tr>
              <th>{t("Time")}</th>
              <th>{t("Version")}</th>
              <TableHeaderCell {...commonProps} metricName={"uptime"} />
              <TableHeaderCell {...rightAlignProps} metricName={"cpu_usage"} />
              <TableHeaderCell {...rightAlignProps} metricName={"disk_usage"} />
              <TableHeaderCell {...rightAlignProps} metricName={"memory_usage"} />
              <TableHeaderCell {...rightAlignProps} metricName={"soc_temp"} />
              <TableHeaderCell {...rightAlignProps} style={{ textAlign: "center" }}
                metricName={"throttled"} />
              <TableHeaderCell {...rightAlignProps}
                metricName={"wifi_level_percent"} />
            </tr>
          </thead>
          <tbody>
            {sortedTelemetry
              .map(m => {
                const recordSelected = this.state.hoveredTime == m.body.created_at;
                const recordProps = {
                  style: { background: recordSelected ? "rgba(255,255,255,0.2)" : undefined },
                };
                const cellProps = { ...commonProps, recordSelected };
                const rightCellProps = { ...cellProps, rightAlign: true };
                return <tr key={m.uuid}>
                  <td {...recordProps}
                    onMouseEnter={this.hoverTime(m.body.created_at)}
                    onMouseLeave={this.hoverTime(undefined)}>
                    {formatTime(moment.unix(m.body.created_at),
                      this.props.timeSettings, "MMM D")}
                  </td>
                  <td {...recordProps}>{m.body.fbos_version}</td>
                  <TableBodyCell {...cellProps} metricName={"uptime"}>
                    {convertUptime(m.body.uptime || 0, true)}
                  </TableBodyCell>
                  <TableBodyCell {...rightCellProps} metricName={"cpu_usage"}>
                    {m.body.cpu_usage}%
                  </TableBodyCell>
                  <TableBodyCell {...rightCellProps} metricName={"disk_usage"}>
                    {m.body.disk_usage}%
                  </TableBodyCell>
                  <TableBodyCell {...rightCellProps} metricName={"memory_usage"}>
                    {m.body.memory_usage} MB
                  </TableBodyCell>
                  <TableBodyCell {...rightCellProps} metricName={"soc_temp"}>
                    {m.body.soc_temp}&deg;C
                  </TableBodyCell>
                  <TableBodyCell {...rightCellProps} metricName={"throttled"}>
                    <ThrottleIndicator throttleDataString={m.body.throttled}
                      throttleType={ThrottleType.UnderVoltage} />
                  </TableBodyCell>
                  <TableBodyCell {...rightCellProps}
                    metricName={"wifi_level_percent"}>
                    {m.body.wifi_level_percent}%
                  </TableBodyCell>
                </tr>;
              })}
          </tbody>
        </table>
      </div>
    </div>;
  }
}
