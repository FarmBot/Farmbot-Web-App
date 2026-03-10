import React from "react";
import { render } from "@testing-library/react";
import { GenesisDocsPanel } from "../genesis";
import { ExternalUrl } from "../../../external_urls";

describe("<GenesisDocsPanel />", () => {
  it("renders genesis docs", () => {
    location.search = "";
    const { container } = render(<GenesisDocsPanel />);
    expect(container.querySelector("iframe")?.getAttribute("src"))
      .toEqual(ExternalUrl.genesisDocs);
  });
});
