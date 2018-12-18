import * as React from "react";
import {
  ExecuteBlock,
  ExecBlockParams,
  RefactoredExecuteBlock
} from "../tile_execute";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { Execute } from "farmbot";
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
});
