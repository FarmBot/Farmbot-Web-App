jest.mock("../connectivity/data_consistency", () => {
  return {
    startTracking: jest.fn()
  };
});

import { responseFulfilled } from "../interceptors";
import { AxiosResponse } from "axios";
import { uuid } from "farmbot";
import { startTracking } from "../connectivity/data_consistency";

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
  it("fires off inconsistency tracking", () => {
    jest.clearAllMocks();
    const resp = fakeResponse({ method: "post" });
    responseFulfilled(resp);
    expect(startTracking).toHaveBeenCalledWith(resp.headers["X-Farmbot-Rpc-Id"]);
  });

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
