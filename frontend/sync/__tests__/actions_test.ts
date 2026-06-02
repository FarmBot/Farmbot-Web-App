import axios from "axios";
import { API } from "../../api";
import { Actions } from "../../constants";
import { fetchSyncData, syncFail } from "../actions";
import { Session } from "../../session";

const flushPromises = async () => {
  for (let index = 0; index < 20; index++) {
    await Promise.resolve();
  }
};

describe("syncFail", () => {
  it("tells you why you've been logged out", () => {
    const e = new Error("Whatever");
    console.error = jest.fn();
    jest.spyOn(Session, "clear")
      .mockImplementation((() => undefined) as typeof Session.clear);
    expect(() => syncFail(e)).toThrow(e);
    expect(console.error).toHaveBeenCalledWith("DATA SYNC ERROR!");
    expect(Session.clear).toHaveBeenCalled();
  });
});

describe("fetchSyncData", () => {
  it("fetches sync resources", async () => {
    API.setBaseUrl("http://localhost");
    jest.spyOn(axios, "get")
      .mockImplementation(() => Promise.resolve({ data: { id: 1 } }));
    const dispatch = jest.fn();

    await fetchSyncData(dispatch);
    await flushPromises();

    expect(axios.get).toHaveBeenCalledTimes(27);
    expect(axios.get).toHaveBeenCalledWith("http://localhost/api/users/");
    expect(axios.get).toHaveBeenCalledWith("http://localhost/api/device/");
    expect(axios.get).toHaveBeenCalledWith("http://localhost/api/tools/");
    expect(axios.get).toHaveBeenCalledWith("http://localhost/api/logs/search");
    expect(axios.get)
      .toHaveBeenCalledWith("http://localhost/api/telemetries/");
    expect(dispatch).toHaveBeenCalledTimes(27);
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: Actions.RESOURCE_READY,
      payload: expect.objectContaining({ kind: "User" }),
    }));
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: Actions.RESOURCE_READY,
      payload: expect.objectContaining({ kind: "Telemetry" }),
    }));
  });
});
