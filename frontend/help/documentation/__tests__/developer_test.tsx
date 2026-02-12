import React from "react";
import { render } from "@testing-library/react";
import { DeveloperDocsPanel } from "../developer";
import { ExternalUrl } from "../../../external_urls";

describe("<DeveloperDocsPanel />", () => {
  it("renders developer docs", () => {
    location.search = "";
    const { container } = render(<DeveloperDocsPanel />);
    expect(container.querySelector("iframe")?.getAttribute("src"))
      .toEqual(ExternalUrl.developerDocs);
  });
});
