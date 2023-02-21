import {
  calculateLatency,
  calculatePingLoss,
  PingDictionary,
} from "./qos";
import React from "react";
import { t } from "../../i18next_wrapper";
import { docLinkClick, Saucer } from "../../ui";

export interface QosPanelProps {
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

function QosRow({ k, v }: KeyValProps) {
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

export class QosPanel extends React.Component<QosPanelProps, {}> {
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
        <Saucer color={colorFromPercentOK(errorRateDecimal)} />
        <QosRow k={t("Percent OK")} v={pct(errorRate, PCT)} />
        <QosRow k={t("Pings sent")} v={pct(r.total, NONE)} />
        <QosRow k={t("Pings received")} v={pct(r.complete, NONE)} />
        <QosRow k={t("Best time")} v={pct(r.best, MS)} />
        <QosRow k={t("Worst time")} v={pct(r.worst, MS)} />
        <Saucer color={colorFromAverageTime(r.average)} />
        <QosRow k={t("Average time")} v={pct(r.average, MS)} />
      </div>
      <a onClick={docLinkClick("connecting-farmbot-to-the-internet")}>
        <i className="fa fa-external-link" />
        {t("Learn more about connecting")}
      </a>
    </div>;

  }
}

/** Return an indicator color for the given ping percent OK value. */
export const colorFromPercentOK = (percent: number): string => {
  if (percent < 0.8) {
    return "red";
  } else if (percent < 0.9) {
    return "yellow";
  } else {
    return "green";
  }
};

/** Return an indicator color for the given ping average time value. */
export const colorFromAverageTime = (averageTime: number): string => {
  if (averageTime > 800) {
    return "red";
  } else if (averageTime < 500) {
    return "green";
  } else {
    return "yellow";
  }
};
