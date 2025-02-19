import React from "react";
import { render } from "@testing-library/react";
import { INITIAL } from "../../../config";
import { clone } from "lodash";
import { Tools, ToolsProps } from "../tools";
import {
  fakeTool, fakeToolSlot,
} from "../../../../__test_support__/fake_state/resources";

describe("<Tools />", () => {
  const fakeProps = (): ToolsProps => ({
    config: clone(INITIAL),
  });

  it("renders promo tools", () => {
    const { container } = render(<Tools {...fakeProps()} />);
    expect(container).toContainHTML("toolbay3");
  });

  it("renders user tools", () => {
    const p = fakeProps();
    const tool0 = fakeTool();
    tool0.body.id = 1;
    tool0.body.name = "soil sensor";
    const tool1 = fakeTool();
    tool1.body.id = 2;
    tool1.body.name = undefined;
    const toolSlot0 = fakeToolSlot();
    toolSlot0.body.tool_id = tool0.body.id;
    const toolSlot1 = fakeToolSlot();
    toolSlot1.body.tool_id = tool1.body.id;
    const toolSlot2 = fakeToolSlot();
    toolSlot2.body.tool_id = undefined;
    p.toolSlots = [
      { toolSlot: toolSlot0, tool: tool0 },
      { toolSlot: toolSlot1, tool: tool1 },
      { toolSlot: toolSlot2, tool: undefined },
    ];
    const { container } = render(<Tools {...p} />);
    expect(container).not.toContainHTML("toolbay3");
  });
});
