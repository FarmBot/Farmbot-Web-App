import React from "react";
import { mount, shallow } from "enzyme";
import {
  FieldSelection, isCustomMetaField, UPDATE_RESOURCE_DDIS,
} from "../field_selection";
import { FieldSelectionProps } from "../interfaces";
import {
  buildResourceIndex,
} from "../../../../__test_support__/resource_index_builder";
import { changeBlurableInput } from "../../../../__test_support__/helpers";

const DDI = UPDATE_RESOURCE_DDIS();

describe("<FieldSelection />", () => {
  const fakeProps = (): FieldSelectionProps => ({
    resource: { kind: "nothing", args: {} },
    field: undefined,
    resources: buildResourceIndex().index,
    update: jest.fn(),
  });

  it("renders disabled none field", () => {
    const p = fakeProps();
    p.field = undefined;
    const wrapper = mount(<FieldSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(1);
    expect(wrapper.find("FBSelect").props().list).toEqual([]);
    expect(wrapper.text()).toContain("property");
    expect(wrapper.text()).toContain("Select one");
    expect(wrapper.find(".reset-custom-field").length).toEqual(0);
  });

  it("renders none field", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "Plant", resource_id: 1 }
    };
    p.field = undefined;
    const wrapper = mount(<FieldSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(1);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      DDI.PLANT_STAGE,
      DDI.X,
      DDI.Y,
      DDI.Z,
      DDI.RADIUS,
      DDI.CUSTOM_META_FIELD,
    ]);
    expect(wrapper.text()).toContain("property");
    expect(wrapper.text()).toContain("Select one");
    expect(wrapper.find(".reset-custom-field").length).toEqual(0);
  });

  it("renders custom meta field", () => {
    const p = fakeProps();
    p.field = "custom";
    const wrapper = mount(<FieldSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(0);
    expect(wrapper.text()).toContain("property");
    expect(wrapper.find("input").props().value).toEqual("custom");
    expect(wrapper.find(".reset-custom-field").length).toEqual(1);
  });

  it("changes custom meta field", () => {
    const p = fakeProps();
    p.field = "custom_field";
    const wrapper = mount(<FieldSelection {...p} />);
    changeBlurableInput(wrapper, "1");
    expect(p.update).toHaveBeenCalledWith({ field: "1" });
  });

  it("clears custom meta field", () => {
    const p = fakeProps();
    p.field = "custom_field";
    const wrapper = mount(<FieldSelection {...p} />);
    wrapper.find(".reset-custom-field").simulate("click");
    expect(p.update).toHaveBeenCalledWith({
      field: undefined, value: undefined
    });
  });

  it("renders field list for identifier", () => {
    const p = fakeProps();
    p.resource = { kind: "identifier", args: { label: "var" } };
    p.field = "plant_stage";
    const wrapper = mount(<FieldSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(1);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      DDI.STATUS,
      DDI.COLOR,
      DDI.X,
      DDI.Y,
      DDI.Z,
      DDI.RADIUS,
      DDI.CUSTOM_META_FIELD,
    ]);
    expect(wrapper.text()).toContain("property");
    expect(wrapper.text()).toContain("Status");
    expect(wrapper.find(".reset-custom-field").length).toEqual(0);
  });

  it.each<[string, string]>([
    ["plant_stage", "Weed status"],
    ["meta.color", "Color"],
    ["x", "X"],
    ["y", "Y"],
    ["z", "Z"],
    ["radius", "Radius"],
  ])("renders known weed field: %s", (field, expected) => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "Weed", resource_id: 1 }
    };
    p.field = field;
    const wrapper = mount(<FieldSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(1);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      DDI.WEED_STATUS,
      DDI.COLOR,
      DDI.X,
      DDI.Y,
      DDI.Z,
      DDI.RADIUS,
      DDI.CUSTOM_META_FIELD,
    ]);
    expect(wrapper.text()).toContain("property");
    expect(wrapper.text()).toContain(expected);
    expect(wrapper.find(".reset-custom-field").length).toEqual(0);
  });

  it("renders known point field", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "GenericPointer", resource_id: 3 }
    };
    p.field = "plant_stage";
    const wrapper = mount(<FieldSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(1);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      DDI.COLOR,
      DDI.X,
      DDI.Y,
      DDI.Z,
      DDI.RADIUS,
      DDI.CUSTOM_META_FIELD,
    ]);
    expect(wrapper.text()).toContain("property");
    expect(wrapper.text()).toContain("Point status");
    expect(wrapper.find(".reset-custom-field").length).toEqual(0);
  });

  it("renders known plant field", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "Plant", resource_id: 3 }
    };
    p.field = "planted_at";
    const wrapper = mount(<FieldSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(1);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      DDI.PLANT_STAGE,
      DDI.X,
      DDI.Y,
      DDI.Z,
      DDI.RADIUS,
      DDI.CUSTOM_META_FIELD,
    ]);
    expect(wrapper.text()).toContain("property");
    expect(wrapper.text()).toContain("Date Planted");
    expect(wrapper.find(".reset-custom-field").length).toEqual(0);
  });

  it("changes known weed field", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "Weed", resource_id: 1 }
    };
    p.field = undefined;
    const wrapper = mount(<FieldSelection {...p} />);
    const select = shallow(<div>{wrapper.find("FBSelect").getElement()}</div>);
    select.find("FBSelect").simulate("change", {
      label: "", value: "plant_stage"
    });
    expect(p.update).toHaveBeenCalledWith({ field: "plant_stage" });
  });

  it("renders known device field", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "Device", resource_id: 1 }
    };
    p.field = "mounted_tool_id";
    const wrapper = mount(<FieldSelection {...p} />);
    expect(wrapper.find("FBSelect").length).toEqual(1);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      DDI.MOUNTED_TOOL,
      DDI.CUSTOM_META_FIELD,
    ]);
    expect(wrapper.text()).toContain("property");
    expect(wrapper.text()).toContain("Mounted Tool");
    expect(wrapper.find(".reset-custom-field").length).toEqual(0);
  });
});

describe("isCustomMetaField()", () => {
  it("is custom meta field", () => {
    expect(isCustomMetaField("")).toBeTruthy();
    expect(isCustomMetaField("custom")).toBeTruthy();
  });

  it("is not custom meta field", () => {
    expect(isCustomMetaField(undefined)).toBeFalsy();
    expect(isCustomMetaField("plant_stage")).toBeFalsy();
    expect(isCustomMetaField("mounted_tool_id")).toBeFalsy();
    expect(isCustomMetaField("x")).toBeFalsy();
    expect(isCustomMetaField("y")).toBeFalsy();
    expect(isCustomMetaField("z")).toBeFalsy();
    expect(isCustomMetaField("radius")).toBeFalsy();
    expect(isCustomMetaField("meta.color")).toBeFalsy();
  });
});
