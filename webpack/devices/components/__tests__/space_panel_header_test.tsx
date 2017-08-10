import * as React from "react";
import { render } from "enzyme";
import { SpacePanelHeader } from "../hardware_settings/space_panel_header";

describe("<SpacePanelHeader/>", () => {
  it("has children", () => {
    let result = render(<SpacePanelHeader />);
    let txt = result.text();
    ["X", "Y", "Z"].map(function (axis) {
      expect(txt).toContain(`${axis} AXIS`);
    });
  });
});
