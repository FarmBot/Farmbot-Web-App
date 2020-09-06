const mockDevice = { send: jest.fn(() => { return Promise.resolve(); }) };

jest.mock("../../../device", () => ({ getDevice: () => (mockDevice) }));

jest.mock("axios", () => {
  return {
    post: jest.fn(() => {
      return Promise.reject("NOPE");
    })
  };
});

import { transferOwnership, TransferProps } from "../transfer_ownership";
import { getDevice } from "../../../device";
import {
  submitOwnershipChange,
} from "../../fbos_settings/change_ownership_form";
import { API } from "../../../api";
import { error } from "../../../toast/toast";

API.setBaseUrl("http://foo.bar");

describe("transferOwnership", () => {
  const fakeProps = (): TransferProps => ({
    email: "admin@admin.com",
    password: "password123",
    device: getDevice(),
  });

  it("passes rejected promises down the chain", async () => {
    await expect(transferOwnership(fakeProps())).rejects.toEqual("NOPE");
  });
});

describe("submitOwnershipChange", () => {
  it("pops a toast when things go wrong", async () => {
    await submitOwnershipChange({ email: "email", password: "password" });
    expect(error).toHaveBeenCalledWith("Bad username or password");
  });
});
