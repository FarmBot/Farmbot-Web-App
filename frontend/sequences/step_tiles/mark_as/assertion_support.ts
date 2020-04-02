import { ResourceUpdate, TaggedSequence, resource_type } from "farmbot";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import {
  fakeTool,
  fakePlant,
  fakePoint,
  fakeSequence,
  fakeWeed,
} from "../../../__test_support__/fake_state/resources";
import { betterMerge } from "../../../util";
import { MarkAs } from "../mark_as";
import { ResourceUpdateArgs } from "./interfaces";

export function resourceUpdate(i: ResourceUpdateArgs): ResourceUpdate {
  return {
    kind: "resource_update",
    args: {
      resource_type: "Other" as resource_type,
      resource_id: 1,
      label: "some_attr",
      value: "some_value",
      ...i
    }
  };
}

export const markAsResourceFixture = () => buildResourceIndex([
  betterMerge(fakeTool(), { body: { name: "T1", id: 1 } }),
  fakePlant(),
  betterMerge(fakeTool(), { body: { name: "T2", id: 2 } }),
  betterMerge(fakePoint(), { body: { name: "my point", id: 7 } }),
  betterMerge(fakeWeed(), { body: { name: "weed 1", id: 8 } }),
  betterMerge(fakeTool(), { body: { name: "T3", id: undefined } }),
]);

export function fakeMarkAsProps() {
  const steps: TaggedSequence["body"]["body"] = [
    {
      kind: "resource_update",
      args: {
        resource_type: "Device",
        resource_id: 0,
        label: "mounted_tool_id",
        value: 0
      }
    },
  ];
  const currentSequence: TaggedSequence =
    betterMerge(fakeSequence(), { body: { body: steps } });
  const props: MarkAs["props"] = {
    currentSequence,
    dispatch: jest.fn(),
    index: 0,
    currentStep: steps[0],
    resources: buildResourceIndex([currentSequence]).index,
    confirmStepDeletion: false
  };

  return props;
}
