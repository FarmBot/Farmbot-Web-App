import React from "react";
import { Saucer } from "../../ui";
import {
  colorFromThrottle,
  ThrottleType,
  convertUptime,
} from "../../settings/fbos_settings/fbos_details";
import { t } from "../../i18next_wrapper";
import { TaggedTelemetry } from "farmbot";
import { TimeSettings } from "../../interfaces";
import { FbosMetricHistoryPlot } from "./fbos_metric_history_plot";
import { formatTime } from "../../util";
import moment from "moment";

export interface FbosMetricHistoryTableProps {
  hidden: boolean;
  telemetry: TaggedTelemetry[];
  timeSettings: TimeSettings;
}

export const FbosMetricHistoryTable = (props: FbosMetricHistoryTableProps) =>
  <div className={"fbos-metric-history"} hidden={props.hidden}>
    <FbosMetricHistoryPlot telemetry={props.telemetry} />
    <table>
      <thead>
        <tr>
          <th>{t("Time")}</th>
          <th>{t("Version")}</th>
          <th style={{ color: "yellow" }}>{t("CPU")}</th>
          <th style={{ color: "gray" }}>{t("Disk")}</th>
          <th style={{ color: "purple" }}>{t("Memory")}</th>
          <th style={{ color: "red" }}>{t("Temperature")}</th>
          <th>{t("Voltage")}</th>
          <th style={{ color: "green" }}>{t("Uptime")}</th>
          <th style={{ color: "orange" }}>{t("WiFi")}</th>
        </tr>
      </thead>
      <tbody>
        {props.telemetry.reverse().map(m => {
          const voltageColor = m.body.throttled
            ? colorFromThrottle(m.body.throttled, ThrottleType.UnderVoltage)
            : undefined;
          return <tr key={m.uuid}>
            <td>{formatTime(moment.unix(m.body.created_at as unknown as number),
              props.timeSettings, "MMMM D")}</td>
            <td>{m.body.fbos_version}</td>
            <td>{m.body.cpu_usage}%</td>
            <td>{m.body.disk_usage}%</td>
            <td>{m.body.memory_usage} MB</td>
            <td>{m.body.soc_temp}&deg;C</td>
            <td><Saucer color={voltageColor} /></td>
            <td>{convertUptime(m.body.uptime || 0)}</td>
            <td>{m.body.wifi_level_percent}%</td>
          </tr>;
        })}
      </tbody>
    </table>
  </div>;
