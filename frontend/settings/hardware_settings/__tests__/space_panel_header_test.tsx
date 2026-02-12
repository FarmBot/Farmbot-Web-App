import React from "react";
import { render } from "@testing-library/react";
import { SpacePanelHeader } from "../space_panel_header";

describe("<SpacePanelHeader/>", () => {
  it("has children", () => {
    const result = render(<SpacePanelHeader />);
    const txt = result.container.textContent || "";
    ["X", "Y", "Z"].map(function (axis) {
      expect(txt).toContain(`${axis} AXIS`);
    });
  });
});
