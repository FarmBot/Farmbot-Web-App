import * as React from "react";
import {
  ExecuteBlock,
  ExecBlockParams,
  RefactoredExecuteBlock,
  getVariable
} from "../tile_execute";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { Execute, Point, Identifier, Coordinate, Tool } from "farmbot";
import { Actions } from "../../../constants";
import { emptyState } from "../../../resources/reducer";

function fakeProps(): ExecBlockParams {
  const currentStep: Execute = {
    kind: "execute",
    args: {
      sequence_id: 0
    }
  };
  return {
    currentSequence: fakeSequence(),
    currentStep,
    dispatch: jest.fn(),
    index: 0,
    resources: emptyState().index,
    shouldDisplay: () => false,
    confirmStepDeletion: false,
  };
}

describe("<ExecuteBlock/>", () => {
  it("renders inputs", () => {
    const block = mount(<ExecuteBlock {...fakeProps()} />);
    const inputs = block.find("input");
    const labels = block.find("label");
    expect(inputs.length).toEqual(1);
    expect(labels.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Execute Sequence");
    expect(labels.at(0).text()).toEqual("Sequence");
    expect(block.text()).toContain("None");
  });

  it("renders inputs when sequence has a variable", () => {
    const p = fakeProps();
    p.shouldDisplay = () => true;
    const block = mount(<ExecuteBlock {...p} />);
    const inputs = block.find("input");
    const labels = block.find("label");
    expect(inputs.length).toEqual(1);
    expect(labels.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Execute Sequence");
    expect(labels.at(0).text()).toEqual("Sequence");
    expect(block.text()).toContain("None");
  });
});

describe("<RefactoredExecuteBlock />", () => {
  it("selects sequence", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = dispatch;
    const block =
      mount<RefactoredExecuteBlock>(<RefactoredExecuteBlock {...p} />);
    block.instance().changeSelection({ label: "", value: 10 });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.OVERWRITE_RESOURCE,
      payload: expect.objectContaining({
        update: expect.objectContaining({
          body: [{ kind: "execute", args: { sequence_id: 10 } }]
        })
      })
    });
  });

  const testSetVariable = (location: Coordinate | Point | Tool | Identifier) => {
    const p = fakeProps();
    const block = new RefactoredExecuteBlock(p);
    block.setVariable(location);
    expect(p.dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: Actions.OVERWRITE_RESOURCE,
      payload: expect.objectContaining({
        update: expect.objectContaining({
          body: [{
            kind: "execute", args: { sequence_id: 0 },
            body: [{
              kind: "variable_declaration",
              args: { label: "parent", data_value: location }
            }]
          }]
        })
      })
    }));
  };

  it("sets variable: coordinate", () => {
    const location: Coordinate = { kind: "coordinate", args: { x: 1, y: 2, z: 3 } };
    testSetVariable(location);
  });

  it("sets variable: identifier", () => {
    const location: Identifier = { kind: "identifier", args: { label: "parent" } };
    testSetVariable(location);
  });
});

describe("getVariable", () => {
  it("handles points", () => {
    const data_value: Point = {
      kind: "point",
      args: { pointer_type: "point", pointer_id: 123 }
    };

    const result = getVariable([{
      kind: "variable_declaration",
      args: { label: "parent", data_value }
    }]);

    expect(result).toEqual(data_value);
  });

  it("handles others", () => {
    const badData = {
      kind: "not_a_variable_declaration",
      args: {
        label: "parent",
        data_value: {
          kind: "not_an_identifier",
          args: {
            label: "X"
          }
        }
      }
    };
    // tslint:disable-next-line:no-any
    const boom = () => getVariable([badData as any]);
    const json = JSON.stringify(badData.args.data_value);
    const expected = `How did this get here? ${json}`;
    expect(boom).toThrow(expected);
  });

  it("handles undefined", () => {
    const result = getVariable(undefined);
    expect(result.kind).toEqual("coordinate");
    if (result.kind === "coordinate") {
      expect(result.args.x).toEqual(0);
      expect(result.args.y).toEqual(0);
      expect(result.args.z).toEqual(0);
    }
  });
});
