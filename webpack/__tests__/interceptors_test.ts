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
}

function fakeResponse(config: Partial<FakeProps>): AxiosResponse {
  const output: Partial<AxiosResponse> = {
    headers: { "x-request-id": config.uuid || uuid() },
    config: { method: config.method || "put" }
  };

  return output as AxiosResponse;
}

describe("responseFulfilled", () => {
  it("fires off inconsistency tracking", () => {
    const resp = fakeResponse({ method: "post" });
    responseFulfilled(resp);
    expect(startTracking).toHaveBeenCalledWith(resp.headers["x-request-id"]);
  });
});
