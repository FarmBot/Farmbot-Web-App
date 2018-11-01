import { TaggedResource } from "farmbot";
import { arrayUnwrap } from "../resources/util";
import { newTaggedResource } from "../sync/actions";

export function fakeResource<T extends TaggedResource>(kind: T["kind"],
  body: T["body"]): T {
  return arrayUnwrap(newTaggedResource(kind, body));
}
