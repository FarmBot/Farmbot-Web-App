import React from "react";
import { render } from "@testing-library/react";
import {
  DocumentationPanel,
  DocumentationPanelProps,
} from "../documentation";

describe("<DocumentationPanel />", () => {
  const fakeProps = (): DocumentationPanelProps => ({
    url: "fake url",
  });

  it("renders iframe", () => {
    const { container } = render(<DocumentationPanel {...fakeProps()} />);
    const iframe = container.querySelector("iframe");
    expect(iframe?.getAttribute("src")).toContain("fake url");
  });
});
