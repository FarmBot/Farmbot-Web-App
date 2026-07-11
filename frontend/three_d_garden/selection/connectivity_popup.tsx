import React from "react";
import { t } from "../../i18next_wrapper";
import { connectivityData } from "../../devices/connectivity/generate_data";
import { ConnectivityDiagram } from "../../devices/connectivity/diagram";
import {
  calculateLatency, calculatePingLoss,
} from "../../devices/connectivity/qos";
import {
  colorFromAverageTime, colorFromPercentOK,
} from "../../devices/connectivity/qos_panel";
import { Saucer } from "../../ui";
import {
  isWifi, calcMac, calcWifiStrengthPercent, colorFromSignalStrength,
} from
  "../../settings/fbos_settings/fbos_details";
import { BotState } from "../../devices/interfaces";

export interface ConnectivityPopupContentProps {
  bot: BotState;
  data: ReturnType<typeof connectivityData>;
}

interface SummaryRowProps {
  label: string;
  value: string;
  color?: string;
  indicator?: React.ReactNode;
}

const SummaryRow = (props: SummaryRowProps) =>
  <tr>
    <th>{props.label}</th>
    <td>{props.value}</td>
    <td className={"connectivity-summary-indicator"}>
      {props.indicator || (props.color && <Saucer color={props.color} />)}
    </td>
  </tr>;

const displayValue = (value: number, unit: string) =>
  value ? `${value} ${unit}` : "---";

interface WiFiStrengthSummaryProps {
  level: number | undefined;
  percent: number | undefined;
}

const WiFiStrengthSummary = (props: WiFiStrengthSummaryProps) => {
  const percent = calcWifiStrengthPercent(props.level, props.percent);
  const value = percent == undefined ? "---" : `${percent} %`;
  const color = percent == undefined ? "gray" : colorFromSignalStrength(percent);
  const indicator = percent == undefined
    ? undefined
    : <div className={"wifi-strength-display connectivity-summary-wifi"}>
      <div className={"percent-bar"} title={value}>
        <div className={`percent-bar-fill ${color}`}
          style={{ width: `${percent}%` }} />
      </div>
    </div>;
  return <SummaryRow label={t("WiFi strength")} value={value}
    indicator={indicator} />;
};

export const ConnectivityPopupContent = (
  props: ConnectivityPopupContentProps,
) => {
  const { bot, data } = props;
  const info = bot.hardware.informational_settings;
  const wifi = isWifi(info.wifi_level, info.wifi_level_percent);
  const pingLoss = calculatePingLoss(bot.connectivity.pings);
  const latency = calculateLatency(bot.connectivity.pings);
  const percentOkDecimal = pingLoss.complete / pingLoss.total;
  const percentOk = isFinite(percentOkDecimal)
    ? `${Math.round(100 * percentOkDecimal)} %`
    : "---";
  const portsOk = data.flags.userAPI && data.flags.userMQTT
    && data.flags.botAPI && data.flags.botMQTT;
  return <div className={"connectivity-popup-content grid"}>
    <ConnectivityDiagram
      rowData={data.rowData}
      hover={() => () => undefined}
      hoveredConnection={undefined} />
    <table className={"connectivity-summary-table"}>
      <tbody>
        <SummaryRow label={t("Connection type")}
          value={wifi ? "WiFi" : t("Unknown")} />
        <WiFiStrengthSummary level={info.wifi_level}
          percent={info.wifi_level_percent} />
        <SummaryRow label={t("MAC address")}
          value={calcMac(info.node_name, info.target, wifi)} />
        <SummaryRow label={t("Local IP")} value={info.private_ip || "---"} />
        <SummaryRow label={t("Percent OK pings")} value={percentOk}
          color={colorFromPercentOK(percentOkDecimal)} />
        <SummaryRow label={t("Average ping time")}
          value={displayValue(latency.average, "ms")}
          color={colorFromAverageTime(latency.average)} />
        <SummaryRow label={t("Ports")}
          value={portsOk ? t("OK") : t("Error")}
          color={portsOk ? "green" : "red"} />
      </tbody>
    </table>
  </div>;
};
