import { API } from "../../../api";

export const makePublicKey = () => `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxo5ZcSmZHl9tkfK6mih7
b4pwoIZe2o5RV8UwZiF4qr/w87+UT+P+hCAf+UXRseRDp8HNnnaWMCpf7SD3s+Kf
6Tk2hqVHod1MDX4EUaNXJQiLLjRRrg0x3xkXt7heZcACDnZFf2i6njOhF61ms7lj
Dgm/PZIAPHDthsU3uWJYwB0XA7FF2oyxEpe8dRG6TSmK99KQh8Iy3zXYu4ufM4HA
QcQ3HTE82teEgVxHYlVAKiVHna19ZJAUnSwVdrSnfgFYz2oY1o1g4ZZtY+me8fPW
T1SwalUmvF8lo9hbvDKw3o22mFpr2I0WCmtgY/+UnIMuAEDC1+89JaSRDuhCAyyU
rwIDAQAB
-----END PUBLIC KEY-----
`;

const mockPubKey = makePublicKey();

jest.mock("axios", () => {
  return {
    default: {
      get: (url: string) => Promise.resolve({ data: mockPubKey })
    }
  };
});

import { downloadKey } from "../download_key";

describe("downloadKey", () => {
  it("gets the public key from the server", async () => {
    API.setBaseUrl("http://www.altavista.com");
    const key = await downloadKey();
    expect(key.length).toBeGreaterThan(10);
  });
});
