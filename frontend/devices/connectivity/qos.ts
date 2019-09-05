import { betterCompact } from "../../util";

interface Pending {
  kind: "pending";
  id: string;
  start: Date;
  end?: undefined;
}

interface Timeout {
  kind: "timeout";
  id: string;
  start: Date;
  end?: undefined;
}

interface Complete {
  kind: "complete";
  id: string;
  start: Date;
  end: Date;
}

export type Ping = Complete | Pending | Timeout;
export type PingDictionary = Record<string, Ping | undefined>;

export const startPing =
  (s: PingDictionary, id: string): PingDictionary => {
    return { ...s, [id]: { kind: "pending", id, start: new Date() } };
  };

export const failPing =
  (s: PingDictionary, id: string): PingDictionary => {
    const failure = s[id];
    if (failure && failure.kind != "complete") {
      const nextFailure: Timeout = {
        kind: "timeout",
        id,
        start: failure.start
      };
      return { ...s, [id]: nextFailure };
    }

    return s;
  };

export const completePing =
  (s: PingDictionary, id: string): PingDictionary => {
    const failure = s[id];
    if (failure && failure.kind == "pending") {
      return {
        ...s,
        [id]: {
          kind: "complete",
          id,
          start: failure.start,
          end: new Date()
        }
      };
    }
    return s;
  };

type PingLossReport = Record<Ping["kind"] | "total", number>;

const getAll = (s: PingDictionary) => betterCompact(Object.values(s));

export const calculatePingLoss = (s: PingDictionary): PingLossReport => {
  const all = getAll(s);
  const report: PingLossReport = {
    complete: 0,
    pending: 0,
    timeout: 0,
    total: 0,
  };

  all.map(p => report[p.kind] += 1);
  report.total = all.length;

  return report;
};

interface LatencyReport {
  best: number;
  worst: number;
  average: number;
  total: number;
}

const mapper = (p: Ping) => {
  if (p.kind === "complete") {
    return p.end.getTime() - p.start.getTime();
  }
};

export const calculateLatency =
  (s: PingDictionary): LatencyReport => {
    const latency: number[] =
      betterCompact(getAll(s).map(mapper));

    return {
      best: Math.min(...latency) || 0,
      worst: Math.max(...latency) || 0,
      average: latency.reduce((a, b) => a + b, 0) / latency.length,
      total: latency.length
    };
  };
