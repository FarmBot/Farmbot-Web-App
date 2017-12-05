import { Sequence } from "farmbot";
import { collectAllVariables } from "../collect_identifiers";

describe("collectIdentifiers", () => {
  // USE CASE 1: Empty / new sequence.
  const sequence1: Sequence = {
    kind: "sequence",
    args: {
      version: 6,
      locals: { kind: "nothing", args: {} }
    },
    body: []
  };

  // USE CASE 2: Single variable
  const sequence2: Sequence = {
    kind: "sequence",
    args: {
      version: 6,
      locals: { kind: "nothing", args: {} }
    },
    body: [
      {
        kind: "move_absolute",
        args: {
          location: { kind: "identifier", args: { label: "parent" } },
          offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
          speed: 100
        }
      }
    ]
  };

  // USE CASE 3: Multiple unique variables
  const sequence3: Sequence = {
    kind: "sequence",
    args: {
      version: 6,
      locals: { kind: "nothing", args: {} }
    },
    body: [
      {
        kind: "move_absolute",
        args: {
          location: { kind: "identifier", args: { label: "parent" } },
          offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
          speed: 100
        }
      },
      {
        kind: "move_absolute",
        args: {
          location: { kind: "identifier", args: { label: "parent2" } },
          offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
          speed: 100
        }
      }
    ]
  };

  // USE CASE 4: Duplicate variables
  const sequence4: Sequence = {
    kind: "sequence",
    args: {
      version: 6,
      locals: { kind: "nothing", args: {} }
    },
    body: [
      {
        kind: "move_absolute",
        args: {
          location: { kind: "identifier", args: { label: "parent" } },
          offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
          speed: 100
        }
      },
      {
        kind: "move_absolute",
        args: {
          location: { kind: "identifier", args: { label: "parent" } },
          offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
          speed: 100
        }
      }
    ]
  };

  it("doesnt blow up on empty sequences", () => {
    const results = collectAllVariables(sequence1);
    expect(results.length).toBe(0);
  });

  it("finds a single identifier", () => {
    const results = collectAllVariables(sequence2);
    expect(results.length).toBe(1);
    expect(results[0].args.label).toBe("parent");
  });

  it("finds multiple identifiers", () => {
    const results = collectAllVariables(sequence3);
    expect(results.length).toBe(2);
    expect(results[0].args.label).toBe("parent");
    expect(results[1].args.label).toBe("parent2");
  });

  it("removes duplicates", () => {
    const results = collectAllVariables(sequence4);
    expect(results.length).toBe(1);
    expect(results[0].args.label).toBe("parent");
  });
});
