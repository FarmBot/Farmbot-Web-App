import React from "react";
import { render } from "@testing-library/react";
import { EducationDocsPanel } from "../education";
import { ExternalUrl } from "../../../external_urls";

describe("<EducationDocsPanel />", () => {
  it("renders education docs", () => {
    location.search = "";
    const { container } = render(<EducationDocsPanel />);
    expect(container.querySelector("iframe")?.getAttribute("src"))
      .toEqual(ExternalUrl.eduDocs);
  });
});
