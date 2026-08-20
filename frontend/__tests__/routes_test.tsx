import React from "react";
import { render } from "@testing-library/react";
import { store } from "../redux/store";
import { AuthState } from "../auth/interfaces";
import { auth } from "../__test_support__/fake_state/token";
import { Session } from "../session";
import { Path } from "../internal_urls";
import { normalizeRollbarAssetUrls, RootComponent } from "../routes";

describe("<RootComponent />", () => {
  let mockAuth: AuthState | undefined = undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth = undefined;
    jest.spyOn(Session, "fetchStoredToken").mockImplementation(() => mockAuth);
    jest.spyOn(Session, "clear").mockImplementation(() => undefined as never);
  });

  it("clears session when not authorized", () => {
    mockAuth = undefined;
    globalConfig.ROLLBAR_CLIENT_TOKEN = "abc";
    window.location.pathname = Path.mock(Path.logs());
    const instance = new RootComponent({ store });
    instance.UNSAFE_componentWillMount();
    expect(Session.clear).toHaveBeenCalled();
  });

  it("authorized", () => {
    mockAuth = auth;
    globalConfig.ROLLBAR_CLIENT_TOKEN = "abc";
    window.location.pathname = Path.mock(Path.logs());
    const { container } = render(<RootComponent store={store} />);
    expect(Session.clear).not.toHaveBeenCalled();
    expect(container.innerHTML).toContain("rollbar");
  });

  it("doesn't add rollbar", () => {
    mockAuth = auth;
    globalConfig.ROLLBAR_CLIENT_TOKEN = "";
    window.location.pathname = Path.mock(Path.logs());
    const { container } = render(<RootComponent store={store} />);
    expect(Session.clear).not.toHaveBeenCalled();
    expect(container.innerHTML).not.toContain("rollbar");
  });
});

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
