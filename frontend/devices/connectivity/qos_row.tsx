import {
  calculateLatency,
  calculatePingLoss,
  PingDictionary,
} from "./qos";
import React from "react";

interface Props {
  pings: PingDictionary;
}

export class QosRow extends React.Component<Props, {}> {
  get pingState(): PingDictionary { return this.props.pings; }

  render() {
    const reportA = calculateLatency(this.pingState);
    const reportB = calculatePingLoss(this.pingState);
    const report = { ...reportA, ...reportB };
    const ber = ((report.complete || 0) / report.total) || 0;
    return <div>
      <br />
      <ul>
        <li>best: {report.best || 0}</li>
        <li>worst: {report.worst || 0}</li>
        <li>average: {(report.average || 0).toFixed(1)}</li>
        <li>Pings OK: {report.complete}</li>
        <li>Pings pending: {report.pending || 0}</li>
        <li>Pings failed: {report.timeout || 0}</li>
        <li>Total pings: {report.total || 0}</li>
        <li>Percent OK: {(100 * ber).toFixed(1)}</li>
      </ul>
    </div>;
  }
}
