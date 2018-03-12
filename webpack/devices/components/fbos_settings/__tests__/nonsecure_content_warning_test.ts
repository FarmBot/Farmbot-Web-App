import { allAreHttps } from "../nonsecure_content_warning";

describe("allUrlsAreSafe", () => {
  const HTTP = "http://farm.bot";
  const HTTPS = "https://farmbot.io";
  it("catches HTTPS vs HTTP urls", () => {
    /** Always fails if there is even one http: URL */
    expect(allAreHttps([HTTP, HTTPS])).toBeFalsy();
    expect(allAreHttps([HTTPS, HTTP])).toBeFalsy();
    expect(allAreHttps([HTTP, HTTP])).toBeFalsy();

    /** If all are HTTPS: (or there are none) it's safe to proceed. */
    expect(allAreHttps([HTTPS, HTTPS])).toBeTruthy();
    expect(allAreHttps([])).toBeTruthy();
  });
});
