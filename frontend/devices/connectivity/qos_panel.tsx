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
    const percentage = (r.average).toFixed(1);

    return <div className="fbos-info">
      <label>{t("Network Quality")}</label>
      <div className="chip-temp-display">
        <Row k="Sent" v={r.total} />
        <Row k="Received" v={r.complete} />
        <Row k="Lost" v={r.timeout} />
        <Row k="Pending" v={r.pending} />
        <Row k="Percent OK" v={(100 * errorRate).toFixed(1)} />
        <Row k="Best Time (ms)" v={r.best} />
        <Row k="Worst Time (ms)" v={r.worst} />
        <Row k="Average Time (ms)" v={percentage} />
      </div>
    </div>;

  }
}
