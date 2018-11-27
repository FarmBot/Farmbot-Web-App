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
    index.sequenceMeta[sequence.uuid] = {
      "parent": {
        kind: "parameter_declaration",
        args: {
          label: "parent",
          data_type: "point"
        }
      }
    };
    const el = shallow(<ParentSelector
      targetUuid={sequence.uuid}
      selected={selected}
      resources={index}
      onChange={jest.fn()} />);
    expect(el).toBeDefined();
    expect(el.text()).toContain("Set 'parent' value");
  });
});
