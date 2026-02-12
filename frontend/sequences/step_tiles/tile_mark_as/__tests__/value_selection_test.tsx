let mockDev = false;
jest.mock("../../../../settings/dev/dev_support", () => {
  const actual = jest.requireActual("../../../../settings/dev/dev_support");
  return {
    ...actual,
    DevSettings: {
      ...actual.DevSettings,
      futureFeaturesEnabled: () => mockDev,
    },
  };
});

import React from "react";
import { fireEvent, render } from "@testing-library/react";
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

afterAll(() => {
  jest.unmock("../../../../settings/dev/dev_support");
});

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

  const getKnownValueSelect = (props: ValueSelectionProps) => {
    const wrapper = ValueSelection(props);
    const children = React.Children.toArray(wrapper.props.children) as
      JSX.Element[];
    const knownValue = children[1] as JSX.Element;
    return (knownValue.type as (props: unknown) => JSX.Element)(
      knownValue.props);
  };

  it("renders none value", () => {
    const p = fakeProps();
    p.field = undefined;
    const { container } = render(<ValueSelection {...p} />);
    expect(container.textContent).toContain("as");
    expect(container.textContent).toContain("Select one");
    expect(getKnownValueSelect(p).type).toBeDefined();
  });

  it("renders custom meta value", () => {
    const p = fakeProps();
    p.field = "custom_field";
    p.value = "custom_value";
    const { container } = render(<ValueSelection {...p} />);
    expect(container.querySelectorAll("input").length).toEqual(1);
    expect(container.textContent).toContain("as");
    expect((container.querySelector("input") as HTMLInputElement).value)
      .toEqual("custom_value");
  });

  it("renders missing custom meta value", () => {
    const p = fakeProps();
    p.field = "custom_field";
    p.value = undefined;
    const { container } = render(<ValueSelection {...p} />);
    expect(container.querySelectorAll("input").length).toEqual(1);
    expect(container.textContent).toContain("as");
    expect((container.querySelector("input") as HTMLInputElement).value)
      .toEqual("");
  });

  it("changes custom meta value", () => {
    const p = fakeProps();
    p.field = "custom_field";
    p.value = "custom_value";
    const wrapper = render(<ValueSelection {...p} />);
    changeBlurableInput(wrapper, "1");
    expect(p.update).toHaveBeenCalledWith({ value: "1" },
      expect.any(Function));
  });

  it("adds row", () => {
    const p = fakeProps();
    const { container } = render(<ValueSelection {...p} />);
    const label = container.querySelector("label");
    if (!label) { throw new Error("Expected label"); }
    fireEvent.click(label);
    expect(p.add).not.toHaveBeenCalled();
    mockDev = true;
    fireEvent.click(label);
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
    const select = getKnownValueSelect(p);
    const { container } = render(<ValueSelection {...p} />);
    expect(select.props.list).toEqual(PLANT_STAGE_LIST());
    expect(container.textContent).toContain("as");
    expect(container.textContent).toContain("Planted");
  });

  it("renders plant value", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "Plant", resource_id: 1 }
    };
    p.field = "plant_stage";
    p.value = "other";
    const select = getKnownValueSelect(p);
    const { container } = render(<ValueSelection {...p} />);
    expect(select.props.list).toEqual(PLANT_STAGE_LIST());
    expect(container.textContent).toContain("as");
    expect(container.textContent).toContain("other");
  });

  it("renders plant value: date planted", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "Plant", resource_id: 1 }
    };
    p.field = "planted_at";
    p.value = "{{ timeNow }}";
    const select = getKnownValueSelect(p);
    const { container } = render(<ValueSelection {...p} />);
    expect(select.props.list).toEqual([
      DDI.NOW,
    ]);
    expect(container.textContent).toContain("as");
    expect(container.textContent).toContain("Now");
  });

  it("renders known weed value", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "Weed", resource_id: 1 }
    };
    p.field = "plant_stage";
    p.value = "removed";
    const select = getKnownValueSelect(p);
    const { container } = render(<ValueSelection {...p} />);
    expect(select.props.list).toEqual([
      DDI.PENDING,
      DDI.ACTIVE,
      DDI.REMOVED,
    ]);
    expect(container.textContent).toContain("as");
    expect(container.textContent).toContain("Removed");
  });

  it("changes known weed value", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "Weed", resource_id: 1 }
    };
    p.field = "plant_stage";
    p.value = undefined;
    const select = getKnownValueSelect(p);
    select.props.onChange({
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
    const select = getKnownValueSelect(p);
    const { container } = render(<ValueSelection {...p} />);
    expect(select.props.list).toEqual([
      DDI.PENDING,
      DDI.ACTIVE,
      DDI.REMOVED,
    ]);
    expect(container.textContent).toContain("as");
    expect(container.textContent).toContain("Removed");
  });

  it("renders known uncontrolled point value", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "GenericPointer", resource_id: 1 }
    };
    p.field = "x";
    p.value = "123";
    const { container } = render(<ValueSelection {...p} />);
    expect(container.querySelectorAll("input").length).toEqual(1);
    expect(container.textContent).toContain("as");
    expect((container.querySelector("input") as HTMLInputElement).value)
      .toEqual("123");
  });

  it("renders other value", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "Other" as resource_type, resource_id: 1 }
    };
    p.field = "plant_stage";
    p.value = "removed";
    const select = getKnownValueSelect(p);
    const { container } = render(<ValueSelection {...p} />);
    expect(select.props.list).toEqual(ALL_STAGE_LIST());
    expect(container.textContent).toContain("as");
    expect(container.textContent).toContain("Removed");
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
    const select = getKnownValueSelect(p);
    const { container } = render(<ValueSelection {...p} />);
    expect(select.props.list).toEqual(TOOL_OPTIONS);
    expect(container.textContent).toContain("as");
    expect(container.textContent).toContain("None");
  });

  it("renders known tool value: mounted", () => {
    const p = fakeProps();
    p.resource = DeviceResource;
    p.field = "mounted_tool_id";
    p.value = 14;
    const select = getKnownValueSelect(p);
    const { container } = render(<ValueSelection {...p} />);
    expect(select.props.list).toEqual(TOOL_OPTIONS);
    expect(container.textContent).toContain("as");
    expect(container.textContent).toContain("Trench Digging Tool");
  });

  it("renders known tool value: unknown tool", () => {
    const p = fakeProps();
    p.resource = DeviceResource;
    p.field = "mounted_tool_id";
    p.value = 123;
    const select = getKnownValueSelect(p);
    const { container } = render(<ValueSelection {...p} />);
    expect(select.props.list).toEqual(TOOL_OPTIONS);
    expect(container.textContent).toContain("as");
    expect(container.textContent).toContain("Unknown tool");
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
    const select = getKnownValueSelect(p);
    const { container } = render(<ValueSelection {...p} />);
    expect(select.props.list).toEqual([
      { label: "None", value: 0 },
      { label: "Untitled tool", value: 1 },
    ]);
    expect(container.textContent).toContain("as");
    expect(container.textContent).toContain("Untitled tool");
  });

  it("renders known identifier value", () => {
    const p = fakeProps();
    p.resource = {
      kind: "identifier", args: { label: "var" }
    };
    p.field = "plant_stage";
    p.value = "planted";
    const select = getKnownValueSelect(p);
    const { container } = render(<ValueSelection {...p} />);
    expect(select.props.list).toEqual(ALL_STAGE_LIST());
    expect(container.textContent).toContain("as");
    expect(container.textContent).toContain("Planted");
  });
});
