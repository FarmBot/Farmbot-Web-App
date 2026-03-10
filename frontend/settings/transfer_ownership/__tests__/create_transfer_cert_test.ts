const mockDevice = {
  moveRelative: jest.fn(() => Promise.resolve()),
  send: jest.fn(() => Promise.resolve()),
};
import * as deviceModule from "../../../device";

import { createTransferCert } from "../create_transfer_cert";
import { getDevice } from "../../../device";
import axios from "axios";
import { API } from "../../../api";
import { TransferProps } from "../transfer_ownership";

API.setBaseUrl("http://foo.bar");

let getDeviceSpy: jest.SpyInstance;
let axiosPostSpy: jest.SpyInstance;

beforeEach(() => {
  getDeviceSpy = jest.spyOn(deviceModule, "getDevice")
    .mockImplementation(() => mockDevice as never);
  axiosPostSpy = jest.spyOn(axios, "post")
    .mockImplementation(() => Promise.resolve({ data: "FAKE CERT" }) as never);
});

afterEach(() => {
  getDeviceSpy.mockRestore();
  axiosPostSpy.mockRestore();
});
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
