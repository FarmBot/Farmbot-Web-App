jest.mock("..", (): Partial<typeof import("..")> => {
  return {
    dispatchNetworkDown: jest.fn(),
    dispatchNetworkUp: jest.fn(),
  };
});

jest.mock("axios", () => {
  return {
    get: jest.fn((_url: string) => {
      return Promise.reject("Simulated failure");
    })
  };
});

import { dispatchNetworkDown, dispatchNetworkUp } from "..";
import { pingAPI } from "../ping_mqtt";
import { API } from "../../api/api";

describe("pingAPI()", () => {
  beforeAll(() => {
    API.setBaseUrl("http://foo.bar:123");
  });

  it("calls dispatchNetworkDown() when API connectivity fails", (done) => {
    pingAPI().then(() => {
      expect(dispatchNetworkDown).toHaveBeenCalled();
      expect(dispatchNetworkUp).not.toHaveBeenCalled();
      done();
    });
  });
});
