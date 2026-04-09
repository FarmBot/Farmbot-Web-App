import React from "react";
import { render } from "@testing-library/react";
import { ResourceSelection } from "../resource_selection";
import { ResourceSelectionProps } from "../interfaces";
import {
  buildResourceIndex, fakeDevice,
} from "../../../../__test_support__/resource_index_builder";
import {
  fakeFbosConfig, fakePlant,
} from "../../../../__test_support__/fake_state/resources";
import { Resource } from "farmbot";

describe("<ResourceSelection />", () => {
  type ResourceSelect = React.ReactElement<{
    list?: unknown[];
    selectedItem?: { label?: string; value?: unknown };
    onChange?: (item: {
      label: string;
      value: string;
      headingId?: string;
    }) => void;
  }>;
  const plant = fakePlant();
  plant.body.id = 1;

  const fakeProps = (): ResourceSelectionProps => ({
    resource: { kind: "nothing", args: {} },
    resources: buildResourceIndex([plant]).index,
    updateResource: jest.fn(),
    sequenceUuid: "fake Sequence UUID",
  });

  const getSelect = (p: ResourceSelectionProps) => {
    const wrapper =
      ResourceSelection(p) as React.ReactElement<{ children?: React.ReactNode }>;
    const children = React.Children.toArray(wrapper.props.children) as ResourceSelect[];
    return children[1];
  };

  it("renders", () => {
    const p = fakeProps();
    const device = fakeDevice();
    device.body.id = 1;
    p.resources = buildResourceIndex([device]).index;
    const { container } = render(<ResourceSelection {...p} />);
    expect(container.textContent).toContain("Mark");
    expect(container.querySelectorAll("input").length).toEqual(0);
  });

  it("renders tool mount in list", () => {
    const p = fakeProps();
    const fbosConfig = fakeFbosConfig();
    fbosConfig.body.firmware_hardware = undefined;
    p.resources = buildResourceIndex([fbosConfig]).index;
    const wrapper =
      ResourceSelection(p) as React.ReactElement<{ children?: React.ReactNode }>;
    const children = React.Children.toArray(wrapper.props.children) as ResourceSelect[];
    const select = children[1];
    expect(select.props.list).toEqual([
      { headingId: "Identifier", label: "Variables", heading: true, value: 0 },
      { headingId: "Identifier", label: "Add new", value: "Location 1" },
      { headingId: "Device", label: "Device", heading: true, value: 0 },
      { headingId: "Device", label: "Tool Mount", value: 0 },
      { headingId: "Plant", label: "Plants", heading: true, value: 0 },
      { headingId: "GenericPointer", label: "Points", heading: true, value: 0 },
      { headingId: "Weed", label: "Weeds", heading: true, value: 0 },
    ]);
  });

  it("doesn't render tool mount in list", () => {
    const p = fakeProps();
    const fbosConfig = fakeFbosConfig();
    fbosConfig.body.firmware_hardware = "express_k10";
    p.resources = buildResourceIndex([fbosConfig]).index;
    const wrapper =
      ResourceSelection(p) as React.ReactElement<{ children?: React.ReactNode }>;
    const children = React.Children.toArray(wrapper.props.children) as ResourceSelect[];
    const select = children[1];
    expect(select.props.list).toEqual([
      { headingId: "Identifier", label: "Variables", heading: true, value: 0 },
      { headingId: "Identifier", label: "Add new", value: "Location 1" },
      { headingId: "Device", label: "Device", heading: true, value: 0 },
      { headingId: "Plant", label: "Plants", heading: true, value: 0 },
      { headingId: "GenericPointer", label: "Points", heading: true, value: 0 },
      { headingId: "Weed", label: "Weeds", heading: true, value: 0 },
    ]);
  });

  it("renders resource", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "Plant", resource_id: 1 }
    };
    const { container } = render(<ResourceSelection {...p} />);
    const select = getSelect(p);
    expect(container.textContent).toContain("Mark");
    expect(select.props.selectedItem?.label).toContain("Strawberry plant 1");
  });

  it("renders point", () => {
    const p = fakeProps();
    p.resource = {
      kind: "point",
      args: { pointer_type: "Plant", pointer_id: 1 }
    } as unknown as Resource;
    const { container } = render(<ResourceSelection {...p} />);
    const select = getSelect(p);
    expect(container.textContent).toContain("Mark");
    expect(select.props.selectedItem?.label).toContain("Strawberry plant 1");
  });

  it("renders identifier", () => {
    const p = fakeProps();
    p.resource = {
      kind: "identifier",
      args: { label: "var" }
    };
    const { container } = render(<ResourceSelection {...p} />);
    const select = getSelect(p);
    expect(container.textContent).toContain("Mark");
    expect(select.props.selectedItem?.label).toContain("Add new");
  });

  it("renders identifier with label", () => {
    const p = fakeProps();
    p.resources.sequenceMetas["fake uuid"] = {
      "label": {
        celeryNode: {
          kind: "parameter_declaration", args: {
            label: "label", default_value: {
              kind: "coordinate", args: { x: 0, y: 0, z: 0 }
            }
          }
        },
        dropdown: { label: "Label", value: "label" },
        vector: undefined,
      }
    };
    p.sequenceUuid = "fake uuid";
    p.resource = {
      kind: "identifier",
      args: { label: "label" }
    };
    const { container } = render(<ResourceSelection {...p} />);
    const select = getSelect(p);
    expect(container.textContent).toContain("Mark");
    expect((select.props.selectedItem?.label || "").toLowerCase()).toContain("label");
  });

  it("changes resource", () => {
    const p = fakeProps();
    const wrapper =
      ResourceSelection(p) as React.ReactElement<{ children?: React.ReactNode }>;
    const children = React.Children.toArray(wrapper.props.children) as ResourceSelect[];
    const select = children[1];
    select.props.onChange?.({
      label: "", value: "1", headingId: "Plant",
    });
    expect(p.updateResource).toHaveBeenCalledWith({
      kind: "resource",
      args: { resource_type: "Plant", resource_id: 1 }
    });
  });

  it("changes resource to identifier", () => {
    const p = fakeProps();
    const wrapper =
      ResourceSelection(p) as React.ReactElement<{ children?: React.ReactNode }>;
    const children = React.Children.toArray(wrapper.props.children) as ResourceSelect[];
    const select = children[1];
    select.props.onChange?.({
      label: "Variable", value: "label", headingId: "Identifier",
    });
    expect(p.updateResource).toHaveBeenCalledWith({
      kind: "identifier",
      args: { label: "label" }
    });
  });
});
