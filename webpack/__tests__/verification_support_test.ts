jest.mock("../util", () => ({ getParam: () => "STUB_PARAM" }));

jest.mock("axios", () => ({
  default: {
    put: () => ({ data: { FAKE_TOKEN: true } })
  }
}));

jest.mock("../session", () => ({
  Session: {
    replaceToken: jest.fn()
  }
}));

jest.mock("../api/api", () => ({
  API: {
    setBaseUrl: jest.fn(),
    fetchBrowserLocation: jest.fn(() => "http://altavista.com:80"),
    current: {
      verificationPath: jest.fn((t: string) => `/stubbed/${t}`),
      baseUrl: "http://altavista.com:80"
    }
  }
}));

import { fail, FAILURE_PAGE, attempt } from "../verification_support";
import { API } from "../api/api";
import { Session } from "../session";
import axios from "axios";
import { getParam } from "../util";

describe("fail()", () => {
  it("writes a failure message", () => {
    expect(fail).toThrow();
    expect(document.documentElement.outerHTML).toContain(FAILURE_PAGE);
  });
});

describe("attempt()", () => {
  it("tries to verify the user", async () => {
    await attempt();
    expect(Session.replaceToken).toHaveBeenCalledWith({ "FAKE_TOKEN": true });
    const FAKE_PATH = API.current.verificationPath(getParam("token"));
    expect(axios.put).toHaveBeenCalledWith(FAKE_PATH);
  });
});
