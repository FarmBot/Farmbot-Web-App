import React from "react";
import { render } from "@testing-library/react";
import { SoftwareDocsPanel } from "../software";
import { ExternalUrl } from "../../../external_urls";

describe("<SoftwareDocsPanel />", () => {
  beforeEach(() => {
    location.search = "";
  });

  it("renders software docs", () => {
    const { container } = render(<SoftwareDocsPanel />);
    expect(container.querySelector("iframe")?.getAttribute("src"))
      .toEqual(ExternalUrl.softwareDocs);
  });

  it("navigates to specific doc page", () => {
    location.search = "?page=farmware";
    const { container } = render(<SoftwareDocsPanel />);
    expect(container.querySelector("iframe")?.getAttribute("src"))
      .toEqual(ExternalUrl.softwareDocs + "/farmware");
  });
});
