import {
  calculateLatency,
  calculatePingLoss,
  completePing,
  startPing,
  failPing,
  PingDictionary,
} from "../qos";
import {
  fakePings,
} from "../../../__test_support__/fake_state/pings";
import { range } from "lodash";

describe("QoS helpers", () => {
  it("calculates latency", () => {
    const report = calculateLatency({
      "a": { kind: "timeout", start: 111, end: 423 },
      "b": { kind: "pending", start: 213 },
      "c": { kind: "complete", start: 319, end: 631 },
      "d": { kind: "complete", start: 111, end: 423 },
      "e": { kind: "complete", start: 136, end: 213 },
      "f": { kind: "complete", start: 319, end: 631 },
    });
    expect(report.best).toEqual(77);
    expect(report.worst).toEqual(312);
    expect(report.average).toEqual(253);
    expect(report.total).toEqual(4);
  });

  it("logs qos", () => {
    const pings: PingDictionary = {};
    range(100).map(i => {
      pings[i] = { kind: "complete", start: 100, end: 200 };
    });
    window.logStore = { log: jest.fn() };
    calculateLatency(pings);
    expect(window.logStore.log).toHaveBeenCalledWith(
      "FBOS Ping QoS Message",
      { "average": 100, "best": 100, "total": 100, "worst": 100 },
      "info",
    );
  });

  it("returns 0 when latency can't be calculated", () => {
    const report = calculateLatency({});
    expect(report.best).toEqual(0);
    expect(report.worst).toEqual(0);
    expect(report.average).toEqual(0);
    expect(report.total).toEqual(1);
  });

  it("calculates ping loss", () => {
    const report = calculatePingLoss(fakePings());
    expect(report.total).toEqual(2);
    expect(report.complete).toEqual(1);
    expect(report.pending).toEqual(1);
    expect(report.complete).toEqual(1);
  });

  it("marks a ping as complete", () => {
    const KEY = "b";
    const state = fakePings();
    const before = state[KEY];
    const nextState = completePing(state, KEY);
    const after = nextState[KEY];

    expect(before && before.kind).toEqual("pending");
    expect(after && after.kind).toEqual("complete");
  });

  it("does not mark pings as complete twice", () => {
    const state: PingDictionary = {
      "x": { kind: "complete", start: 319, end: 631 },
    };
    const nextState = completePing(state, "x");
    expect(nextState).toBe(state); // No, not "toEqual"
  });

  it("starts a ping", () => {
    const state = fakePings();
    const nextState = startPing(state, "x");

    expect(state["x"]).toBeFalsy();
    expect(nextState["x"]).toBeTruthy();
  });

  it("fails a ping", () => {
    const state = fakePings();
    state["x"] = { kind: "pending", start: 1 };
    const nextState = failPing(state, "x");
    const after = nextState["x"];
    expect(after && after.kind).toEqual("timeout");
  });

  it("skips pings that don't need to be failed", () => {
    const state: PingDictionary = {
      "x": { kind: "complete", start: 319, end: 631 },
    };
    const nextState = failPing(state, "x");
    expect(nextState).toBe(state); // No, not "toEqual"
  });
});
