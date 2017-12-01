jest.mock("../../../../api/crud", () => ({
  overwrite: jest.fn(),
}));

import * as React from "react";
import { mount } from "enzyme";
import {
  seqDropDown, initialValue, InnerIf, IfParams, IfBlockDropDownHandler
} from "../index";
import {
  buildResourceIndex, FAKE_RESOURCES
} from "../../../../__test_support__/resource_index_builder";
import { Execute, If } from "farmbot";
import { TaggedSequence } from "../../../../resources/tagged_resources";
import { overwrite } from "../../../../api/crud";

const fakeResourceIndex = buildResourceIndex(FAKE_RESOURCES).index;
const fakeTaggedSequence = fakeResourceIndex
  .references[fakeResourceIndex.byKind.Sequence[0]] as TaggedSequence;
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
    resources: fakeResourceIndex
  };
}

const execute: Execute = { kind: "execute", args: { sequence_id: fakeId } };

describe("seqDropDown()", () => {
  it("returns list", () => {
    const list = seqDropDown(fakeResourceIndex);
    expect(list).toEqual([expectedItem]);
  });
});

describe("initialValue()", () => {
  it("returns dropdown initial value", () => {
    const item = initialValue(execute, fakeResourceIndex);
    expect(item).toEqual({ label: fakeName, value: fakeId });
  });
});

describe("<InnerIf />", () => {
  it("renders", () => {
    const wrapper = mount(<InnerIf {...fakeProps() } />);
    ["IF", "THEN", "ELSE"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("is recursive", () => {
    const p = fakeProps();
    p.currentStep.args._then = execute;
    const wrapper = mount(<InnerIf {...p } />);
    expect(wrapper.text()).toContain("Recursive condition");
  });
});

describe("IfBlockDropDownHandler()", () => {
  it("onChange()", () => {
    const { onChange } = IfBlockDropDownHandler(fakeProps(), "_else");
    onChange(expectedItem);
    const [argsList1] = (overwrite as jest.Mock).mock.calls;
    expect(argsList1[1].body[0].args._else).toEqual(execute);
    jest.clearAllMocks();
    onChange({ label: "None", value: "" });
    const [argsList2] = (overwrite as jest.Mock).mock.calls;
    expect(argsList2[1].body[0].args._else)
      .toEqual({ kind: "nothing", args: {} });
  });

  it("selectedItem()", () => {
    const p = fakeProps();
    p.currentStep.args._then = execute;
    const { selectedItem } = IfBlockDropDownHandler(p, "_then");
    const item = selectedItem();
    expect(item).toEqual(expectedItem);
  });

  it("selectedItem(): null", () => {
    const { selectedItem } = IfBlockDropDownHandler(fakeProps(), "_then");
    const item = selectedItem();
    expect(item).toEqual({ label: "None", value: "" });
  });
});
