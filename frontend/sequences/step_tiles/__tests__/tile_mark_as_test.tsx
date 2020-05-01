import * as React from "react";
import { TileMarkAs } from "../tile_mark_as";
import { mount } from "enzyme";
import {
  fakeSequence, fakePlant,
} from "../../../__test_support__/fake_state/resources";
import { UpdateResource, Wait } from "farmbot/dist";
import { StepParams } from "../../interfaces";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";

describe("<TileMarkAs />", () => {
  const fakeProps = (): StepParams => {
    const currentStep: UpdateResource = {
      kind: "update_resource",
      args: {
        resource: {
          kind: "resource",
          args: { resource_type: "Plant", resource_id: 1 }
        },
      },
      body: [
        { kind: "pair", args: { label: "some_attr", value: "some_value" } },
      ],
    };
    const plant = fakePlant();
    plant.body.id = 1;
    return {
      currentSequence: fakeSequence(),
      currentStep: currentStep,
      dispatch: jest.fn(),
      index: 0,
      resources: buildResourceIndex([plant]).index,
      confirmStepDeletion: false,
    };
  };

  it("renders if step", () => {
    const wrapper = mount(<TileMarkAs {...fakeProps()} />);
    ["Mark", "Strawberry plant 1 (100, 200, 0)", "field", "as"]
      .map(string => expect(wrapper.text()).toContain(string));
  });

  it("doesn't render update_resource step", () => {
    const p = fakeProps();
    const waitStep: Wait = { kind: "wait", args: { milliseconds: 0 } };
    p.currentStep = waitStep;
    const wrapper = mount(<TileMarkAs {...p} />);
    expect(wrapper.text()).toEqual("Expected `update_resource` node");
  });
});
