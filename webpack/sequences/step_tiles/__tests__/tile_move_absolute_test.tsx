import * as React from "react";
import { TileMoveAbsolute } from "../tile_move_absolute";
import { mount, ReactWrapper } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { MoveAbsolute, SequenceBodyItem } from "farmbot/dist";
import { emptyState } from "../../../resources/reducer";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";
import { SpecialStatus } from "../../../resources/tagged_resources";

describe("<TileMoveAbsolute/>", () => {
  function bootstrapTest() {
    const currentStep: MoveAbsolute = {
      kind: "move_absolute",
      args: {
        location: {
          kind: "coordinate",
          args: {
            x: 1,
            y: 2,
            z: 3
          }
        },
        speed: 100,
        offset: {
          kind: "coordinate",
          args: {
            x: 4,
            y: 5,
            z: 6
          }
        }
      }
    };
    return {
      component: mount(<TileMoveAbsolute
        currentSequence={fakeSequence()}
        currentStep={currentStep}
        dispatch={jest.fn()}
        index={0}
        resources={emptyState().index} />)
    };
  }

  function checkField(
    block: ReactWrapper, position: number, label: string, value: string | number
  ) {
    expect(block.find("label").at(position).text().toLowerCase())
      .toEqual(label);
    expect(block.find("input").at(position).props().value)
      .toEqual(value);
  }

  it("renders inputs", () => {
    const block = bootstrapTest().component;
    const inputs = block.find("input");
    const labels = block.find("label");
    const buttons = block.find("button");
    expect(inputs.length).toEqual(8);
    expect(labels.length).toEqual(8);
    expect(buttons.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Move Absolute");
    expect(labels.at(0).text().toLowerCase()).toEqual("import coordinates from");
    expect(buttons.at(0).text()).toEqual("None");
    checkField(block, 1, "x (mm)", "1");
    checkField(block, 2, "y (mm)", "2");
    checkField(block, 3, "z (mm)", "3");
    checkField(block, 4, "speed (%)", 100);
    checkField(block, 5, "x-offset", "4");
    checkField(block, 6, "y-offset", "5");
    checkField(block, 7, "z-offset", "6");
  });

  it("retrieves a tool", () => {
    const index = buildResourceIndex([
      {
        kind: "Tool",
        uuid: "Tool.4.4",
        specialStatus: SpecialStatus.SAVED,
        body: {
          id: 4,
          name: "tool123"
        }
      }
    ]).index;
    const tool = index.references[index.byKind.Tool[0]];
    if (!tool) { throw new Error("Impossible"); }

    const currentStep: SequenceBodyItem = {
      kind: "move_absolute",
      args: {
        location: { kind: "tool", args: { tool_id: tool.body.id || -1 } },
        speed: 100,
        offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
      }
    };

    const component = mount(<TileMoveAbsolute
      currentSequence={fakeSequence()}
      currentStep={currentStep}
      dispatch={jest.fn()}
      index={0}
      resources={index} />).instance() as TileMoveAbsolute;

    expect(component.tool).toEqual(tool);
  });
});
