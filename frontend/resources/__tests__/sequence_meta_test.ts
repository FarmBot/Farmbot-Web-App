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
  fakePeripheral,
  fakeSensor,
} from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import {
  sanitizeNodes,
} from "../../sequences/locals_list/sanitize_nodes";
import {
  formatPoint, NO_VALUE_SELECTED_DDI, formatTool,
} from "../../sequences/locals_list/variable_form_list";
import { Point, Tool } from "farmbot";
import { fakeVariableNameSet } from "../../__test_support__/fake_variables";
import { VariableNode } from "../../sequences/locals_list/locals_list_support";
import { NOTHING } from "../../sequences/locals_list/handle_select";

describe("determineDropdown", () => {
  it("crashes on unknown DDIs", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const r = () =>
      determineDropdown(baddata as VariableNode, buildResourceIndex([]).index);
    expect(r).toThrow("WARNING: Unknown, possibly new data_value.kind?");
  });

  it("returns a label for `PointGroup`", () => {
    const pg = fakePointGroup();
    pg.body.id = 12;
    pg.body.point_ids = [1];
    pg.body.member_count = 1;
    const p = fakePoint();
    p.body.id = 1;
    const r = determineDropdown({
      kind: "parameter_application",
      args: {
        label: "x",
        data_value: {
          kind: "point_group", args: { point_group_id: 12 }
        }
      }
    }, buildResourceIndex([pg, p]).index);
    expect(r.label).toEqual(pg.body.name + " (1)");
    expect(r.value).toEqual(pg.body.id);
  });

  it("returns a label for `PointGroup`: no member count", () => {
    const pg = fakePointGroup();
    pg.body.id = 12;
    pg.body.member_count = undefined;
    const r = determineDropdown({
      kind: "parameter_application",
      args: {
        label: "x",
        data_value: {
          kind: "point_group", args: { point_group_id: 12 }
        }
      }
    }, buildResourceIndex([pg]).index);
    expect(r.label).toEqual(pg.body.name + " (0)");
    expect(r.value).toEqual(pg.body.id);
  });

  it("returns a label for `parameter_declarations`", () => {
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

  it("returns a label for `coordinate`", () => {
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

  it("returns a label for `location_placeholder`", () => {
    const r = determineDropdown({
      kind: "parameter_application",
      args: {
        label: "x",
        data_value: { kind: "location_placeholder", args: {} }
      }
    }, buildResourceIndex([]).index);
    expect(r.label).toBe("None");
    expect(r.value).toBe("");
  });

  it("returns a label for `identifier`", () => {
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
    expect(r.label).toBe("variable - Select a location");
    expect(r.value).toBe("?");
  });

  it("returns a label for `point`", () => {
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

  it("returns a label for `tool`", () => {
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

  it("returns a label for `tool (no toolSlot)", () => {
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

  it("returns a label for numeric", () => {
    const r = determineDropdown({
      kind: "parameter_application",
      args: { label: "x", data_value: { kind: "numeric", args: { number: 1 } } }
    }, buildResourceIndex([]).index);
    expect(r.label).toBe("Number: 1");
    expect(r.value).toBe(1);
  });

  it("returns a label for `number_placeholder`", () => {
    const r = determineDropdown({
      kind: "parameter_application",
      args: {
        label: "x",
        data_value: { kind: "number_placeholder", args: {} }
      }
    }, buildResourceIndex([]).index);
    expect(r.label).toBe("None");
    expect(r.value).toBe(0);
  });

  it("returns a label for text", () => {
    const r = determineDropdown({
      kind: "parameter_application",
      args: { label: "x", data_value: { kind: "text", args: { string: "text" } } }
    }, buildResourceIndex([]).index);
    expect(r.label).toBe("Text: text");
    expect(r.value).toBe("text");
  });

  it("returns a label for `text_placeholder`", () => {
    const r = determineDropdown({
      kind: "parameter_application",
      args: {
        label: "x",
        data_value: { kind: "text_placeholder", args: {} }
      }
    }, buildResourceIndex([]).index);
    expect(r.label).toBe("None");
    expect(r.value).toBe("");
  });

  it("returns a label for resource: Sequence", () => {
    const sequence = fakeSequence();
    sequence.body.id = 1;
    sequence.body.name = "my sequence";
    const r = determineDropdown({
      kind: "parameter_application",
      args: {
        label: "x", data_value: {
          kind: "resource", args: {
            resource_id: 1,
            resource_type: "Sequence",
          }
        }
      }
    }, buildResourceIndex([sequence]).index);
    expect(r.label).toBe("my sequence");
    expect(r.value).toBe(1);
  });

  it("returns a label for resource: Peripheral", () => {
    const peripheral = fakePeripheral();
    peripheral.body.id = 1;
    peripheral.body.label = "my peripheral";
    const r = determineDropdown({
      kind: "parameter_application",
      args: {
        label: "x", data_value: {
          kind: "resource", args: {
            resource_id: 1,
            resource_type: "Peripheral",
          }
        }
      }
    }, buildResourceIndex([peripheral]).index);
    expect(r.label).toBe("my peripheral");
    expect(r.value).toBe(1);
  });

  it("returns a label for resource: Sensor", () => {
    const sensor = fakeSensor();
    sensor.body.id = 1;
    sensor.body.label = "my sensor";
    const r = determineDropdown({
      kind: "parameter_application",
      args: {
        label: "x", data_value: {
          kind: "resource", args: {
            resource_id: 1,
            resource_type: "Sensor",
          }
        }
      }
    }, buildResourceIndex([sensor]).index);
    expect(r.label).toBe("my sensor");
    expect(r.value).toBe(1);
  });

  it("returns a label for missing resource: Sequence", () => {
    const r = determineDropdown({
      kind: "parameter_application",
      args: {
        label: "x", data_value: {
          kind: "resource", args: {
            resource_id: 1,
            resource_type: "Sequence",
          }
        }
      }
    }, buildResourceIndex([]).index);
    expect(r.label.toLowerCase()).toBe("not found");
    expect(r.value).toBe(1);
  });

  it("returns a label for missing resource: Peripheral", () => {
    const r = determineDropdown({
      kind: "parameter_application",
      args: {
        label: "x", data_value: {
          kind: "resource", args: {
            resource_id: 1,
            resource_type: "Peripheral",
          }
        }
      }
    }, buildResourceIndex([]).index);
    expect(r.label.toLowerCase()).toBe("not found");
    expect(r.value).toBe(1);
  });

  it("returns a label for missing resource: Sensor", () => {
    const r = determineDropdown({
      kind: "parameter_application",
      args: {
        label: "x", data_value: {
          kind: "resource", args: {
            resource_id: 1,
            resource_type: "Sensor",
          }
        }
      }
    }, buildResourceIndex([]).index);
    expect(r.label.toLowerCase()).toBe("not found");
    expect(r.value).toBe(1);
  });

  it("returns a label for resource_placeholder: Sequence", () => {
    const r = determineDropdown({
      kind: "parameter_application",
      args: {
        label: "x", data_value: {
          kind: "resource_placeholder", args: {
            resource_type: "Sequence",
          }
        }
      }
    }, buildResourceIndex([]).index);
    expect(r.label).toBe("Sequence");
    expect(r.value).toBe("Sequence");
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

  it("handles missing tool slot", () => {
    const tool = fakeTool();
    tool.body.id = 1;
    const toolNode: Tool = {
      kind: "tool",
      args: { tool_id: tool.body.id }
    };
    const v = determineVector({
      kind: "parameter_application",
      args: { label: "x", data_value: toolNode }
    }, buildResourceIndex([tool]).index);
    expect(v).toEqual(undefined);
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
      location: { kind: "identifier", args: { label: "label" } },
      offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
      speed: 0
    }
  }];
  s.body = sanitizeNodes(s.body).thisSequence; // <= Add missing declaration
  const ri = buildResourceIndex([s]);

  it("indexes relevant meta-data relating to variables", () => {
    const variables = createSequenceMeta(ri.index, s);
    const variable = variables["label"];
    const extracted = findVariableByName(ri.index, s.uuid, "label");
    expect(variable).toBeTruthy();
    if (variable && extracted) {
      expect(variable.celeryNode.args.label).toEqual("label");
      expect(variable.dropdown.label).toEqual(NO_VALUE_SELECTED_DDI().label);
      expect(variable.vector).toEqual(undefined);
      expect(extracted.celeryNode.args.label).toEqual("label");
      expect(extracted.dropdown.label).toEqual(NO_VALUE_SELECTED_DDI().label);
      expect(extracted.vector).toEqual(undefined);
    }
  });

  it("handles missing locals", () => {
    const sequence = fakeSequence();
    sequence.body.args.locals.body = undefined;
    const result = createSequenceMeta(ri.index, sequence);
    expect(result).toEqual({});
  });
});

describe("determineVarDDILabel()", () => {
  it("returns 'add new' variable label", () => {
    const ri = buildResourceIndex().index;
    const label = determineVarDDILabel({
      label: "variable", resources: ri, uuid: undefined
    });
    expect(label).toEqual("Add new");
  });

  it("returns 'select location' variable label", () => {
    const varData = fakeVariableNameSet("parent");
    const data = Object.values(varData)[0];
    data && (data.celeryNode = {
      kind: "parameter_application",
      args: {
        label: "parent",
        data_value: NOTHING,
      }
    });
    const ri = buildResourceIndex().index;
    ri.sequenceMetas = { "sequence uuid": varData };
    const label = determineVarDDILabel({
      label: "parent", resources: ri, uuid: "sequence uuid"
    });
    expect(label).toEqual("Location - Select a location");
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
    expect(label).toEqual("variable - Externally defined");
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
    expect(label).toEqual("variable - fake variable info label");
  });
});
