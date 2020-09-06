jest.mock("../index", () => ({
  dispatchNetworkDown: jest.fn(),
  dispatchNetworkUp: jest.fn(),
}));

let mockResponse: Promise<void> = Promise.reject("Simulated failure");
jest.mock("axios", () => ({
  get: jest.fn(() => mockResponse),
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

  it("calls dispatchNetworkUp() when API connectivity succeeds", async () => {
    mockResponse = Promise.resolve();
    await pingAPI();
    expect(dispatchNetworkDown).not.toHaveBeenCalled();
    expect(dispatchNetworkUp).toHaveBeenCalled();
  });
});
