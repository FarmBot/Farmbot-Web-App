jest.mock("../connectivity/data_consistency", () => {
  return {
    startTracking: jest.fn()
  };
});

import { responseFulfilled, isLocalRequest } from "../interceptors";
import { AxiosResponse } from "axios";
import { uuid } from "farmbot";
import { startTracking } from "../connectivity/data_consistency";
import { SafeError } from "../interceptor_support";
import { API } from "../api";

interface FakeProps {
  uuid: string;
  method: string;
  requestId: string;
  url: string;
}

function fakeResponse(config: Partial<FakeProps>): AxiosResponse {
  const output: Partial<AxiosResponse> = {
    headers: { "X-Farmbot-Rpc-Id": config.uuid || uuid() },
    config: {
      method: config.method || "put",
      url: config.url || "http://my.farmbot.io/api/tools/6"
    }
  };

  return output as AxiosResponse;
}

describe("responseFulfilled", () => {
  it("won't fire for webcam feed updates", () => {
    jest.clearAllMocks();
    const resp = fakeResponse({
      method: "post",
      url: "https://staging.farmbot.io/api/webcam_feeds/"
    });
    responseFulfilled(resp);
    expect(startTracking).not.toHaveBeenCalled();
  });
});

const fake =
  (responseURL: string): Partial<SafeError> => ({ request: { responseURL } });

describe("isLocalRequest", () => {
  it("determines if the URL is local vs. Github, Openfarm, etc...", () => {
    API.setBaseUrl("http://localhost:3000");

    const openfarm = fake("http://openfarm.cc/foo/bar") as SafeError;
    expect(isLocalRequest(openfarm)).toBe(false);

    const api = fake("http://localhost:3000/api/tools/1") as SafeError;
    expect(isLocalRequest(api)).toBe(true);
  });
});
