import * as React from "react";
import { mount, shallow } from "enzyme";
import { RawTools as Tools } from "../index";
import { Props } from "../interfaces";
import {
  fakeToolSlot, fakeTool
} from "../../__test_support__/fake_state/resources";

describe("<Tools />", () => {
  const fakeProps = (): Props => ({
    toolSlots: [],
    tools: [fakeTool()],
    getToolSlots: () => [fakeToolSlot()],
    getToolOptions: () => [],
    getChosenToolOption: () => ({ label: "None", value: "" }),
    getToolByToolSlotUUID: fakeTool,
    changeToolSlot: jest.fn(),
    isActive: () => true,
    dispatch: jest.fn(),
    botPosition: { x: undefined, y: undefined, z: undefined }
  });

  it("renders", () => {
    const wrapper = mount(<Tools {...fakeProps()} />);
    const txt = wrapper.text();
    const strings = [
      "Tool Slots",
      "SlotXYZ",
      "Tool or Seed Container",
      "Tools",
      "NameStatus",
      "Fooactive"];
    strings.map(string => expect(txt).toContain(string));
  });

  it("shows forms", () => {
    const wrapper = shallow(<Tools {...fakeProps()} />);
    expect(wrapper.find("ToolList").length).toEqual(1);
    expect(wrapper.find("ToolBayList").length).toEqual(1);
    expect(wrapper.find("ToolForm").length).toEqual(0);
    expect(wrapper.find("ToolBayForm").length).toEqual(0);
    wrapper.setState({ editingBays: true, editingTools: true });
    expect(wrapper.find("ToolList").length).toEqual(0);
    expect(wrapper.find("ToolBayList").length).toEqual(0);
    expect(wrapper.find("ToolForm").length).toEqual(1);
    expect(wrapper.find("ToolBayForm").length).toEqual(1);
  });
});
