let mockDev = false;
jest.mock("../../../../settings/dev/dev_support", () => ({
  DevSettings: { futureFeaturesEnabled: () => mockDev }
}));

import React from "react";
import { mount, shallow } from "enzyme";
import { ValueSelection } from "../value_selection";
import { ValueSelectionProps } from "../interfaces";
import {
  buildResourceIndex,
} from "../../../../__test_support__/resource_index_builder";
import {
  PLANT_STAGE_LIST, ALL_STAGE_LIST,
} from "../../../../plants/edit_plant_status";
import { fakeTool } from "../../../../__test_support__/fake_state/resources";
import { resource_type, Resource } from "farmbot";
import { UPDATE_RESOURCE_DDIS } from "../field_selection";
import { changeBlurableInput } from "../../../../__test_support__/helpers";

const DDI = UPDATE_RESOURCE_DDIS();

describe("<ValueSelection />", () => {
  const fakeProps = (): ValueSelectionProps => ({
    resource: { kind: "nothing", args: {} },
    field: undefined,
    value: undefined,
    resources: buildResourceIndex().index,
    update: jest.fn(),
    add: jest.fn(),
    commitSelection: jest.fn(),
  });

  it("renders none value", () => {
    const p = fakeProps();
    p.field = undefined;
    const wrapper = mount(<ValueSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(1);
    expect(wrapper.text()).toContain("as");
    expect(wrapper.text()).toContain("Select one");
  });

  it("renders custom meta value", () => {
    const p = fakeProps();
    p.field = "custom_field";
    p.value = "custom_value";
    const wrapper = mount(<ValueSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(0);
    expect(wrapper.text()).toContain("as");
    expect(wrapper.find("input").props().value).toEqual("custom_value");
  });

  it("renders missing custom meta value", () => {
    const p = fakeProps();
    p.field = "custom_field";
    p.value = undefined;
    const wrapper = mount(<ValueSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(0);
    expect(wrapper.text()).toContain("as");
    expect(wrapper.find("input").props().value).toEqual("");
  });

  it("changes custom meta value", () => {
    const p = fakeProps();
    p.field = "custom_field";
    p.value = "custom_value";
    const wrapper = mount(<ValueSelection {...p} />);
    changeBlurableInput(wrapper, "1");
    expect(p.update).toHaveBeenCalledWith({ value: "1" },
      expect.any(Function));
  });

  it("adds row", () => {
    const p = fakeProps();
    const wrapper = mount(<ValueSelection {...p} />);
    wrapper.find("label").simulate("click");
    expect(p.add).not.toHaveBeenCalled();
    mockDev = true;
    wrapper.find("label").simulate("click");
    expect(p.add).toHaveBeenCalledWith({});
  });

  it("renders known plant value", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "Plant", resource_id: 1 }
    };
    p.field = "plant_stage";
    p.value = "planted";
    const wrapper = mount(<ValueSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(1);
    expect(wrapper.find("FBSelect").props().list).toEqual(PLANT_STAGE_LIST());
    expect(wrapper.text()).toContain("as");
    expect(wrapper.text()).toContain("Planted");
  });

  it("renders plant value", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "Plant", resource_id: 1 }
    };
    p.field = "plant_stage";
    p.value = "other";
    const wrapper = mount(<ValueSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(1);
    expect(wrapper.find("FBSelect").props().list).toEqual(PLANT_STAGE_LIST());
    expect(wrapper.text()).toContain("as");
    expect(wrapper.text()).toContain("other");
  });

  it("renders plant value: date planted", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "Plant", resource_id: 1 }
    };
    p.field = "planted_at";
    p.value = "{{ timeNow }}";
    const wrapper = mount(<ValueSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(1);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      DDI.NOW,
    ]);
    expect(wrapper.text()).toContain("as");
    expect(wrapper.text()).toContain("Now");
  });

  it("renders known weed value", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "Weed", resource_id: 1 }
    };
    p.field = "plant_stage";
    p.value = "removed";
    const wrapper = mount(<ValueSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(1);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      DDI.PENDING,
      DDI.ACTIVE,
      DDI.REMOVED,
    ]);
    expect(wrapper.text()).toContain("as");
    expect(wrapper.text()).toContain("Removed");
  });

  it("changes known weed value", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "Weed", resource_id: 1 }
    };
    p.field = "plant_stage";
    p.value = undefined;
    const wrapper = mount(<ValueSelection {...p} />);
    const select = shallow(<div>{wrapper.find("FBSelect").getElement()}</div>);
    select.find("FBSelect").simulate("change", {
      label: "", value: "removed"
    });
    expect(p.update).toHaveBeenCalledWith({ value: "removed" },
      expect.any(Function));
  });

  it("renders known point value", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "GenericPointer", resource_id: 1 }
    };
    p.field = "plant_stage";
    p.value = "removed";
    const wrapper = mount(<ValueSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(1);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      DDI.PENDING,
      DDI.ACTIVE,
      DDI.REMOVED,
    ]);
    expect(wrapper.text()).toContain("as");
    expect(wrapper.text()).toContain("Removed");
  });

  it("renders known uncontrolled point value", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "GenericPointer", resource_id: 1 }
    };
    p.field = "x";
    p.value = "123";
    const wrapper = mount(<ValueSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(0);
    expect(wrapper.text()).toContain("as");
    expect(wrapper.find("input").props().value).toEqual("123");
  });

  it("renders other value", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "Other" as resource_type, resource_id: 1 }
    };
    p.field = "plant_stage";
    p.value = "removed";
    const wrapper = mount(<ValueSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(1);
    expect(wrapper.find("FBSelect").props().list).toEqual(ALL_STAGE_LIST());
    expect(wrapper.text()).toContain("as");
    expect(wrapper.text()).toContain("Removed");
  });

  const TOOL_OPTIONS = [
    { label: "None", value: 0 },
    { label: "Trench Digging Tool", value: 14 },
    { label: "Berry Picking Tool", value: 15 },
  ];

  const DeviceResource: Resource = {
    kind: "resource",
    args: { resource_type: "Device", resource_id: 1 }
  };

  it("renders known tool value: not mounted", () => {
    const p = fakeProps();
    p.resource = DeviceResource;
    p.field = "mounted_tool_id";
    p.value = 0;
    const wrapper = mount(<ValueSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(1);
    expect(wrapper.find("FBSelect").props().list).toEqual(TOOL_OPTIONS);
    expect(wrapper.text()).toContain("as");
    expect(wrapper.text()).toContain("None");
  });

  it("renders known tool value: mounted", () => {
    const p = fakeProps();
    p.resource = DeviceResource;
    p.field = "mounted_tool_id";
    p.value = 14;
    const wrapper = mount(<ValueSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(1);
    expect(wrapper.find("FBSelect").props().list).toEqual(TOOL_OPTIONS);
    expect(wrapper.text()).toContain("as");
    expect(wrapper.text()).toContain("Trench Digging Tool");
  });

  it("renders known tool value: unknown tool", () => {
    const p = fakeProps();
    p.resource = DeviceResource;
    p.field = "mounted_tool_id";
    p.value = 123;
    const wrapper = mount(<ValueSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(1);
    expect(wrapper.find("FBSelect").props().list).toEqual(TOOL_OPTIONS);
    expect(wrapper.text()).toContain("as");
    expect(wrapper.text()).toContain("Unknown tool");
  });

  it("renders known tool value: untitled tool", () => {
    const p = fakeProps();
    p.resource = DeviceResource;
    p.field = "mounted_tool_id";
    p.value = 1;
    const tool = fakeTool();
    tool.body.id = 1;
    tool.body.name = undefined;
    p.resources = buildResourceIndex([tool]).index;
    const wrapper = mount(<ValueSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(1);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      { label: "None", value: 0 },
      { label: "Untitled tool", value: 1 },
    ]);
    expect(wrapper.text()).toContain("as");
    expect(wrapper.text()).toContain("Untitled tool");
  });

  it("renders known identifier value", () => {
    const p = fakeProps();
    p.resource = {
      kind: "identifier", args: { label: "var" }
    };
    p.field = "plant_stage";
    p.value = "planted";
    const wrapper = mount(<ValueSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(1);
    expect(wrapper.find("FBSelect").props().list).toEqual(ALL_STAGE_LIST());
    expect(wrapper.text()).toContain("as");
    expect(wrapper.text()).toContain("Planted");
  });
});
