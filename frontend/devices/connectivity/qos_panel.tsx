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

function Row({ k, v }: KeyValProps) {
  return <p>
    <b>{t(k)}: </b>
    <span>{v}</span>
  </p>;

}

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
    const errorRate = ((r.complete) / r.total);
    const avg = r.average ? (r.average).toFixed(0) : NA;
    const pct = Math.round(100 * errorRate).toFixed(0);

    return <div className="fbos-info">
      <label>{t("Network Quality")}</label>
      <div className="chip-temp-display">
        <Row k="Pings sent" v={r.total} />
        <Row k="Pings received" v={r.complete} />
        <Row k="Percent OK" v={`${pct}%`} />
        <Row k="Best time (ms)" v={r.best || NA} />
        <Row k="Worst time (ms)" v={r.worst || NA} />
        <Row k="Average time (ms)" v={avg || NA} />
      </div>
    </div>;

  }
}
