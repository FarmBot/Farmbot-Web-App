import { Sequence, MoveAbsolute } from "farmbot";
import { collectAllVariables, recomputeLocalVarDeclaration } from "../variables_support";

const PARENT: MoveAbsolute = {
  kind: "move_absolute",
  args: {
    location: { kind: "identifier", args: { label: "parent" } },
    offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
    speed: 100
  }
};

const PARENT2: MoveAbsolute = {
  kind: "move_absolute",
  args: {
    location: { kind: "identifier", args: { label: "parent2" } },
    offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
    speed: 100
  }
};

/** Another random variable. */
const Q: MoveAbsolute = {
  kind: "move_absolute",
  args: {
    location: { kind: "identifier", args: { label: "q" } },
    offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
    speed: 100
  }
};

const NOTHING: Sequence["args"] = {
  version: 6,
  locals: { kind: "nothing", args: {} }
};

// USE CASE 1: Empty / new sequence.
const sequence1: Sequence = { kind: "sequence", args: NOTHING, body: [] };

// USE CASE 2: Single variable
const sequence2: Sequence = { kind: "sequence", args: NOTHING, body: [PARENT] };

// USE CASE 3: Multiple unique variables
const sequence3: Sequence = {
  kind: "sequence",
  args: NOTHING,
  body: [PARENT, PARENT2]
};

// USE CASE 4: Duplicate variables
const sequence4: Sequence = {
  kind: "sequence",
  args: NOTHING,
  body: [PARENT, PARENT]
};

// USE CASE 5: preexisting variables
const sequence5: Sequence = {
  kind: "sequence",
  args: {
    version: 6,
    locals: {
      kind: "scope_declaration",
      args: {},
      body: [
        {
          kind: "parameter_declaration",
          args: { label: "foo", data_type: "point" }
        }
      ]
    }
  },
  body: [PARENT, Q]
};

// USE CASE 6: Empty scope_declaration
const sequence6: Sequence = {
  kind: "sequence",
  args: { version: 6, locals: { kind: "scope_declaration", args: {} } },
  body: [PARENT, Q]
};

// USE CASE 7:
const sequence7: Sequence = {
  kind: "sequence",
  args: { version: 6, locals: { kind: "scope_declaration", args: {} } },
  body: []
};

describe("collectIdentifiers", () => {
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

describe("recomputeLocals", () => {
  it("recomputes locals (multiple use of same var)", () => {
    const result = recomputeLocalVarDeclaration(sequence4);
    expect(result.args.locals.kind).toBe("scope_declaration");
    expect((result.args.locals.body || []).length).toBe(1);
  });

  it("recomputes locals (multiple variables)", () => {
    const result = recomputeLocalVarDeclaration(sequence3);
    expect(result.args.locals.kind).toBe("scope_declaration");
    expect((result.args.locals.body || []).length).toBe(2);
  });

  it("recomputes locals (squash old variables)", () => {
    const result = recomputeLocalVarDeclaration(sequence5);
    expect(result.args.locals.kind).toBe("scope_declaration");
    expect((result.args.locals.body || []).length).toBe(2);
    const labels = (result.args.locals.body || []).map(x => x.args.label);
    expect(labels).toContain("q");
  });

  it("Doesn't crash on empty arrays in `locals`", () => {
    const result = recomputeLocalVarDeclaration(sequence6);
    expect(result.args.locals.kind).toBe("scope_declaration");
    expect((result.args.locals.body || []).length).toBe(2);
    const labels = (result.args.locals.body || []).map(x => x.args.label);
    expect(labels).toContain("q");
  });

  it("Doesn't crash on variable-less sequences", () => {
    const result = recomputeLocalVarDeclaration(sequence7);
    expect(result.args.locals.kind).toBe("nothing");
    expect((result.args.locals.body || []).length).toBe(0);
  });
});
