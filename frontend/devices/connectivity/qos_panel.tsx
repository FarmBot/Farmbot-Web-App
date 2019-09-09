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

    return <div className="fbos-info">
      <label>{t("Network Quality")}</label>
      <div className="chip-temp-display">
        <Row k="Percent OK" v={pct(errorRate, PCT)} />
        <Row k="Pings sent" v={pct(r.total, NONE)} />
        <Row k="Pings received" v={pct(r.complete, NONE)} />
        <Row k="Best time" v={pct(r.best, MS)} />
        <Row k="Worst time" v={pct(r.worst, MS)} />
        <Row k="Average time" v={pct(r.average, MS)} />
      </div>
    </div>;

  }
}
