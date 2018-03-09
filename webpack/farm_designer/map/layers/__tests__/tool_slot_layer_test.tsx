const mockHistory = jest.fn();
let mockPath = "/app/designer/plants";
jest.mock("../../../../history", () => ({
  history: {
    push: mockHistory
  },
  getPathArray: jest.fn(() => { return mockPath.split("/"); })
}));

import * as React from "react";
import { ToolSlotLayer, ToolSlotLayerProps } from "../tool_slot_layer";
import { fakeResource } from "../../../../__test_support__/fake_resource";
import { ToolSlotPointer } from "../../../../interfaces";
import { shallow } from "enzyme";

describe("<ToolSlotLayer/>", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  function fakeProps(): ToolSlotLayerProps {
    const ts: ToolSlotPointer = {
      pointer_type: "ToolSlot",
      tool_id: undefined,
      name: "Name",
      radius: 50,
      x: 1,
      y: 2,
      z: 3,
      meta: {},
      pullout_direction: 0
    };
    const toolSlot = fakeResource("Point", ts);
    return {
      visible: false,
      slots: [{ toolSlot, tool: undefined }],
      mapTransformProps: {
        quadrant: 1, gridSize: { x: 3000, y: 1500 }
      },
      dispatch: jest.fn()
    };
  }
  it("toggles visibility off", () => {
    const result = shallow(<ToolSlotLayer {...fakeProps() } />);
    expect(result.find("ToolSlotPoint").length).toEqual(0);
  });

  it("toggles visibility on", () => {
    const p = fakeProps();
    p.visible = true;
    const result = shallow(<ToolSlotLayer {...p } />);
    expect(result.find("ToolSlotPoint").length).toEqual(1);
  });

  it("navigates to tools page", async () => {
    mockPath = "/app/designer/plants";
    const p = fakeProps();
    const wrapper = shallow(<ToolSlotLayer {...p } />);
    const tools = wrapper.find("g").first();
    await tools.simulate("click");
    expect(mockHistory).toHaveBeenCalledWith("/app/tools");
  });

  it("doesn't navigate to tools page", async () => {
    mockPath = "/app/designer/plants/1";
    const p = fakeProps();
    const wrapper = shallow(<ToolSlotLayer {...p } />);
    const tools = wrapper.find("g").first();
    await tools.simulate("click");
    expect(mockHistory).not.toHaveBeenCalled();
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("is in non-clickable mode", () => {
    mockPath = "/app/designer/plants/select";
    const p = fakeProps();
    const wrapper = shallow(<ToolSlotLayer {...p } />);
    expect(wrapper.find("g").props().style)
      .toEqual({ pointerEvents: "none" });
  });
});
