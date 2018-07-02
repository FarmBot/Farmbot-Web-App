import * as React from "react";
import { ToolBayHeader } from "../toolbay_header";
import { mount } from "enzyme";

describe("<ToolBayHeader />", () => {
  it("renders", () => {
    const header = mount<{}>(<ToolBayHeader />);
    expect(header.text()).toEqual("SlotXYZTool");
  });
});
