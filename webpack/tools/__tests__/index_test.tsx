jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

import * as React from "react";
import { mount } from "enzyme";
import { Tools } from "../index";
import { Props } from "../interfaces";
import { fakeToolSlot, fakeTool } from "../../__test_support__/fake_state/resources";

describe("<Tools />", () => {
  function fakeProps(): Props {
    return {
      toolSlots: [],
      tools: [fakeTool()],
      getToolSlots: () => [fakeToolSlot()],
      getToolOptions: () => [],
      getChosenToolOption: () => { return { label: "None", value: "" }; },
      getToolByToolSlotUUID: () => fakeTool(),
      changeToolSlot: jest.fn(),
      isActive: () => true,
      dispatch: jest.fn(),
      botPosition: { x: undefined, y: undefined, z: undefined }
    };
  }

  it("renders", () => {
    const wrapper = mount(<Tools {...fakeProps()} />);
    const txt = wrapper.text();
    const strings = [
      "ToolBay 1",
      "SlotXYZ",
      "Tool1000Foo",
      "Tools",
      "Tool NameStatus",
      "Fooactive"];
    strings.map(string => expect(txt).toContain(string));
  });
});
