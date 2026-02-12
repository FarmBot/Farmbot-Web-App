import React from "react";
import { render } from "@testing-library/react";
import {
  seqDropDown, InnerIf, IfBlockDropDownHandler, LHSOptions, ThenElseParams,
} from "../index";
import {
  buildResourceIndex,
} from "../../../../__test_support__/resource_index_builder";
import { Execute, If, TaggedSequence, ParameterApplication } from "farmbot";
import * as crud from "../../../../api/crud";
import {
  fakeSensor, fakePeripheral,
} from "../../../../__test_support__/fake_state/resources";
import { StepParams } from "../../../interfaces";
import { cloneDeep } from "lodash";
import {
  fakeStepParams,
} from "../../../../__test_support__/fake_sequence_step_data";

let overwriteSpy: jest.SpyInstance;

beforeEach(() => {
  overwriteSpy = jest.spyOn(crud, "overwrite").mockImplementation(jest.fn());
});

afterEach(() => {
  overwriteSpy.mockRestore();
});

const fakeResourceIndex = buildResourceIndex().index;
const fakeTaggedSequence = fakeResourceIndex
  .references[Object.keys(fakeResourceIndex.byKind.Sequence)[0]] as TaggedSequence;
const expectedItem = seqDropDown(fakeResourceIndex)[0];
const fakeId = expectedItem.value as number;

function fakeProps(): StepParams<If> {
  const currentStep: If = {
    kind: "_if",
    args: {
      lhs: "pin0",
      op: "is",
      rhs: 0,
      _then: { kind: "nothing", args: {} },
      _else: { kind: "nothing", args: {} }
    }
  };
  return {
    ...fakeStepParams(currentStep),
    currentSequence: fakeTaggedSequence,
    resources: fakeResourceIndex,
    showPins: true,
  };
}

const execute: Execute = { kind: "execute", args: { sequence_id: fakeId } };

describe("seqDropDown()", () => {
  it("returns list", () => {
    const list = seqDropDown(fakeResourceIndex);
    expect(list).toEqual([expectedItem]);
  });
});

describe("LHSOptions()", () => {
  it("returns positions, peripherals, sensors, pins", () => {
    const s = fakeSensor();
    const p = fakePeripheral();
    s.body.label = "displayed";
    p.body.label = "displayed";
    const ri = buildResourceIndex([s, p]);
    const result = JSON.stringify(LHSOptions(ri.index, true));
    expect(result).toContain("displayed");
    expect(result).toContain("Pin 25");
  });
});

describe("<InnerIf />", () => {
  it("renders", () => {
    const { container } = render(<InnerIf {...fakeProps()} />);
    const inputs = container.querySelectorAll("input");
    const labels = container.querySelectorAll("label");
    const buttons = container.querySelectorAll("button");
    expect(inputs.length).toEqual(2);
    expect(labels.length).toEqual(5);
    expect(buttons.length).toEqual(4);
    expect((inputs[0] as HTMLInputElement).placeholder).toEqual("If ...");
    expect(labels[0]?.textContent).toEqual("Variable");
    expect(buttons[0]?.textContent).toEqual("Pin 0");
    expect(labels[1]?.textContent).toEqual("Operator");
    expect(buttons[1]?.textContent).toEqual("is");
    expect(labels[2]?.textContent).toEqual("Value");
    expect((inputs[1] as HTMLInputElement).value).toEqual("0");
    expect(labels[3]?.textContent).toEqual("Then Execute");
    expect(buttons[2]?.textContent).toEqual("None");
    expect(labels[4]?.textContent).toEqual("Else Execute");
    expect(buttons[3]?.textContent).toEqual("None");
  });

  it("is recursive", () => {
    const p = fakeProps();
    p.currentStep.args._then = execute;
    const { container } = render(<InnerIf {...p} />);
    expect(container.innerHTML).toContain("fa-exclamation-triangle");
  });
});

describe("IfBlockDropDownHandler()", () => {
  const fakeThenElseProps = (thenElseKey: "_then" | "_else"): ThenElseParams => ({
    ...fakeProps(),
    thenElseKey,
  });

  it("onChange()", () => {
    const { onChange } = IfBlockDropDownHandler(fakeThenElseProps("_else"));

    onChange(expectedItem);
    expect(crud.overwrite).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        body: [{
          kind: "_if",
          args: expect.objectContaining({ _else: cloneDeep(execute) })
        }]
      }));

    jest.clearAllMocks();

    onChange({ label: "None", value: "" });
    expect(crud.overwrite).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        body: [{
          kind: "_if",
          args: expect.objectContaining({
            _else: { kind: "nothing", args: {} }
          })
        }]
      }));
  });

  it("selectedItem()", () => {
    const p = fakeThenElseProps("_then");
    const [{ value: sequence_id }] = seqDropDown(p.resources);
    p.currentStep.args._then = {
      kind: "execute",
      args: { sequence_id: sequence_id as number },
    };
    const { selectedItem } = IfBlockDropDownHandler(p);
    const item = selectedItem();
    expect(item.value).toEqual(sequence_id);
  });

  it("selectedItem(): null", () => {
    const { selectedItem } = IfBlockDropDownHandler(fakeThenElseProps("_then"));
    const item = selectedItem();
    expect(item).toEqual({ label: "None", value: "", isNull: true });
  });

  it("edits variables", () => {
    const variables: ParameterApplication = {
      kind: "parameter_application",
      args: {
        label: "label", data_value: {
          kind: "coordinate", args: { x: 0, y: 0, z: 0 }
        }
      }
    };
    const p = fakeThenElseProps("_then");
    const { assignVariable } =
      IfBlockDropDownHandler(p);
    assignVariable([])(variables);
    expect(p.currentStep.args._then.body).toEqual([variables]);
  });
});
