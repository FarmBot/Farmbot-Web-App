const mockHistory = jest.fn();
jest.mock("../../../../history", () => ({
  history: {
    push: mockHistory,
    getCurrentLocation: jest.fn()
      .mockImplementationOnce(() => {
        return { pathname: "/app/designer/plants/1" }
      })
      .mockImplementationOnce(() => {
        return { pathname: "/app/designer/plants" }
      })
  }
}));

import * as React from "react";
import { ToolSlotLayer, ToolSlotLayerProps } from "../tool_slot_layer";
import { fakeResource } from "../../../../__test_support__/fake_resource";
import { ToolSlotPointer } from "../../../../interfaces";
import { shallow } from "enzyme";

describe("<ToolSlotLayer/>", () => {
  function fakeProps(): ToolSlotLayerProps {
    const ts: ToolSlotPointer = {
      pointer_type: "ToolSlot",
      tool_id: undefined,
      name: "Name",
      radius: 50,
      x: 1,
      y: 2,
      z: 3,
      meta: {}
    };
    const toolSlot = fakeResource("points", ts);
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
    const p = fakeProps();
    const wrapper = shallow(<ToolSlotLayer {...p } />);
    const tools = wrapper.find("g").first();
    await tools.simulate("click") // not on main map page
    expect(mockHistory).not.toHaveBeenCalled();
    expect(p.dispatch).not.toHaveBeenCalled();
    await tools.simulate("click") // on main map page
    expect(mockHistory).toHaveBeenCalledWith("/app/tools");
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: undefined, type: "SELECT_PLANT"
    });
  });

});
