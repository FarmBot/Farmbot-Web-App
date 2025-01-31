jest.mock("../connectivity/data_consistency", () => {
  return {
    startTracking: jest.fn(),
    outstandingRequests: { last: "abc" }
  };
});

jest.mock("../connectivity/index", () => {
  return {
    dispatchNetworkUp: jest.fn(),
    dispatchNetworkDown: jest.fn(),
  };
});

jest.mock("../session", () => ({
  Session: {
    clear: jest.fn()
  }
}));

import {
  responseFulfilled, isLocalRequest, requestFulfilled, responseRejected,
} from "../interceptors";
import { AxiosResponse, InternalAxiosRequestConfig, Method } from "axios";
import { uuid } from "farmbot";
import { startTracking } from "../connectivity/data_consistency";
import { SafeError } from "../interceptor_support";
import { API } from "../api";
import { auth } from "../__test_support__/fake_state/token";
import { dispatchNetworkUp, dispatchNetworkDown } from "../connectivity";
import { Session } from "../session";
import { error } from "../toast/toast";

const ANY_NUMBER = expect.any(Number);

interface FakeProps {
  uuid: string;
  method: Method;
  requestId: string;
  url: string;
}

function fakeResponse(config: Partial<FakeProps>): AxiosResponse {
  const output: Partial<AxiosResponse> = {
    headers: { "X-Farmbot-Rpc-Id": config.uuid || uuid() },
    config: {
      method: config.method || "put",
      url: config.url || "http://my.farm.bot/api/tools/6"
    } as InternalAxiosRequestConfig,
  };

  return output as AxiosResponse;
}

describe("responseFulfilled", () => {
  it("won't fire for webcam feed updates", () => {
    const resp = fakeResponse({
      method: "post",
      url: "https://staging.farm.bot/api/webcam_feeds/"
    });
    responseFulfilled(resp);
    expect(startTracking).not.toHaveBeenCalled();
  });
});

describe("responseRejected", () => {
  it("undefined error", async () => {
    await expect(responseRejected(undefined)).rejects.toEqual(undefined);
    expect(dispatchNetworkUp).not.toHaveBeenCalled();
    expect(dispatchNetworkDown).toHaveBeenCalledWith("user.api", ANY_NUMBER);
  });

  it("safe error", async () => {
    const safeError: SafeError = {
      request: { responseURL: "" },
      response: { status: 400 }
    };
    await expect(responseRejected(safeError)).rejects.toEqual(safeError);
    expect(dispatchNetworkDown).not.toHaveBeenCalled();
    expect(dispatchNetworkUp).toHaveBeenCalledWith("user.api", ANY_NUMBER);
  });

  it("throws error", () => {
    const safeError: SafeError = {
      request: { responseURL: "" },
      response: { status: 400 }
    };
    jest.useFakeTimers();
    expect(() => {
      responseRejected(safeError).then(() => { }, () => { });
      jest.runAllTimers();
    }).toThrow("Bad response: 400 {\"status\":400}");
  });

  it("handles 500", async () => {
    const safeError: SafeError = {
      request: { responseURL: "" },
      response: { status: 500 }
    };
    await expect(responseRejected(safeError)).rejects.toEqual(safeError);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("we've been notified"));
  });

  it("handles 401", async () => {
    const safeError: SafeError = {
      request: { responseURL: "http://localhost:3000" },
      response: { status: 401 }
    };
    API.setBaseUrl("http://localhost:3000");
    await expect(responseRejected(safeError)).rejects.toEqual(safeError);
    expect(Session.clear).toHaveBeenCalled();
  });

  it("handles 404", async () => {
    const safeError: SafeError = {
      request: { responseURL: "http://localhost:3000" },
      response: { status: 404 }
    };
    API.setBaseUrl("http://localhost:3000");
    await expect(responseRejected(safeError)).rejects.toEqual(safeError);
    expect(Session.clear).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("handles 451", async () => {
    const safeError: SafeError = {
      request: { responseURL: "" },
      response: { status: 451 }
    };
    await expect(responseRejected(safeError)).rejects.toEqual(safeError);
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining("accept the new terms"));
    expect(window.location.assign).toHaveBeenCalledWith("/tos_update");
    await expect(responseRejected(safeError)).rejects.toEqual(safeError);
    expect(window.alert).toHaveBeenCalledTimes(1);
  });
});

const fake =
  (responseURL: string): Partial<SafeError> => ({ request: { responseURL } });

describe("isLocalRequest", () => {
  it("determines if the URL is local vs. Github, etc...", () => {
    API.setBaseUrl("http://localhost:3000");

    const github = fake("http://github.com/foo/bar") as SafeError;
    expect(isLocalRequest(github)).toBe(false);

    const api = fake("http://localhost:3000/api/tools/1") as SafeError;
    expect(isLocalRequest(api)).toBe(true);
  });
});

describe("requestFulfilled", () => {
  it("returns unchanged config when not an API request", () => {
    API.setBaseUrl("http://localhost:3000");
    const config = requestFulfilled(auth)({
      url: "other",
    } as InternalAxiosRequestConfig);
    expect(config).toEqual({ url: "other" });
  });

  it("returns config with headers", () => {
    API.setBaseUrl("http://localhost:3000");
    const config = requestFulfilled(auth)({
      url: "http://localhost:3000/api",
    } as InternalAxiosRequestConfig);
    expect(config.url).toEqual("http://localhost:3000/api");
    expect(config.headers?.Authorization).toEqual(auth.token.encoded);
    expect(config.headers?.["X-Farmbot-Rpc-Id"]).toEqual("abc");
  });
});
