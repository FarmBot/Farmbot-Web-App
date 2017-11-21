import { determineStrategy, SyncStrat } from "../maybe_negate_status";

describe("determineStrategy()", () => {
  it("finds detects AUTO users", () => {
    expect(determineStrategy({ fbosVersion: "6.0.0", autoSync: true }))
      .toBe(SyncStrat.AUTO);
  });

  it("finds detects MANUAL users", () => {
    expect(determineStrategy({ fbosVersion: "6.0.0", autoSync: false }))
      .toBe(SyncStrat.MANUAL);
  });

  it("finds detects LEGACY users", () => {
    expect(determineStrategy({ fbosVersion: "2.0.0", autoSync: true }))
      .toBe(SyncStrat.LEGACY);
  });

  it("finds detects OFFLINE users", () => {
    expect(determineStrategy({ autoSync: false })).toBe(SyncStrat.OFFLINE);
  });
});
