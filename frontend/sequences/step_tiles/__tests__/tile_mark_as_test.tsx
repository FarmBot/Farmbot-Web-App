import React from "react";
import { TileMarkAs } from "../tile_mark_as";
import { mount } from "enzyme";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { UpdateResource } from "farmbot";
import { StepParams } from "../../interfaces";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

describe("<TileMarkAs />", () => {
  const fakeProps = (): StepParams<UpdateResource> => {
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
      ...fakeStepParams(currentStep),
      resources: buildResourceIndex([plant]).index,
    };
  };

  it("renders if step", () => {
    const wrapper = mount(<TileMarkAs {...fakeProps()} />);
    ["Mark", "Strawberry plant 1 (100, 200, 0)", "property", "as"]
      .map(string => expect(wrapper.text()).toContain(string));
  });
});
