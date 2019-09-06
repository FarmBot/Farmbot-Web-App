import { calculateLatency, calculatePingLoss, completePing, startPing, failPing } from "../qos";
import { fakePings } from "../../../__test_support__/fake_state/pings";

describe("QoS helpers", () => {
  it("calculateLatency", () => {
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

  it("calculatePingLoss", () => {
    const report = calculatePingLoss(fakePings());
    expect(report.total).toEqual(3);
    expect(report.complete).toEqual(1);
    expect(report.pending).toEqual(1);
    expect(report.complete).toEqual(1);
  });

  it("completePing", () => {
    const KEY = "b";
    const state = fakePings();
    const before = state[KEY];
    const nextState = completePing(state, KEY);
    const after = nextState[KEY];

    expect(before && before.kind).toEqual("pending");
    expect(after && after.kind).toEqual("complete");
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

});
