import { TaggedSequence } from "farmbot";

/** Determine if a sequence has parameters */
export function isParameterized(s: TaggedSequence["body"]) {
  const { body } = s.args.locals;
  return body && (body.length > 0);
}
