const mockDevice = {
  send: jest.fn(() => { return Promise.resolve(); }),
};

jest.mock("../../../device", () => ({
  getDevice: () => (mockDevice)
}));

jest.mock("axios", () => {
  return { default: { post: jest.fn(() => ({ data: "FAKE CERT" })) } };
});

import { transferOwnership } from "../transfer_ownership";
import { getDevice } from "../../../device";
import { API } from "../../../api";

API.setBaseUrl("http://foo.bar");

describe("transferOwnership", () => {
  it("creates a transfer cert", async () => {
    const p = {
      email: "admin@admin.com",
      password: "password123",
      server: "http://127.0.0.1:3000",
      device: getDevice()
    };
    const x = await transferOwnership(p);
    expect(x).toBe(undefined);
    expect(mockDevice.send).toHaveBeenCalled();
  });
});
