const mockDevice = {
  moveRelative: jest.fn(() => { return Promise.resolve(); }),
};

jest.mock("../../../device", () => ({
  getDevice: () => (mockDevice)
}));

jest.mock("axios", () => {
  return { default: { post: jest.fn(() => ({ data: "FAKE CERT" })) } };
});

import { createTransferCert } from "../create_transfer_cert";
import { getDevice } from "../../../device";
import { API } from "../../../api";
import axios from "axios";

describe("createTransferCert", () => {
  it("creates a transfer cert", async () => {
    API.setBaseUrl("http://lycos.com:1234");
    const p = {
      email: "admin@admin.com",
      password: "password123",
      server: "http://127.0.0.1:3000",
      device: getDevice()
    };
    const x = await createTransferCert(p);
    expect(x).toBe("FAKE CERT");
    expect(axios.post).toHaveBeenCalled();
    const url = "http://127.0.0.1:3000/api/users/control_certificate";
    const data = { "email": "admin@admin.com", "password": "password123" };
    expect(axios.post).toHaveBeenCalledWith(url, data);
  });
});
