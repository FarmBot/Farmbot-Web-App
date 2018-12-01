jest.mock("../format_selected_dropdown", () => {
  return {
    formatSelectedDropdown: jest.fn(() => [])
  };
});

import * as React from "react";
import { shallow } from "enzyme";
import { buildResourceIndex } from "../../../../__test_support__/resource_index_builder";
import { TileMoveAbsSelect } from "../select";
import { TileMoveAbsProps } from "../interfaces";

describe("<TileMoveAbsSelect/>", () => {
  function fakeProps(): TileMoveAbsProps {
    const resources = buildResourceIndex().index;
    return {
      resources,
      uuid: resources.byKind.Sequence[0] || "Sequence.-00.-00",
      selectedItem: {
        kind: "tool",
        args: { tool_id: 123 }
      },
      onChange: jest.fn(),
      shouldDisplay: jest.fn(() => true)
    };
  }

  it("renders", () => {
    const props = fakeProps();
    const el = shallow(<TileMoveAbsSelect {...props} />);
    el.simulate("change", { label: "test ddi", value: 123, headingId: "tool" });
    expect(props.onChange)
      .toHaveBeenCalledWith({ kind: "coordinate", args: { x: 0, y: 0, z: 0 } });
  });
});
