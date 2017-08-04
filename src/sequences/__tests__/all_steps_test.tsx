import { AllSteps } from "../all_steps";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
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
          "uuid": "03840ac5-f7fb-4766-89cd-360cb5d7a224"
        },
        {
          "kind": "read_pin",
          "args": {
            "pin_number": 0,
            "pin_mode": 0,
            "label": "---"
          },
          "uuid": "5ddbffe9-a4ba-44b0-83f3-15ff1799db34"
        },
        {
          "kind": "write_pin",
          "args": {
            "pin_number": 0,
            "pin_value": 0,
            "pin_mode": 0
          },
          "uuid": "8d262198-5d48-4273-b261-8f8c88b7b781"
        }
      ],
      "args": {
        "is_outdated": false,
        "version": 4
      },
      "kind": "sequence"
    },
    "uuid": "sequences.8.52"
  } as any;

  it("uses index as a key", () => {
    let wow = AllSteps({
      sequence: TEST_CASE,
      onDrop: () => { },
      dispatch: jest.fn(),
      resources: buildResourceIndex([]).index,
      useUuid: true
    });
    let geeWiz = JSON.stringify(wow);
    console.log(geeWiz);
  });
  it("uses UUID as a key", () => {
  });
});
