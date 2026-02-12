import React from "react";
import { allAreHttps, NonsecureContentWarning } from "../nonsecure_content_warning";
import { render } from "@testing-library/react";

describe("allUrlsAreSafe", () => {
  const HTTP = "http://farm.bot";
  const HTTPS = "https://farm.bot";
  it("catches HTTPS vs HTTP urls", () => {
    /** Always fails if there is even one http: URL */
    expect(allAreHttps([HTTP, HTTPS])).toBeFalsy();
    expect(allAreHttps([HTTPS, HTTP])).toBeFalsy();
    expect(allAreHttps([HTTP, HTTP])).toBeFalsy();

    /** If all are HTTPS: (or there are none) it's safe to proceed. */
    expect(allAreHttps([HTTPS, HTTPS])).toBeTruthy();
    expect(allAreHttps([])).toBeTruthy();
  });

  it("Shows children if URLs are insecure", () => {
    const { container } = render(<NonsecureContentWarning urls={[HTTP]}>
      Hello
    </NonsecureContentWarning>);
    expect(container.textContent).toContain("Hello");
  });

  it("Hies children if URLs are secure", () => {
    const { container } = render(<NonsecureContentWarning urls={[HTTPS]}>
      Hello
    </NonsecureContentWarning>);
    expect(container.textContent).not.toContain("Hello");
  });
});
