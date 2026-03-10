import React from "react";
import { render } from "@testing-library/react";
import { MetaDocsPanel } from "../meta";
import { ExternalUrl } from "../../../external_urls";

describe("<MetaDocsPanel />", () => {
  it("renders meta docs", () => {
    location.search = "";
    const { container } = render(<MetaDocsPanel />);
    expect(container.querySelector("iframe")?.getAttribute("src"))
      .toEqual(ExternalUrl.metaDocs);
  });
});
