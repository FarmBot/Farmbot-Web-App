const mockDevice = { send: jest.fn(() => Promise.resolve()) };
import * as deviceModule from "../../../device";

let mockPost = Promise.resolve(({ data: "FAKE CERT" }));

import { getDevice } from "../../../device";
import { API } from "../../../api";
import { error } from "../../../toast/toast";
import axios from "axios";
const { transferOwnership } =
  jest.requireActual("../transfer_ownership");
import { TransferProps } from "../transfer_ownership";
const { submitOwnershipChange } =
  jest.requireActual("../change_ownership_form");

API.setBaseUrl("http://foo.bar");

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(deviceModule, "getDevice")
    .mockImplementation(() => mockDevice as never);
  jest.spyOn(axios, "post")
    .mockImplementation(() => mockPost as never);
  mockPost = Promise.resolve(({ data: "FAKE CERT" }));
});


describe("transferOwnership", () => {
  const fakeProps = (): TransferProps => ({
    email: "admin@admin.com",
    password: "password123",
    device: getDevice(),
  });

  it("creates a transfer cert", async () => {
    const p = fakeProps();
    await expect(transferOwnership(p)).resolves.toBe(undefined);
    expect(mockDevice.send).toHaveBeenCalled();
  });

  it("passes rejected promises down the chain", async () => {
    mockPost = Promise.reject("NOPE");
    await expect(transferOwnership(fakeProps())).rejects.toEqual("NOPE");
    mockPost = Promise.resolve(({ data: "FAKE CERT" }));
  });
});

describe("submitOwnershipChange()", () => {
  it("pops a toast when things go wrong", async () => {
    mockPost = Promise.reject("NOPE");
    await submitOwnershipChange({
      email: "email", password: "password",
    });
    expect(error).toHaveBeenCalledWith("Bad username or password");
    mockPost = Promise.resolve(({ data: "FAKE CERT" }));
  });

  it("pops a toast when things go wrong: missing fields", () => {
    submitOwnershipChange({ email: "", password: "" });
    expect(error).toHaveBeenCalledWith("Bad username or password");
  });
});
