import { ResourceUpdate } from "farmbot";

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
