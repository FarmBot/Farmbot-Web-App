import {
  calculateLatency,
  calculatePingLoss,
  PingDictionary,
} from "./qos";
import React from "react";
import { t } from "../../i18next_wrapper";

interface Props {
  pings: PingDictionary;
}

interface KeyValProps {
  k: string;
  v: number | string;
}

const NA = "---";
const MS = "ms";
const PCT = "%";
const NONE = "";

function Row({ k, v }: KeyValProps) {
  return <p>
    <b>{t(k)}: </b>
    <span>{v}</span>
  </p>;

}

const pct = (n: string | number, unit: string): string => {
  if (n) {
    return `${n} ${unit}`;
  } else {
    return NA;
  }
};
export class QosPanel extends React.Component<Props, {}> {
  get pingState(): PingDictionary {
    return this.props.pings;
  }

  get latencyReport() {
    return calculateLatency(this.pingState);
  }

  get qualityReport() {
    return calculatePingLoss(this.pingState);
  }

  render() {
    const r = { ...this.latencyReport, ...this.qualityReport };
    const errorRateDecimal = ((r.complete) / r.total);
    const errorRate = Math.round(100 * errorRateDecimal).toFixed(0);

    return <div className="network-info">
      <label>{t("Network Quality")}</label>
      <div className="qos-display">
        <Row k={t("Percent OK")} v={pct(errorRate, PCT)} />
        <Row k={t("Pings sent")} v={pct(r.total, NONE)} />
        <Row k={t("Pings received")} v={pct(r.complete, NONE)} />
        <Row k={t("Best time")} v={pct(r.best, MS)} />
        <Row k={t("Worst time")} v={pct(r.worst, MS)} />
        <Row k={t("Average time")} v={pct(r.average, MS)} />
      </div>
    </div>;

  }
}
