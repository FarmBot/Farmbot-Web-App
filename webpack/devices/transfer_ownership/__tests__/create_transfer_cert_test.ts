import { createTransferCert } from "../create_transfer_cert";
import { getDevice } from "../../../device";

describe("createTransferCert", () => {
  it("creates a transfer cert", async () => {
    const p = {
      email: "admin@admin.com",
      password: "password123",
      server: "http://127.0.0.1:3000",
      device: getDevice()
    };
    await createTransferCert(p);
  });
});
