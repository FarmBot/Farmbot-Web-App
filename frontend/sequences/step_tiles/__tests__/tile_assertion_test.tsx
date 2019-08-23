import React from "react";
import { shallow } from "enzyme";
import { TileAssertion, AssertionStepProps } from "../tile_assertion";
import { Wait } from "farmbot";
import { StepWrapper } from "../../step_ui/step_wrapper";
import { DeepPartial } from "redux";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";
import { renderCeleryNode } from "..";

const EMPTY: DeepPartial<AssertionStepProps> = {};

export const fakeAssertProps = (extras = EMPTY): AssertionStepProps => {
  const currentSequence = fakeSequence();
  const resources = buildResourceIndex().index;
  const props: AssertionStepProps = {
    currentSequence,
    currentStep: {
      kind: "assertion",
      args: {
        lua: "return 2 + 2 == 4",
        assertion_type: "continue",
        _then: {
          kind: "execute",
          args: {
            sequence_id: currentSequence.body.id || 0
          }
        }
      }
    },
    dispatch: jest.fn(),
    index: 1,
    resources,
    confirmStepDeletion: false,
  };

  return { ...props, ...(extras as AssertionStepProps) };
};

describe("renderer", () => {
  it("displays the correct component", () => {
    const props = fakeAssertProps();
    const actual = renderCeleryNode(props);
    const expected = <TileAssertion {...props} />;
    expect(actual).toEqual(expected);
  });
});

describe("<TileAssertion/>", () => {
  it("crashes on non-assertion steps", () => {
    const p = fakeAssertProps();
    const currentStep: Wait =
      ({ kind: "wait", args: { milliseconds: 1 } });
    const boom = () => TileAssertion({ ...p, currentStep });
    expect(boom).toThrow("Not an assertion");
  });

  it("renders default stuff", () => {
    const p = fakeAssertProps();
    const el = shallow(<TileAssertion {...p} />);
    // We test this component's subcomponents in
    // isolation- no need to dupliacte tests here.
    expect(el.find(StepWrapper).length).toBe(1);
  });
});
