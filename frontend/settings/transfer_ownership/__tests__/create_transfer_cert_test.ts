const mockDevice = {
  moveRelative: jest.fn(() => Promise.resolve()),
  send: jest.fn(() => Promise.resolve()),
};
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

jest.mock("axios", () => ({ post: jest.fn(() => ({ data: "FAKE CERT" })) }));

import { createTransferCert } from "../create_transfer_cert";
import { getDevice } from "../../../device";
import axios from "axios";
import { API } from "../../../api";
import { TransferProps } from "../transfer_ownership";

API.setBaseUrl("http://foo.bar");

describe("createTransferCert()", () => {
  const fakeProps = (): TransferProps => ({
    email: "admin@admin.com",
    password: "password123",
    device: getDevice(),
  });

  it("creates a transfer cert", async () => {
    const x = await createTransferCert(fakeProps());
    expect(x).toBe("FAKE CERT");
    expect(axios.post).toHaveBeenCalled();
    const url = "http://foo.bar/api/users/control_certificate";
    const data = { "email": "admin@admin.com", "password": "password123" };
    expect(axios.post).toHaveBeenCalledWith(url, data);
  });
});
