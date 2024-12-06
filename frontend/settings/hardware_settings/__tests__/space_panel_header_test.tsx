import React from "react";
import { render } from "enzyme";
import { SpacePanelHeader } from "../space_panel_header";

describe("<SpacePanelHeader/>", () => {
  it("has children", () => {
    const result = render(<SpacePanelHeader />);
    const txt = result.text();
    ["X", "Y", "Z"].map(function (axis) {
      expect(txt).toContain(`${axis} AXIS`);
    });
  });
});
