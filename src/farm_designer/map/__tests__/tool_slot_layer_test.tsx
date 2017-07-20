import * as React from "react";
import { ToolSlotLayer, ToolSlotLayerProps } from "../layers/tool_slot_layer";
import { fakeResource } from "../../../__test_support__/fake_resource";
import { ToolSlotPointer } from "../../../interfaces";
import { shallow } from "enzyme";

describe("<ToolSlotLayer/>", () => {
  function fakeProps(): ToolSlotLayerProps {
    let ts: ToolSlotPointer = {
      pointer_type: "ToolSlot",
      tool_id: undefined,
      name: "Name",
      radius: 50,
      x: 1,
      y: 2,
      z: 3,
      meta: {}
    };
    let toolSlot = fakeResource("points", ts);
    return {
      visible: false,
      slots: [{ toolSlot, tool: undefined }],
      botOriginQuadrant: 1
    };
  }
  it("toggles visibility off", () => {
    let result = shallow(<ToolSlotLayer {...fakeProps() } />);
    expect(result.find("ToolSlotPoint").length).toEqual(0);
  });

  it("toggles visibility off", () => {
    let p = fakeProps();
    p.visible = true;
    let result = shallow(<ToolSlotLayer {...p } />);
    expect(result.find("ToolSlotPoint").length).toEqual(1);
  });
});
