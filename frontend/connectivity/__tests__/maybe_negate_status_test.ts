import {
  determineStrategy,
  SyncStrat,
  maybeNegateStatus,
} from "../maybe_negate_status";

describe("determineStrategy()", () => {
  it("finds detects ONLINE users", () => {
    expect(determineStrategy({ fbosVersion: "6.0.0" }))
      .toBe(SyncStrat.ONLINE);
  });

  it("finds detects OFFLINE users", () => {
    expect(determineStrategy({})).toBe(SyncStrat.OFFLINE);
  });
});

describe("maybeNegateStatus()", () => {
  it("returns initial value every time when consistent is true", () => {
    const result = maybeNegateStatus({
      consistent: true,
      syncStatus: "synced",
      fbosVersion: "1.2.3",
    });
    expect(result).toEqual("synced");
  });

  it("returns `synced` when consistent", () => {
    const result = maybeNegateStatus({
      consistent: true,
      syncStatus: "synced",
      fbosVersion: "6.0.0",
    });
    expect(result).toEqual("synced");
  });

  it("returns `syncing` when inconsistent", () => {
    const result = maybeNegateStatus({
      consistent: false,
      syncStatus: "unknown",
      fbosVersion: "6.0.0",
    });

    expect(result).toEqual("syncing");
  });

  it("always returns `unknown` when offline", () => {
    const result = maybeNegateStatus({
      consistent: false,
      syncStatus: "synced",
      fbosVersion: undefined,
    });

    expect(result).toEqual("unknown");
  });
});
