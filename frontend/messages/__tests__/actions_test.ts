let mockPostResponse = Promise.resolve({ data: { foo: "bar" } });

import axios from "axios";
import { fetchBulletinContent, seedAccount } from "../actions";
import * as toast from "../../toast/toast";
import * as toastErrorsModule from "../../toast_errors";
import { API } from "../../api/api";

let axiosGetSpy: jest.SpyInstance;
let axiosPostSpy: jest.SpyInstance;
let infoSpy: jest.SpyInstance;
let toastErrorsSpy: jest.SpyInstance;

beforeEach(() => {
  mockPostResponse = Promise.resolve({ data: { foo: "bar" } });
  API.setBaseUrl("http://localhost:3000");
  infoSpy = jest.spyOn(toast, "info").mockImplementation(jest.fn());
  toastErrorsSpy = jest.spyOn(toastErrorsModule, "toastErrors")
    .mockImplementation(jest.fn());
  axiosGetSpy = jest.spyOn(axios, "get")
    .mockImplementation(() => Promise.resolve({ data: { foo: "bar" } }) as never);
  axiosPostSpy = jest.spyOn(axios, "post")
    .mockImplementation(() => mockPostResponse as never);
});

afterEach(() => {
  infoSpy.mockRestore();
  toastErrorsSpy.mockRestore();
  axiosGetSpy.mockRestore();
  axiosPostSpy.mockRestore();
});
describe("fetchBulletinContent()", () => {
  it("fetches data", async () => {
    expect(await fetchBulletinContent("slug")).toEqual({ foo: "bar" });
  });
});

describe("seedAccount()", () => {
  it("seeds account", async () => {
    const dismiss = jest.fn();
    await seedAccount(dismiss)({ label: "Genesis v1.2", value: "genesis_1.2" });
    expect(axios.post).toHaveBeenCalledWith(API.current.accountSeedPath, {
      product_line: "genesis_1.2"
    });
    expect(infoSpy).toHaveBeenCalledWith("Seeding in progress.", { title: "Busy" });
    expect(dismiss).toHaveBeenCalled();
  });

  it("seeds account: no callback", async () => {
    await seedAccount()({ label: "Genesis v1.2", value: "genesis_1.2" });
    expect(axios.post).toHaveBeenCalledWith(API.current.accountSeedPath, {
      product_line: "genesis_1.2"
    });
    expect(infoSpy).toHaveBeenCalledWith("Seeding in progress.", { title: "Busy" });
  });

  it("returns error while trying to seed account", async () => {
    axiosPostSpy.mockRejectedValueOnce({ response: { data: ["error"] } } as never);
    const dismiss = jest.fn();
    await seedAccount(dismiss)({ label: "Genesis v1.2", value: "genesis_1.2" });
    expect(axios.post).toHaveBeenCalledWith(API.current.accountSeedPath, {
      product_line: "genesis_1.2"
    });
    expect(toastErrorsSpy).toHaveBeenCalledWith({
      err: { response: { data: ["error"] } },
    });
    expect(dismiss).not.toHaveBeenCalled();
  });
});
