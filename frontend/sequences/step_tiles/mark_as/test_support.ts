import {
  UpdateResource, TaggedSequence, resource_type, Pair, Resource, Identifier,
} from "farmbot";
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

export function updateResource(
  resource?: Resource | Identifier, pairArgs?: Pair["args"]): UpdateResource {
  return {
    kind: "update_resource",
    args: {
      resource: resource || {
        kind: "resource", args: {
          resource_type: "Other" as resource_type,
          resource_id: 1,
        }
      },
    },
    body: [{
      kind: "pair", args: {
        label: "some_attr",
        value: "some_value",
        ...pairArgs,
      }
    }],
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
      kind: "update_resource",
      args: {
        resource: {
          kind: "resource",
          args: { resource_id: 0, resource_type: "Device" }
        }
      },
      body: [{ kind: "pair", args: { label: "mounted_tool_id", value: 0 } }],
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
