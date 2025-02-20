import * as THREE from "three";

jest.mock("react", () => {
  const originReact = jest.requireActual("react");
  const mockRef = jest.fn(() => ({
    current: {
      traverse: (cb: (m: {}) => void) => {
        const mesh = {
          material: {
            clone: () => ({
              transparent: false,
              opacity: 1,
              needsUpdate: false,
            }),
          }
        };
        Object.setPrototypeOf(mesh, THREE.Mesh.prototype);
        cb(mesh);
      },
    },
  }));
  return {
    ...originReact,
    useRef: mockRef,
  };
});

import React from "react";
import { render } from "@testing-library/react";
import { INITIAL } from "../../../config";
import { clone } from "lodash";
import { Tools, ToolsProps } from "../tools";
import {
  fakeTool, fakeToolSlot,
} from "../../../../__test_support__/fake_state/resources";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";

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
    const tool2 = fakeTool();
    tool2.body.id = 3;
    tool2.body.name = "weeder";
    const tool3 = fakeTool();
    tool3.body.id = 4;
    tool3.body.name = "seeder";
    const toolSlot0 = fakeToolSlot();
    toolSlot0.body.tool_id = tool0.body.id;
    toolSlot0.body.pullout_direction = ToolPulloutDirection.NONE;
    const toolSlot1 = fakeToolSlot();
    toolSlot1.body.tool_id = tool1.body.id;
    toolSlot1.body.pullout_direction = ToolPulloutDirection.POSITIVE_X;
    const toolSlot2 = fakeToolSlot();
    toolSlot2.body.tool_id = tool2.body.id;
    toolSlot2.body.pullout_direction = ToolPulloutDirection.POSITIVE_Y;
    const toolSlot3 = fakeToolSlot();
    toolSlot3.body.tool_id = tool3.body.id;
    toolSlot3.body.pullout_direction = ToolPulloutDirection.NEGATIVE_X;
    const toolSlot4 = fakeToolSlot();
    toolSlot4.body.tool_id = undefined;
    toolSlot4.body.pullout_direction = ToolPulloutDirection.NEGATIVE_Y;
    p.toolSlots = [
      { toolSlot: toolSlot0, tool: tool0 },
      { toolSlot: toolSlot1, tool: tool1 },
      { toolSlot: toolSlot2, tool: tool2 },
      { toolSlot: toolSlot3, tool: tool3 },
      { toolSlot: toolSlot4, tool: undefined },
    ];
    p.mountedToolName = "weeder";
    const { container } = render(<Tools {...p} />);
    expect(container).not.toContainHTML("toolbay3");
  });
});
