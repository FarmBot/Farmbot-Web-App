import axios from "axios";
import * as syncActions from "../../sync/actions";
import { didLogin } from "../actions";
import { Actions } from "../../constants";
import { API } from "../../api/api";
import { auth } from "../../__test_support__/fake_state/token";

describe("didLogin()", () => {
  let setBaseUrlSpy: jest.SpyInstance;
  let axiosPostSpy: jest.SpyInstance;
  let axiosGetSpy: jest.SpyInstance;
  let responseUseSpy: jest.SpyInstance;
  let requestUseSpy: jest.SpyInstance;
  let fetchSyncDataSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    setBaseUrlSpy = jest.spyOn(API, "setBaseUrl");
    axiosPostSpy = jest.spyOn(axios, "post")
      .mockImplementation(jest.fn(() => Promise.resolve({ data: { foo: "bar" } })));
    axiosGetSpy = jest.spyOn(axios, "get")
      .mockImplementation(jest.fn(() => Promise.resolve({ data: { foo: "bar" } })));
    responseUseSpy = jest.spyOn(axios.interceptors.response, "use")
      .mockImplementation(jest.fn());
    requestUseSpy = jest.spyOn(axios.interceptors.request, "use")
      .mockImplementation(jest.fn());
    fetchSyncDataSpy = jest.spyOn(syncActions, "fetchSyncData")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    setBaseUrlSpy.mockRestore();
    axiosPostSpy.mockRestore();
    axiosGetSpy.mockRestore();
    responseUseSpy.mockRestore();
    requestUseSpy.mockRestore();
    fetchSyncDataSpy.mockRestore();
  });

  it("bootstraps the user session", () => {
    const dispatch = jest.fn();
    const result = didLogin(auth, dispatch);
    expect(result).toBeUndefined();

    const { iss } = auth.token.unencoded;
    expect(setBaseUrlSpy).toHaveBeenCalledWith(iss);
    const actions = dispatch.mock.calls.map(x => x && x[0] && x[0].type);
    expect(actions).toContain(Actions.REPLACE_TOKEN);
  });
});
