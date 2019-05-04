let mockPostResponse = Promise.resolve({ data: { foo: "bar" } });
jest.mock("axios", () => ({
  get: jest.fn(() => Promise.resolve({ data: { foo: "bar" } })),
  post: jest.fn(() => mockPostResponse),
}));

jest.mock("../../api/api", () => ({
  API: {
    current: {
      globalBulletinPath: "/api/stub",
      accountSeedPath: "/api/stub"
    }
  }
}));

import axios from "axios";
import { fetchBulletinContent, seedAccount } from "../actions";
import { info, error } from "farmbot-toastr";

describe("fetchBulletinContent()", () => {
  it("fetches data", async () => {
    expect(await fetchBulletinContent("slug")).toEqual({ foo: "bar" });
  });
});

describe("seedAccount()", () => {
  it("seeds account", async () => {
    const dismiss = jest.fn();
    await seedAccount(dismiss)({ label: "Genesis v1.2", value: "genesis_1.2" });
    expect(axios.post).toHaveBeenCalledWith("/api/stub", {
      product_line: "genesis_1.2"
    });
    expect(info).toHaveBeenCalledWith("Seeding in progress.", "Busy");
    expect(dismiss).toHaveBeenCalled();
  });

  it("returns error while trying to seed account", async () => {
    mockPostResponse = Promise.reject({ response: { data: ["error"] } });
    const dismiss = jest.fn();
    await seedAccount(dismiss)({ label: "Genesis v1.2", value: "genesis_1.2" });
    expect(axios.post).toHaveBeenCalledWith("/api/stub", {
      product_line: "genesis_1.2"
    });
    expect(error).toHaveBeenCalledWith(expect.stringContaining("error"));
    expect(dismiss).not.toHaveBeenCalled();
  });
});
