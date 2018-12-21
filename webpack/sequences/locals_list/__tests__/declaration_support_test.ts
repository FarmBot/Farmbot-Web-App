import { declarationList } from "../declaration_support";

describe("declarationList()", () => {
  it("returns undefined", () => {
    const result = declarationList(undefined);
    expect(result).toEqual(undefined);
  });

  it("returns variable declarations", () => {
    const result = declarationList({
      parent1: {
        celeryNode: {
          kind: "parameter_declaration", args: {
            label: "parent1", data_type: "point"
          }
        },
        dropdown: { label: "Parent1", value: "parent1" },
        vector: undefined,
      },
      parent2: {
        celeryNode: {
          kind: "variable_declaration", args: {
            label: "parent2", data_value: {
              kind: "coordinate", args: { x: 1, y: 2, z: 3 }
            }
          }
        },
        dropdown: { label: "Parent2", value: "parent2" },
        vector: { x: 1, y: 2, z: 3 },
      }
    });
    expect(result).toEqual([{
      kind: "variable_declaration",
      args: {
        label: "parent1",
        data_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
      }
    }]);
  });
});
