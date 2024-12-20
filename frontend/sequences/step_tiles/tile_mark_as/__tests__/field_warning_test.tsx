import React from "react";
import { mount } from "enzyme";
import { CustomFieldWarning } from "../field_warning";
import { CustomFieldWarningProps } from "../interfaces";

describe("<CustomFieldWarning />", () => {
  const fakeProps = (): CustomFieldWarningProps => ({
    resource: { kind: "nothing", args: {} },
    field: "",
    update: jest.fn(),
  });

  it("doesn't display warning", () => {
    const p = fakeProps();
    p.field = "";
    const wrapper = mount(<CustomFieldWarning {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("invalid property");
  });

  it("displays warning", () => {
    const p = fakeProps();
    p.field = "nope";
    const wrapper = mount(<CustomFieldWarning {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("invalid property");
    expect(wrapper.text().toLowerCase()).toContain("meta");
    wrapper.find(".did-you-mean").simulate("click");
    expect(p.update).toHaveBeenCalledWith({ field: "meta.nope" });
  });

  it("displays warning: Device resource", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource", args: { resource_type: "Device", resource_id: 1 }
    };
    p.field = "x";
    const wrapper = mount(<CustomFieldWarning {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("invalid property");
    expect(wrapper.text().toLowerCase()).not.toContain("meta");
  });

  it("displays warning: GenericPointer resource", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource", args: { resource_type: "GenericPointer", resource_id: 1 }
    };
    p.field = "openfarm_slug";
    const wrapper = mount(<CustomFieldWarning {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("invalid property");
    expect(wrapper.text().toLowerCase()).toContain("meta");
  });

  it("doesn't display warning: Plant resource", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource", args: { resource_type: "Plant", resource_id: 1 }
    };
    p.field = "openfarm_slug";
    const wrapper = mount(<CustomFieldWarning {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("invalid property");
    expect(wrapper.text().toLowerCase()).not.toContain("meta");
  });

  it("displays warning: Weed resource", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource", args: { resource_type: "Weed", resource_id: 1 }
    };
    p.field = "openfarm_slug";
    const wrapper = mount(<CustomFieldWarning {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("invalid property");
    expect(wrapper.text().toLowerCase()).toContain("meta");
  });

  it("displays warning: identifier", () => {
    const p = fakeProps();
    p.resource = { kind: "identifier", args: { label: "var" } };
    p.field = "mounted_tool_id";
    const wrapper = mount(<CustomFieldWarning {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("invalid property");
    expect(wrapper.text().toLowerCase()).toContain("meta");
  });
});
