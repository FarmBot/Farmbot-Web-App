import { calculateLatency, calculatePingLoss, completePing } from "../qos";
import { fakePings } from "../../../__test_support__/fake_state/pings";
import { set } from "lodash";

describe("QoS helpers", () => {
  it("calculateLatency", () => {
    const fakes = fakePings();
    Object // Make all pings "complete", otherwise they won't be counted.
      .values(fakes)
      .map(p => { p && set(p, "kind", "complete"); });
    const report = calculateLatency(fakes);
    expect(report.average).toEqual(313);
    expect(report.best).toEqual(312);
    expect(report.worst).toEqual(316);
    expect(report.total).toEqual(3);
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
    const state = fakePings()
    const before = state[KEY];
    const nextState = completePing(state, KEY);
    const after = nextState[KEY];

    expect(before && before.kind).toEqual("pending");
    expect(after && after.kind).toEqual("complete");
  });

  // it("failPing", () => {
  // });

  // it("startPing", () => {
  // });
});
