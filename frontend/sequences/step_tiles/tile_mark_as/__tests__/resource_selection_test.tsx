import * as React from "react";
import { mount, shallow } from "enzyme";
import { ResourceSelection } from "../resource_selection";
import { ResourceSelectionProps } from "../interfaces";
import {
  buildResourceIndex, fakeDevice,
} from "../../../../__test_support__/resource_index_builder";
import { fakePlant } from "../../../../__test_support__/fake_state/resources";

describe("<ResourceSelection />", () => {
  const plant = fakePlant();
  plant.body.id = 1;

  const fakeProps = (): ResourceSelectionProps => ({
    resource: { kind: "nothing", args: {} },
    resources: buildResourceIndex([plant]).index,
    updateResource: jest.fn(),
    sequenceUuid: "fake Sequence UUID",
  });

  it("renders", () => {
    const p = fakeProps();
    const device = fakeDevice();
    device.body.id = 1;
    p.resources = buildResourceIndex([device]).index;
    const wrapper = mount(<ResourceSelection {...p} />);
    expect(wrapper.text()).toContain("Mark");
    expect(wrapper.text()).toContain("Select one");
  });

  it("renders resource", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource",
      args: { resource_type: "Plant", resource_id: 1 }
    };
    const wrapper = mount(<ResourceSelection {...p} />);
    expect(wrapper.text()).toContain("Mark");
    expect(wrapper.text()).toContain("Strawberry plant 1 (100, 200, 0)");
  });

  it("renders identifier", () => {
    const p = fakeProps();
    p.resource = {
      kind: "identifier",
      args: { label: "var" }
    };
    const wrapper = mount(<ResourceSelection {...p} />);
    expect(wrapper.text()).toContain("Mark");
    expect(wrapper.text()).toContain("Variable - Add new");
  });

  it("renders identifier with label", () => {
    const p = fakeProps();
    p.resources.sequenceMetas["fake uuid"] = {
      parent: {
        celeryNode: {
          kind: "parameter_declaration", args: {
            label: "parent", default_value: {
              kind: "coordinate", args: { x: 0, y: 0, z: 0 }
            }
          }
        },
        dropdown: { label: "Parent", value: "parent" },
        vector: undefined,
      }
    };
    p.sequenceUuid = "fake uuid";
    p.resource = {
      kind: "identifier",
      args: { label: "parent" }
    };
    const wrapper = mount(<ResourceSelection {...p} />);
    expect(wrapper.text()).toContain("Mark");
    expect(wrapper.text()).toContain("Variable - Parent");
  });

  it("changes resource", () => {
    const p = fakeProps();
    const wrapper = shallow(<ResourceSelection {...p} />);
    wrapper.find("FBSelect").simulate("change", {
      label: "", value: "1", headingId: "Plant",
    });
    expect(p.updateResource).toHaveBeenCalledWith({
      kind: "resource",
      args: { resource_type: "Plant", resource_id: 1 }
    });
  });

  it("changes resource to identifier", () => {
    const p = fakeProps();
    const wrapper = shallow(<ResourceSelection {...p} />);
    wrapper.find("FBSelect").simulate("change", {
      label: "Variable", value: "parent", headingId: "Identifier",
    });
    expect(p.updateResource).toHaveBeenCalledWith({
      kind: "identifier",
      args: { label: "parent" }
    });
  });
});
