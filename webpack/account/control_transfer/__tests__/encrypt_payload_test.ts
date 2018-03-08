import { encryptPayload } from "../encrypt_payload";
import { makePublicKey } from "./download_key_test";

describe("encryptPayload()", () => {
  it("creates a secrets file", async () => {
    const result = await encryptPayload({
      email: "admin@admin.com", password: "password123", pubKey: makePublicKey()
    });
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(10);
  });
});
