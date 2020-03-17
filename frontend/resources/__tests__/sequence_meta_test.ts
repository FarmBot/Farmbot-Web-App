import {
  createSequenceMeta,
  determineDropdown,
  findVariableByName,
  determineVector,
  determineVarDDILabel,
} from "../sequence_meta";
import {
  fakeSequence,
  fakePoint,
  fakeTool,
  fakeToolSlot,
  fakePointGroup,
} from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import {
  sanitizeNodes,
} from "../../sequences/locals_list/sanitize_nodes";
import {
  formatPoint, NO_VALUE_SELECTED_DDI, formatTool,
} from "../../sequences/locals_list/location_form_list";
import { Point, Tool } from "farmbot";
import { fakeVariableNameSet } from "../../__test_support__/fake_variables";
import { NOTHING_SELECTED } from "../../sequences/locals_list/handle_select";

describe("determineDropdown", () => {
  it("crashes on unknown DDIs", () => {
    // tslint:disable-next-line:no-any
    const baddata: any = {
      kind: "parameter_application",
      args: {
        label: "x",
        data_value: {
          kind: "other",
          args: { resource_id: 12 }
        }
      }
    };
    const r = () => determineDropdown(baddata, buildResourceIndex([]).index);
    expect(r).toThrowError("WARNING: Unknown, possibly new data_value.kind?");

  });

  it("returns a label for `PointGroup`", () => {
    const pg = fakePointGroup();
    pg.body.id = 12;
    const r = determineDropdown({
      kind: "parameter_application",
      args: {
        label: "x",
        data_value: {
          kind: "point_group", args: { point_group_id: 12 }
        }
      }
    }, buildResourceIndex([pg]).index);
    expect(r.label).toEqual(pg.body.name);
    expect(r.value).toEqual(pg.body.id);
  });

  it("Returns a label for `parameter_declarations`", () => {
    const r = determineDropdown({
      kind: "parameter_declaration",
      args: {
        label: "x", default_value: {
          kind: "coordinate", args: { x: 0, y: 0, z: 0 }
        }
      }
    }, buildResourceIndex([]).index);
    expect(r.label).toBe("Externally defined");
    expect(r.value).toBe("?");
  });

  it("Returns a label for `coordinate`", () => {
    const r = determineDropdown({
      kind: "parameter_application",
      args: {
        label: "x",
        data_value: { kind: "coordinate", args: { x: 0, y: 1.1, z: 2 } }
      }
    }, buildResourceIndex([]).index);
    expect(r.label).toBe("Coordinate (0, 1.1, 2)");
    expect(r.value).toBe("{\"x\":0,\"y\":1.1,\"z\":2}");
  });

  it("Returns a label for `identifier`", () => {
    const varData = fakeVariableNameSet("variable");
    const ri = buildResourceIndex([]).index;
    ri.sequenceMetas["sequence uuid"] = varData;
    const r = determineDropdown({
      kind: "parameter_application",
      args: {
        label: "variable",
        data_value: { kind: "identifier", args: { label: "variable" } }
      }
    }, ri, "sequence uuid");
    expect(r.label).toBe("Location Variable - Select a location");
    expect(r.value).toBe("?");
  });

  it("Returns a label for `point`", () => {
    const point = fakePoint();
    const pointNode: Point = {
      kind: "point",
      args: {
        pointer_id: point.body.id || -0,
        pointer_type: "GenericPointer"
      }
    };
    const r = determineDropdown({
      kind: "parameter_application",
      args: { label: "x", data_value: pointNode }
    }, buildResourceIndex([point]).index);
    expect(r.label).toBe(formatPoint(point).label);
    expect(r.value).toBe("" + point.body.id);
  });

  it("Returns a label for `tool`", () => {
    const tool = fakeTool();
    tool.body.id = 1;
    const toolNode: Tool = {
      kind: "tool",
      args: { tool_id: tool.body.id }
    };
    const toolSlot = fakeToolSlot();
    toolSlot.body.tool_id = tool.body.id;
    const r = determineDropdown({
      kind: "parameter_application",
      args: { label: "x", data_value: toolNode }
    }, buildResourceIndex([tool, toolSlot]).index);
    expect(r.label).toBe(formatTool(tool, toolSlot).label);
    expect(r.value).toBe("" + tool.body.id);
  });

  it("Returns a label for `tool (no toolSlot)", () => {
    const tool = fakeTool();
    tool.body.id = 1;
    const toolNode: Tool = {
      kind: "tool",
      args: { tool_id: tool.body.id }
    };
    const r = determineDropdown({
      kind: "parameter_application",
      args: { label: "x", data_value: toolNode }
    }, buildResourceIndex([tool]).index);
    expect(r.label).toBe(formatTool(tool, undefined).label);
    expect(r.value).toBe("" + tool.body.id);
  });
});

describe("determineVector()", () => {
  it("determines vector for point", () => {
    const point = fakePoint();
    const pointNode: Point = {
      kind: "point",
      args: {
        pointer_id: point.body.id || -0,
        pointer_type: "GenericPointer"
      }
    };
    const v = determineVector({
      kind: "parameter_application",
      args: { label: "x", data_value: pointNode }
    }, buildResourceIndex([point]).index);
    const { x, y, z } = point.body;
    expect(v).toEqual(expect.objectContaining({ x, y, z }));
  });

  it("determines vector for tool", () => {
    const tool = fakeTool();
    tool.body.id = 1;
    const toolNode: Tool = {
      kind: "tool",
      args: { tool_id: tool.body.id }
    };
    const toolSlot = fakeToolSlot();
    toolSlot.body.tool_id = tool.body.id;
    const v = determineVector({
      kind: "parameter_application",
      args: { label: "x", data_value: toolNode }
    }, buildResourceIndex([tool, toolSlot]).index);
    const { x, y, z } = toolSlot.body;
    expect(v).toEqual(expect.objectContaining({ x, y, z }));
  });

  it("determines vector for variable", () => {
    const vector = { x: 1, y: 2, z: 3 };
    const varData = fakeVariableNameSet("variable", vector);
    const ri = buildResourceIndex([]).index;
    ri.sequenceMetas["sequence uuid"] = varData;
    const v = determineVector({
      kind: "parameter_application",
      args: {
        label: "variable",
        data_value: { kind: "identifier", args: { label: "variable" } }
      }
    }, ri, "sequence uuid");
    expect(v).toEqual(vector);
  });
});

describe("createSequenceMeta", () => {
  const s = fakeSequence();
  s.body.body = [{ // <= Add var. reference
    kind: "move_absolute",
    args: {
      location: { kind: "identifier", args: { label: "parent" } },
      offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
      speed: 0
    }
  }];
  s.body = sanitizeNodes(s.body).thisSequence; // <= Add missing declaration
  const ri = buildResourceIndex([s]);

  it("indexes relevant meta-data relating to variables", () => {
    const result = createSequenceMeta(ri.index, s);
    const { parent } = result;
    const extracted = findVariableByName(ri.index, s.uuid, "parent");
    expect(parent).toBeTruthy();
    if (parent && extracted) {
      expect(parent.celeryNode.args.label).toEqual("parent");
      expect(parent.dropdown.label).toEqual(NO_VALUE_SELECTED_DDI().label);
      expect(parent.vector).toEqual(undefined);
      expect(extracted.celeryNode.args.label).toEqual("parent");
      expect(extracted.dropdown.label).toEqual(NO_VALUE_SELECTED_DDI().label);
      expect(extracted.vector).toEqual(undefined);
    }
  });
});

describe("determineVarDDILabel()", () => {
  it("returns 'add new' variable label", () => {
    const ri = buildResourceIndex().index;
    const label = determineVarDDILabel({
      label: "variable", resources: ri, uuid: undefined
    });
    expect(label).toEqual("Location Variable - Add new");
  });

  it("returns 'select location' variable label", () => {
    const varData = fakeVariableNameSet("variable");
    const data = Object.values(varData)[0];
    data && (data.celeryNode = NOTHING_SELECTED);
    const ri = buildResourceIndex().index;
    ri.sequenceMetas = { "sequence uuid": varData };
    const label = determineVarDDILabel({
      label: "variable", resources: ri, uuid: "sequence uuid"
    });
    expect(label).toEqual("Location Variable - Select a location");
  });

  it("returns 'externally defined' variable label", () => {
    const varData = fakeVariableNameSet("variable");
    const data = Object.values(varData)[0];
    data && (data.celeryNode = {
      kind: "parameter_declaration",
      args: {
        label: "variable", default_value: {
          kind: "coordinate", args: { x: 0, y: 0, z: 0 }
        }
      }
    });
    const ri = buildResourceIndex().index;
    ri.sequenceMetas = { "sequence uuid": varData };
    const label = determineVarDDILabel({
      label: "variable", resources: ri, uuid: "sequence uuid"
    });
    expect(label).toEqual("Location Variable - Externally defined");
  });

  it("returns variable label", () => {
    const varData = fakeVariableNameSet("variable");
    const data = Object.values(varData)[0];
    data && (data.celeryNode.kind = "variable_declaration");
    const ri = buildResourceIndex().index;
    ri.sequenceMetas = { "sequence uuid": varData };
    const label = determineVarDDILabel({
      label: "variable", resources: ri, uuid: "sequence uuid"
    });
    expect(label).toEqual("Location Variable - variable");
  });
});
