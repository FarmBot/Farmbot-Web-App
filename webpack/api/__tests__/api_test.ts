import { API } from "../api";

describe("API", () => {
  type L = typeof location;
  const fakeLocation = (input: Partial<L>) => input as L;
  it("requires initialization", () => {
    expect(() => API.current).toThrow();
  });

  it("infers the correct port", () => {
    const xmp: [string, L][] = [
      ["3000", fakeLocation({ port: "3808" })],
      ["1234", fakeLocation({ port: "1234" })],
      ["80", fakeLocation({ port: undefined })],
      ["443", fakeLocation({ port: undefined, origin: "https://x.y.z" })],
    ];
    xmp.map(x => expect(API.inferPort(x[1])).toEqual(x[0]));
  });
});
