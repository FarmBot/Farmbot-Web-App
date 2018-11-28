import * as React from "react";
import { Identifier } from "farmbot";
import { buildResourceIndex } from "../../../../__test_support__/resource_index_builder";
import { fakeSequence } from "../../../../__test_support__/fake_state/resources";
import { ParentSelector } from "../parent_selector";
import { shallow } from "enzyme";

describe("<ParentSelector/>", () => {
  it("renders variables when they are there", () => {
    const sequence = fakeSequence();
    const selected: Identifier = { kind: "identifier", args: { label: "parent" } };
    const { index } = buildResourceIndex([sequence]);
    index.sequenceMetas[sequence.uuid] = {
      "parent": {
        celeryNode: {
          kind: "parameter_declaration",
          args: { label: "parent", data_type: "point" }
        },
        location: { x: 0, y: 0, z: 0 },
        dropdown: { label: "Parent", value: "0" },
        editable: true,
        variableValue: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
      }
    };
    const el = shallow(<ParentSelector
      targetUuid={sequence.uuid}
      selected={selected}
      deprecatedResources={index}
      onChange={jest.fn()} />);
    expect(el).toBeDefined();
    expect(el.text()).toContain("Set 'parent' value");
  });
});
