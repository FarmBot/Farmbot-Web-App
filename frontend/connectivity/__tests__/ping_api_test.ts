jest.mock("../index", () => ({
  dispatchNetworkDown: jest.fn(),
  dispatchNetworkUp: jest.fn(),
}));

jest.mock("axios", () => ({
  get: jest.fn((_url: string) => Promise.reject("Simulated failure")),
}));

import { dispatchNetworkDown, dispatchNetworkUp } from "../index";
import { pingAPI } from "../ping_mqtt";
import { API } from "../../api/api";

describe("pingAPI()", () => {
  beforeAll(() => {
    API.setBaseUrl("http://foo.bar:123");
  });

  it("calls dispatchNetworkDown() when API connectivity fails", async () => {
    await pingAPI();
    expect(dispatchNetworkDown).toHaveBeenCalled();
    expect(dispatchNetworkUp).not.toHaveBeenCalled();
  });
});
