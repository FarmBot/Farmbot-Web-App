const mockDevice = { send: jest.fn(() => { return Promise.resolve(); }) };

jest.mock("../../../device", () => ({ getDevice: () => (mockDevice) }));

jest.mock("axios", () => {
  return {
    default: {
      post: jest.fn(() => {
        return Promise.reject("NOPE");
      })
    }
  };
});

import { transferOwnership } from "../transfer_ownership";
import { getDevice } from "../../../device";
import {
  submitOwnershipChange
} from "../../components/fbos_settings/change_ownership_form";
import { error } from "farmbot-toastr";
import { API } from "../../../api";

API.setBaseUrl("http://foo.bar");

describe("transferOwnership", () => {
  it("passes rejected promises down the chain", async () => {
    const p = {
      email: "admin@admin.com",
      password: "password123",
      server: "http://127.0.0.1:3000",
      device: getDevice()
    };

    try {
      await transferOwnership(p);
      fail("If you see this message, transferOwnership(p) is hiding errors.");
    } catch (error) {
      expect(error).toEqual("NOPE");
    }
  });
});

describe("submitOwnershipChange", () => {
  it("pops a toast when things go wrong", async () => {
    await submitOwnershipChange({ email: "email", password: "password" });
    expect(error).toHaveBeenCalledWith("Bad username or password");
  });
});
