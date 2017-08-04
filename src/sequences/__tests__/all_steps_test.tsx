import * as React from "react";
import { AllSteps } from "../all_steps";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { shallow } from "enzyme";
import { TaggedSequence } from "../../resources/tagged_resources";
// import { TaggedSequence } from "../../resources/tagged_resources";

describe("<AllSteps/>", () => {
  const TEST_CASE = {
    "kind": "sequences",
    "body": {
      "id": 8,
      "name": "Goto 0, 0, 0",
      "color": "gray",
      "body": [
        {
          "kind": "move_relative",
          "args": {
            "x": 0,
            "y": 0,
            "z": 0,
            "speed": 800
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
        "is_outdated": false,
        "version": 4
      },
      "kind": "sequence"
    },
    "uuid": "sequences.8.52"
  } as TaggedSequence;

  it("uses index as a key", () => {
    let el = shallow(<AllSteps
      sequence={TEST_CASE}
      onDrop={() => { }}
      dispatch={jest.fn()}
      resources={buildResourceIndex([]).index} />);
    [
      "TileMoveRelative",
      "TileReadPin",
      "TileWritePin"
    ].map(q => {
      expect(el.find(q).length).toEqual(1);
    });
  });
});
