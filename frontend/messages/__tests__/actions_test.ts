let mockPostResponse = Promise.resolve({ data: { foo: "bar" } });

import axios from "axios";
import { fetchBulletinContent, seedAccount } from "../actions";
import { info, error } from "../../toast/toast";
import { API } from "../../api/api";

let axiosGetSpy: jest.SpyInstance;
let axiosPostSpy: jest.SpyInstance;

beforeEach(() => {
  mockPostResponse = Promise.resolve({ data: { foo: "bar" } });
  API.setBaseUrl("http://localhost:3000");
  axiosGetSpy = jest.spyOn(axios, "get")
    .mockImplementation(() => Promise.resolve({ data: { foo: "bar" } }) as never);
  axiosPostSpy = jest.spyOn(axios, "post")
    .mockImplementation(() => mockPostResponse as never);
});

afterEach(() => {
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
    expect(info).toHaveBeenCalledWith("Seeding in progress.", { title: "Busy" });
    expect(dismiss).toHaveBeenCalled();
  });

  it("seeds account: no callback", async () => {
    await seedAccount()({ label: "Genesis v1.2", value: "genesis_1.2" });
    expect(axios.post).toHaveBeenCalledWith(API.current.accountSeedPath, {
      product_line: "genesis_1.2"
    });
    expect(info).toHaveBeenCalledWith("Seeding in progress.", { title: "Busy" });
  });

  it("returns error while trying to seed account", async () => {
    mockPostResponse = Promise.reject({ response: { data: ["error"] } });
    const dismiss = jest.fn();
    await seedAccount(dismiss)({ label: "Genesis v1.2", value: "genesis_1.2" });
    expect(axios.post).toHaveBeenCalledWith(API.current.accountSeedPath, {
      product_line: "genesis_1.2"
    });
    expect(error).toHaveBeenCalledWith(expect.stringContaining("error"));
    expect(dismiss).not.toHaveBeenCalled();
  });
});
