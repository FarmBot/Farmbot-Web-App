const mockDevice = { send: jest.fn(() => Promise.resolve()) };
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

let mockPost = Promise.resolve(({ data: "FAKE CERT" }));
jest.mock("axios", () => ({ post: jest.fn(() => mockPost) }));

import { transferOwnership, TransferProps } from "../transfer_ownership";
import { getDevice } from "../../../device";
import { API } from "../../../api";
import { submitOwnershipChange } from "../change_ownership_form";
import { error } from "../../../toast/toast";

API.setBaseUrl("http://foo.bar");

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
  });
});

describe("submitOwnershipChange()", () => {
  it("pops a toast when things go wrong", async () => {
    mockPost = Promise.reject("NOPE");
    await submitOwnershipChange({
      email: "email", password: "password",
    });
    expect(error).toHaveBeenCalledWith("Bad username or password");
  });

  it("pops a toast when things go wrong: missing fields", () => {
    submitOwnershipChange({ email: "", password: "" });
    expect(error).toHaveBeenCalledWith("Bad username or password");
  });
});
