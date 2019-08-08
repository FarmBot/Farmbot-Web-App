jest.mock("../../../../api/crud", () => ({
  overwrite: jest.fn(),
}));

import * as React from "react";
import { mount } from "enzyme";
import {
  seqDropDown,
  InnerIf,
  IfParams,
  IfBlockDropDownHandler,
  LHSOptions,
  ThenElseParams
} from "../index";
import {
  buildResourceIndex, FAKE_RESOURCES
} from "../../../../__test_support__/resource_index_builder";
import { Execute, If, TaggedSequence, ParameterApplication } from "farmbot";
import { overwrite } from "../../../../api/crud";
import {
  fakeSensor, fakePeripheral
} from "../../../../__test_support__/fake_state/resources";

const fakeResourceIndex = buildResourceIndex(FAKE_RESOURCES).index;
const fakeTaggedSequence = fakeResourceIndex
  .references[Object.keys(fakeResourceIndex.byKind.Sequence)[0]] as TaggedSequence;
const fakeId = fakeTaggedSequence && fakeTaggedSequence.body.id || 0;
const fakeName = fakeTaggedSequence && fakeTaggedSequence.body.name || "";
const expectedItem = { label: fakeName, value: fakeId };

function fakeProps(): IfParams {
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
    currentSequence: fakeTaggedSequence,
    currentStep,
    dispatch: jest.fn(),
    index: 0,
    resources: fakeResourceIndex,
    shouldDisplay: jest.fn(),
    confirmStepDeletion: false,
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
    const wrapper = mount(<InnerIf {...fakeProps()} />);
    ["IF", "THEN", "ELSE"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("is recursive", () => {
    const p = fakeProps();
    p.currentStep.args._then = execute;
    const wrapper = mount(<InnerIf {...p} />);
    expect(wrapper.text()).toContain("Recursive condition");
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
    expect(overwrite).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        body: [{
          kind: "_if",
          args: expect.objectContaining({ _else: execute })
        }]
      }));

    jest.clearAllMocks();

    onChange({ label: "None", value: "" });
    expect(overwrite).toHaveBeenCalledWith(
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
    p.currentStep.args._then = execute;
    const { selectedItem } = IfBlockDropDownHandler(p);
    const item = selectedItem();
    expect(item).toEqual(expectedItem);
  });

  it("selectedItem(): null", () => {
    const { selectedItem } = IfBlockDropDownHandler(fakeThenElseProps("_then"));
    const item = selectedItem();
    expect(item).toEqual({ label: "None", value: "" });
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
