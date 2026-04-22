import { getFirstPartyFarmwareList, retryFetchPackageName } from "../actions";
import { Actions } from "../../constants";
import axios from "axios";
import { API } from "../../api";

let axiosGetSpy: jest.SpyInstance;
let axiosPostSpy: jest.SpyInstance;

beforeEach(() => {
  axiosGetSpy = jest.spyOn(axios, "get")
    .mockImplementation(() =>
      Promise.resolve({
        data: [
          { package: "farmware0" },
          { package: "farmware1" },
        ]
      }));
  axiosPostSpy = jest.spyOn(axios, "post")
    .mockImplementation(() => Promise.resolve({}));
});

afterEach(() => {
  axiosGetSpy.mockRestore();
  axiosPostSpy.mockRestore();
});
describe("getFirstPartyFarmwareList()", () => {
  it("sets list", async () => {
    const dispatch = jest.fn();
    await getFirstPartyFarmwareList()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.FETCH_FIRST_PARTY_FARMWARE_NAMES_OK,
      payload: ["farmware0", "farmware1"]
    });
  });
});

describe("retryFetchPackageName()", () => {
  API.setBaseUrl("");

  it("retries fetch", () => {
    retryFetchPackageName(1);
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost/api/farmware_installations/1/refresh");
  });

  it("doesn't retry fetch without id", () => {
    retryFetchPackageName(undefined);
    expect(axios.post).not.toHaveBeenCalled();
  });
});
