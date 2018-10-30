import { Resource as Res, TaggedResource } from "farmbot";
import { arrayUnwrap } from "../resources/util";
import { newTaggedResource } from "../sync/actions";

export function fakeResource<T extends TaggedResource>(kind: T["kind"],
  body: T["body"]): Res<T["kind"], T["body"]> {
  return arrayUnwrap(newTaggedResource(kind, body));
}
