import { ResourceUpdate } from "farmbot";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import {
  fakeTool,
  fakePlant,
  fakePoint
} from "../../../__test_support__/fake_state/resources";
import { betterMerge } from "../../../util";

type Args = Partial<ResourceUpdate["args"]>;

export function resourceUpdate(i: Args): ResourceUpdate {
  return {
    kind: "resource_update",
    args: {
      resource_type: "Other",
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
  betterMerge(fakeTool(), { body: { name: "T3", id: undefined } }),
]);
