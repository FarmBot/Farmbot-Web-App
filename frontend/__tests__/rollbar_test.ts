import {
  normalizeRollbarAssetUrls, prepareRollbarPayload,
  redact,
} from "../rollbar";

describe("normalizeRollbarAssetUrls()", () => {
  it("uses the shared Rollbar host for FarmBot assets", () => {
    const payload = {
      body: {
        trace: {
          frames: [
            { filename: "https://my.farm.bot/assets/dist/app.js" },
            { filename: "https://example.com/other.js" },
            {},
          ],
        },
        trace_chain: [{
          frames: [
            { filename: "https://custom.farm.bot/assets/dist/chunk.js" },
          ],
        }],
      },
    };

    normalizeRollbarAssetUrls(payload);

    expect(payload.body.trace.frames).toEqual([
      { filename: "https://dynamichost/assets/dist/app.js" },
      { filename: "https://example.com/other.js" },
      {},
    ]);
    expect(payload.body.trace_chain[0].frames).toEqual([
      { filename: "https://dynamichost/assets/dist/chunk.js" },
    ]);
  });

  it("handles payloads without a trace", () => {
    expect(() => normalizeRollbarAssetUrls({})).not.toThrow();
  });
});

describe("redact()", () => {
  it("redacts structured auth headers", () => {
    const payload = {
      request: {
        headers: {
          Authorization: "Bearer token",
          Accept: "application/json",
        },
      },
    };

    redact(payload);

    expect(payload.request.headers).toEqual({
      Authorization: "---",
      Accept: "application/json",
    });
  });

  it("redacts authorization headers embedded in error messages", () => {
    const payload = {
      body: {
        message: "Bad response: {\"headers\":{\"Authorization\":"
          + "\"Bearer token\",\"Accept\":\"application/json\"}}",
      },
    };

    redact(payload);

    expect(payload.body.message).toContain("\"Authorization\":\"---\"");
    expect(payload.body.message).not.toContain("token");
    expect(payload.body.message).toContain("application/json");
  });
});

describe("prepareRollbarPayload()", () => {
  it("normalizes assets and redacts auth", () => {
    const payload = {
      body: {
        message: "Authorization: token",
        trace: {
          frames: [{ filename: "https://my.farm.bot/assets/dist/app.js" }],
        },
      },
    };

    prepareRollbarPayload(payload);

    expect(payload.body.message).toEqual("Authorization: ---");
    expect(payload.body.trace.frames[0].filename)
      .toEqual("https://dynamichost/assets/dist/app.js");
  });
});
