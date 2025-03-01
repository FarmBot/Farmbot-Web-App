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

jest.mock("../watering_animations", () => ({
  WateringAnimations: jest.fn(),
}));

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { INITIAL } from "../../../config";
import { clone } from "lodash";
import { Tools, ToolsProps } from "../tools";
import {
  fakeTool, fakeToolSlot,
} from "../../../../__test_support__/fake_state/resources";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { WateringAnimations } from "../watering_animations";
import { Path } from "../../../../internal_urls";
import { Actions } from "../../../../constants";
import { mockDispatch } from "../../../../__test_support__/fake_dispatch";

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
    const tool5 = fakeTool();
    tool5.body.id = 6;
    tool5.body.name = "seed trough 1";
    const tool6 = fakeTool();
    tool6.body.id = 7;
    tool6.body.name = "seed trough 2";
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
    const toolSlot5 = fakeToolSlot();
    toolSlot5.body.tool_id = tool5.body.id;
    const toolSlot6 = fakeToolSlot();
    toolSlot6.body.tool_id = tool6.body.id;
    p.toolSlots = [
      { toolSlot: toolSlot0, tool: tool0 },
      { toolSlot: toolSlot1, tool: tool1 },
      { toolSlot: toolSlot2, tool: tool2 },
      { toolSlot: toolSlot3, tool: tool3 },
      { toolSlot: toolSlot4, tool: undefined },
      { toolSlot: toolSlot5, tool: tool5 },
      { toolSlot: toolSlot6, tool: tool6 },
    ];
    p.mountedToolName = "weeder";
    const { container } = render(<Tools {...p} />);
    expect(container).not.toContainHTML("toolbay3");
  });

  it("renders watering animations when not in toolbay and water flowing", () => {
    const p = fakeProps();
    p.config.waterFlow = true;
    const tool = fakeTool();
    tool.body.name = "watering nozzle";
    p.toolSlots = [];
    p.mountedToolName = "watering nozzle";
    render(<Tools {...p} />);
    expect(WateringAnimations).toHaveBeenCalled();
  });

  it("doesn't render watering animations when water not flowing", () => {
    const p = fakeProps();
    p.config.waterFlow = false;
    const tool = fakeTool();
    tool.body.name = "watering nozzle";
    p.toolSlots = [];
    p.mountedToolName = "watering nozzle";
    render(<Tools {...p} />);
    expect(WateringAnimations).not.toHaveBeenCalled();
  });

  it("doesn't render watering animations when in toolbay", () => {
    const p = fakeProps();
    p.config.waterFlow = true;
    const tool = fakeTool();
    tool.body.name = "watering nozzle";
    const toolSlot = fakeToolSlot();
    toolSlot.body.tool_id = tool.body.id;
    p.toolSlots = [{ toolSlot, tool }];
    render(<Tools {...p} />);
    expect(WateringAnimations).not.toHaveBeenCalled();
  });

  it("navigates to tool info", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const tool = fakeTool();
    tool.body.name = "soil sensor";
    tool.body.id = 2;
    const toolSlot = fakeToolSlot();
    toolSlot.body.id = 1;
    toolSlot.body.tool_id = tool.body.id;
    p.toolSlots = [{ toolSlot, tool }];
    const { container } = render(<Tools {...p} />);
    const slot = container.querySelector("[name='slot'");
    slot && fireEvent.click(slot);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: true,
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.toolSlots("1"));
  });

  it("doesn't navigate to tool info", () => {
    const p = fakeProps();
    p.dispatch = undefined;
    const tool = fakeTool();
    tool.body.name = "soil sensor";
    tool.body.id = 2;
    const toolSlot = fakeToolSlot();
    toolSlot.body.id = 1;
    toolSlot.body.tool_id = tool.body.id;
    p.toolSlots = [{ toolSlot, tool }];
    const { container } = render(<Tools {...p} />);
    const slot = container.querySelector("[name='slot'");
    slot && fireEvent.click(slot);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
