import * as React from "react";
import { AllSteps } from "../all_steps";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { shallow } from "enzyme";
import { TaggedSequence, SpecialStatus } from "farmbot";
import { TileMoveRelative } from "../step_tiles/tile_move_relative";
import { TileReadPin } from "../step_tiles/tile_read_pin";
import { TileWritePin } from "../step_tiles/tile_write_pin";
import { sanitizeNodes } from "../locals_list/sanitize_nodes";

describe("<AllSteps/>", () => {
  const TEST_CASE: TaggedSequence = {
    "kind": "Sequence",
    "specialStatus": SpecialStatus.SAVED,
    "body": sanitizeNodes({
      "id": 8,
      "name": "Goto 0, 0, 0",
      "color": "gray",
      "folder_id": undefined,
      "body": [
        {
          "kind": "move_relative",
          "args": {
            "x": 0,
            "y": 0,
            "z": 0,
            "speed": 100
          },
        },
        {
          "kind": "read_pin",
          "args": {
            "pin_number": 0,
            "pin_mode": 0,
            "label": "---"
          },
        },
        {
          "kind": "write_pin",
          "args": {
            "pin_number": 0,
            "pin_value": 0,
            "pin_mode": 0
          },
        }
      ],
      "args": {
        "locals": { kind: "scope_declaration", args: {} },
        "version": 4,
      },
      "kind": "sequence"
    }).thisSequence,
    "uuid": "Sequence.8.52"
  };

  it("uses index as a key", () => {
    const el = shallow(<AllSteps
      sequence={TEST_CASE}
      onDrop={() => { }}
      dispatch={jest.fn()}
      resources={buildResourceIndex([]).index}
      confirmStepDeletion={false} />);
    [TileMoveRelative, TileReadPin, TileWritePin]
      .map(q => {
        expect(el.find(q).length).toEqual(1);
      });
  });
});
