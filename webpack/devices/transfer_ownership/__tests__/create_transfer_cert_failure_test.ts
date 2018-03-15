const mockDevice = {
  send: jest.fn(() => { return Promise.resolve(); }),
};

jest.mock("../../../device", () => ({
  getDevice: () => (mockDevice)
}));

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
