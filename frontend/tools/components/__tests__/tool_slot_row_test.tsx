jest.mock("../../../api/crud", () => ({ destroy: jest.fn() }));

import * as React from "react";
import { ToolSlotRowProps, ToolSlotRow } from "../tool_slot_row";
import { mount } from "enzyme";
import { destroy } from "../../../api/crud";
import { fakeToolSlot } from "../../../__test_support__/fake_state/resources";

describe("<ToolSlotRow />", () => {
  const fakeProps = (): ToolSlotRowProps => ({
    dispatch: jest.fn(),
    slot: fakeToolSlot(),
    botPosition: { x: undefined, y: undefined, z: undefined },
    toolOptions: [],
    chosenToolOption: { label: "", value: "" },
    onToolSlotChange: jest.fn(),
  });

  it("deletes slot", () => {
    const p = fakeProps();
    const wrapper = mount(<ToolSlotRow {...p} />);
    wrapper.find("button").last().simulate("click");
    expect(destroy).toHaveBeenCalledWith(p.slot.uuid);
  });
});
