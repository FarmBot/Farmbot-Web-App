import React from "react";
import { fireEvent, render } from "@testing-library/react";
import {
  FieldSelection, isCustomMetaField, UPDATE_RESOURCE_DDIS,
} from "../field_selection";
import { FieldSelectionProps } from "../interfaces";
import {
  buildResourceIndex,
} from "../../../../__test_support__/resource_index_builder";
import { changeBlurableInput } from "../../../../__test_support__/helpers";

const DDI = UPDATE_RESOURCE_DDIS();
type SelectLike = React.ReactElement<{
  list: unknown[];
  selectedItem: { label: string };
  onChange: (item: { label: string; value: string }) => void;
}>;

describe("<FieldSelection />", () => {
  const fakeProps = (): FieldSelectionProps => ({
    resource: { kind: "nothing", args: {} },
    field: undefined,
    resources: buildResourceIndex().index,
    update: jest.fn(),
  });

  const getKnownFieldSelect = (props: FieldSelectionProps) => {
    const wrapper =
      FieldSelection(props) as React.ReactElement<{ children?: React.ReactNode }>;
    const children =
      React.Children.toArray(wrapper.props.children) as
      React.ReactElement<{ children?: React.ReactNode }>[];
    const fieldSelection = children[1];
    return (fieldSelection.type as (props: unknown) => SelectLike)(
      fieldSelection.props);
  };

  it("renders disabled none field", () => {
    const p = fakeProps();
    p.field = undefined;
    const wrapper = FieldSelection(p) as React.ReactElement<{ children?: React.ReactNode }>;
    const children =
      React.Children.toArray(wrapper.props.children) as
      React.ReactElement<{ children?: React.ReactNode }>[];
    const select = getKnownFieldSelect(p);
    expect(select.props.list).toEqual([]);
    expect(children[0]?.props.children).toContain("property");
    expect(select.props.selectedItem.label).toContain("Select one");
  });

  it("renders none field", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "Plant", resource_id: 1 }
    };
    p.field = undefined;
    const wrapper = FieldSelection(p) as React.ReactElement<{ children?: React.ReactNode }>;
    const children =
      React.Children.toArray(wrapper.props.children) as
      React.ReactElement<{ children?: React.ReactNode }>[];
    const select = getKnownFieldSelect(p);
    expect(select.props.list).toEqual([
      DDI.PLANT_STAGE,
      DDI.X,
      DDI.Y,
      DDI.Z,
      DDI.RADIUS,
      DDI.CUSTOM_META_FIELD,
    ]);
    expect(children[0]?.props.children).toContain("property");
    expect(select.props.selectedItem.label).toContain("Select one");
  });

  it("renders custom meta field", () => {
    const p = fakeProps();
    p.field = "custom";
    const { container } = render(<FieldSelection {...p} />);
    expect(container.textContent).toContain("property");
    expect((container.querySelector("input") as HTMLInputElement).value)
      .toEqual("custom");
    expect(container.querySelectorAll(".reset-custom-field").length).toEqual(1);
  });

  it("changes custom meta field", () => {
    const p = fakeProps();
    p.field = "custom_field";
    const wrapper = render(<FieldSelection {...p} />);
    changeBlurableInput(wrapper, "1");
    expect(p.update).toHaveBeenCalledWith({ field: "1" });
  });

  it("clears custom meta field", () => {
    const p = fakeProps();
    p.field = "custom_field";
    const { container } = render(<FieldSelection {...p} />);
    const reset = container.querySelector(".reset-custom-field");
    if (!reset) { throw new Error("Expected reset icon"); }
    fireEvent.click(reset);
    expect(p.update).toHaveBeenCalledWith({
      field: undefined, value: undefined
    });
  });

  it("renders field list for identifier", () => {
    const p = fakeProps();
    p.resource = { kind: "identifier", args: { label: "var" } };
    p.field = "plant_stage";
    const wrapper = FieldSelection(p) as React.ReactElement<{ children?: React.ReactNode }>;
    const children =
      React.Children.toArray(wrapper.props.children) as
      React.ReactElement<{ children?: React.ReactNode }>[];
    const select = getKnownFieldSelect(p);
    expect(select.props.list).toEqual([
      DDI.STATUS,
      DDI.COLOR,
      DDI.X,
      DDI.Y,
      DDI.Z,
      DDI.RADIUS,
      DDI.CUSTOM_META_FIELD,
    ]);
    expect(children[0]?.props.children).toContain("property");
    expect(select.props.selectedItem.label).toContain("Status");
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
    const wrapper = FieldSelection(p) as React.ReactElement<{ children?: React.ReactNode }>;
    const children =
      React.Children.toArray(wrapper.props.children) as
      React.ReactElement<{ children?: React.ReactNode }>[];
    const select = getKnownFieldSelect(p);
    expect(select.props.list).toEqual([
      DDI.WEED_STATUS,
      DDI.COLOR,
      DDI.X,
      DDI.Y,
      DDI.Z,
      DDI.RADIUS,
      DDI.CUSTOM_META_FIELD,
    ]);
    expect(children[0]?.props.children).toContain("property");
    expect(select.props.selectedItem.label).toContain(expected);
  });

  it("renders known point field", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "GenericPointer", resource_id: 3 }
    };
    p.field = "plant_stage";
    const wrapper = FieldSelection(p) as React.ReactElement<{ children?: React.ReactNode }>;
    const children =
      React.Children.toArray(wrapper.props.children) as
      React.ReactElement<{ children?: React.ReactNode }>[];
    const select = getKnownFieldSelect(p);
    expect(select.props.list).toEqual([
      DDI.COLOR,
      DDI.X,
      DDI.Y,
      DDI.Z,
      DDI.RADIUS,
      DDI.CUSTOM_META_FIELD,
    ]);
    expect(children[0]?.props.children).toContain("property");
    expect(select.props.selectedItem.label).toContain("Point status");
  });

  it("renders known plant field", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "Plant", resource_id: 3 }
    };
    p.field = "planted_at";
    const wrapper = FieldSelection(p) as React.ReactElement<{ children?: React.ReactNode }>;
    const children =
      React.Children.toArray(wrapper.props.children) as
      React.ReactElement<{ children?: React.ReactNode }>[];
    const select = getKnownFieldSelect(p);
    expect(select.props.list).toEqual([
      DDI.PLANT_STAGE,
      DDI.X,
      DDI.Y,
      DDI.Z,
      DDI.RADIUS,
      DDI.CUSTOM_META_FIELD,
    ]);
    expect(children[0]?.props.children).toContain("property");
    expect(select.props.selectedItem.label).toContain("Date Planted");
  });

  it("changes known weed field", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "Weed", resource_id: 1 }
    };
    p.field = undefined;
    const select = getKnownFieldSelect(p);
    select.props.onChange({
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
    const wrapper = FieldSelection(p) as React.ReactElement<{ children?: React.ReactNode }>;
    const children =
      React.Children.toArray(wrapper.props.children) as
      React.ReactElement<{ children?: React.ReactNode }>[];
    const select = getKnownFieldSelect(p);
    expect(select.props.list).toEqual([
      DDI.MOUNTED_TOOL,
      DDI.CUSTOM_META_FIELD,
    ]);
    expect(children[0]?.props.children).toContain("property");
    expect(select.props.selectedItem.label).toContain("Mounted Tool");
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
