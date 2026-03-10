import React from "react";
import { render } from "@testing-library/react";
import { ExpressDocsPanel } from "../express";
import { ExternalUrl } from "../../../external_urls";

describe("<ExpressDocsPanel />", () => {
  it("renders express docs", () => {
    location.search = "";
    const { container } = render(<ExpressDocsPanel />);
    expect(container.querySelector("iframe")?.getAttribute("src"))
      .toEqual(ExternalUrl.expressDocs);
  });
});
